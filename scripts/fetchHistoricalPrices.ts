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
  // `close`, deliberately NOT `adjclose`.
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
  const series: Record<string, number> = {};
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null || !isFinite(c)) continue;
    const d = new Date(ts[i] * 1000).toISOString().slice(0, 10);
    series[d] = c;
  }
  const splits = r.events?.splits
    ? Object.values(r.events.splits as Record<string, { date: number; numerator: number; denominator: number }>)
        .map((s) => ({
          date: new Date(s.date * 1000).toISOString().slice(0, 10),
          ratio: s.numerator / s.denominator,
        }))
    : [];
  return { series, splits };
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

  // Benchmarks are public but cached alongside for a single consistent calendar.
  const symbols = [...tickers, "^SP500TR"];
  const series: Record<string, Record<string, number>> = {};
  const splits: Record<string, { date: string; ratio: number }[]> = {};

  for (const s of symbols) {
    try {
      const { series: sv, splits: sp } = await fetchDaily(s, FROM);
      series[s] = sv;
      if (sp.length) splits[s] = sp;
      console.log(`  ${s.padEnd(10)} ${Object.keys(sv).length} closes${sp.length ? ` · ${sp.length} split(s)` : ""}`);
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

  writeFileSync(DEST, JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), series, splits, tradingDays }, null, 2) + "\n");
  console.log(`\nWrote ${DEST} (PRIVATE — gitignored). ${tradingDays.length} trading days.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
