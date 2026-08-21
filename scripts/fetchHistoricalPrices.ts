// ─── Historical price cache builder ───────────────────────────────────────────
//   npx tsx scripts/fetchHistoricalPrices.ts
//
// Writes data/priceCache.local.json — PRIVATE (prices), covered by the
// *.local.json ignore rule. Caching locally means the build and the
// reconstruction never depend on a live network call.
//
// Tickers are read from the private ledger so the cache covers exactly what the
// reconstruction needs. Uses Yahoo's `close`, never `adjclose`: adjclose is
// back-adjusted for dividends, and multiplying it by the share count actually
// held on a past date misstates that date's value.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const LEDGER = "data/rothTransactions.local.json";
const DEST = "data/priceCache.local.json";
const FROM = "2025-07-01";

interface Row { [k: string]: unknown }

function collectTickers(rows: Row[]): string[] {
  const keys = ["ticker_symbol", "ticker", "symbol", "instrument", "security", "Symbol", "Ticker"];
  const out = new Set<string>();
  for (const r of rows) {
    for (const k of keys) {
      const v = r[k];
      if (typeof v === "string" && /^[A-Z.\-]{1,8}$/.test(v.trim())) out.add(v.trim());
    }
  }
  return [...out].sort();
}

async function fetchDaily(symbol: string, from: string) {
  const p1 = Math.floor(Date.parse(from) / 1000);
  const p2 = Math.floor(Date.now() / 1000);
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&period1=${p1}&period2=${p2}&events=split%2Cdiv`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; portfolio-site/1.0)", Accept: "application/json" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const r = j?.chart?.result?.[0];
  if (!r) throw new Error("no result");
  const ts: number[] = r.timestamp ?? [];
  // Two series, kept separate on purpose:
  //   close     — dividend-UNadjusted. Used to value holdings, because a
  //               dividend-adjusted close multiplied by a historical share count
  //               misstates that date's market value.
  //   adjclose  — dividend+split adjusted. Used ONLY to build a benchmark
  //               total-return series, where reinvested dividends belong.
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
  const adj: (number | null)[] = r.indicators?.adjclose?.[0]?.adjclose ?? [];
  const series: Record<string, number> = {};
  const adjSeries: Record<string, number> = {};
  for (let i = 0; i < ts.length; i++) {
    const d = new Date(ts[i] * 1000).toISOString().slice(0, 10);
    const c = closes[i];
    if (c != null && isFinite(c)) series[d] = c;
    const a = adj[i];
    if (a != null && isFinite(a)) adjSeries[d] = a;
  }
  const splits = r.events?.splits
    ? Object.values(r.events.splits as Record<string, { date: number; numerator: number; denominator: number }>)
        .map((s) => ({
          date: new Date(s.date * 1000).toISOString().slice(0, 10),
          ratio: s.numerator / s.denominator,
        }))
    : [];
  // Dividend EX-DATES. These are the attribution evidence for deciding which
  // ownership episode a cash distribution belongs to, which a pay-date-based
  // guess cannot establish.
  const dividends = r.events?.dividends
    ? Object.values(r.events.dividends as Record<string, { date: number; amount: number }>)
        .map((d) => ({
          exDate: new Date(d.date * 1000).toISOString().slice(0, 10),
          amount: d.amount,
        }))
        .sort((a, b) => a.exDate.localeCompare(b.exDate))
    : [];

  return { series, adjSeries, splits, dividends };
}

async function main() {
  if (!existsSync(LEDGER)) {
    console.error(`\n${LEDGER} not found.`);
    console.error("Place the private Robinhood export there, then re-run.\n");
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(LEDGER, "utf8"));
  const rows: Row[] = Array.isArray(raw) ? raw : (raw.transactions ?? raw.records ?? []);
  const tickers = collectTickers(rows);
  console.log(`Ledger rows: ${rows.length} · tickers: ${tickers.length}`);

  // Benchmarks cached alongside so every series shares one calendar.
  // QQQ is included because the Nasdaq-100 benchmark is proxied by its
  // total-return (adjusted-close) series; see data/benchmarks.ts.
  const symbols = [...tickers, "^SP500TR", "QQQ"];
  const series: Record<string, Record<string, number>> = {};
  const adjusted: Record<string, Record<string, number>> = {};
  const splits: Record<string, { date: string; ratio: number }[]> = {};
  const dividends: Record<string, { exDate: string; amount: number }[]> = {};

  for (const s of symbols) {
    try {
      const { series: sv, adjSeries: av, splits: sp, dividends: dv } = await fetchDaily(s, FROM);
      series[s] = sv;
      adjusted[s] = av;
      if (sp.length) splits[s] = sp;
      if (dv.length) dividends[s] = dv;
      console.log(`  ${s.padEnd(10)} ${Object.keys(sv).length} closes${sp.length ? ` · ${sp.length} split(s)` : ""}${dv.length ? ` · ${dv.length} div(s)` : ""}`);
    } catch (e) {
      console.warn(`  ${s.padEnd(10)} FAILED: ${e instanceof Error ? e.message : e}`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  // Trading calendar = UNION of every series' dates.
  //
  // Not the benchmark alone: Yahoo's ^SP500TR series is missing 2026-07-21 and
  // 07-22 even though every equity has them. Deriving the calendar from one
  // index punched phantom holidays into the reconstruction, which collapsed a
  // decision's two valuation closes onto the same date.
  const allDates = new Set<string>();
  for (const s of Object.values(series)) for (const d of Object.keys(s)) allDates.add(d);
  const tradingDays = [...allDates].sort();

  writeFileSync(DEST, JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), series, adjusted, splits, dividends, tradingDays }, null, 2) + "\n");
  console.log(`\nWrote ${DEST} (PRIVATE — gitignored). ${tradingDays.length} trading days.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
