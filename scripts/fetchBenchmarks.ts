// ─── Benchmark total-return series ────────────────────────────────────────────
//   npx tsx scripts/fetchBenchmarks.ts
//
// Writes data/benchmarkSeries.json — month-end index LEVELS for each benchmark.
// Committed on purpose: index levels are public data, unlike the portfolio's own
// NAVs (which stay in the gitignored seed).
//
// ── S&P 500 ─────────────────────────────────────────────────────────────────
// Source: ^SP500TR via the Yahoo Finance chart endpoint. This is the S&P 500
// TOTAL RETURN index — dividends reinvested — not SPY and not the price-only
// ^GSPC. Free, keyless, and validated to return full monthly history.
//
// ── Nasdaq-100 ──────────────────────────────────────────────────────────────
// PROXIED by Invesco QQQ total return (dividend- and split-adjusted closes).
//
// A reliable free historical feed for the official Nasdaq-100 Total Return Index
// (XNDX) does not exist: ^XNDX returns a single live datapoint at every
// interval/range, Nasdaq's index site serves a web app whose export endpoint
// 404s, and stooq is behind a JavaScript challenge. QQQ tracks the Nasdaq-100
// and its adjusted-close series reinvests distributions, which makes it a
// defensible free stand-in.
//
// It is NOT the official index, and the artifact says so. The public label reads
// "Nasdaq-100"; the source disclosure names the proxy explicitly. Only
// normalized index levels reach public output, never a QQQ share price.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface BenchmarkSpec {
  key: string;
  name: string;
  symbol?: string;
  totalReturn: boolean;
  sourceNote: string;
  unavailableReason?: string;
  /** True when `symbol` stands in for the named index rather than being it. */
  proxy?: boolean;
}

const SPECS: BenchmarkSpec[] = [
  {
    key: "sp500",
    name: "S&P 500",
    symbol: "^SP500TR",
    totalReturn: true,
    sourceNote:
      "S&P 500 Total Return index (^SP500TR) via Yahoo Finance chart API. Dividends reinvested. Free, no API key.",
  },
  {
    key: "nasdaq100",
    name: "Nasdaq-100",
    symbol: "QQQ",
    proxy: true,
    totalReturn: true,
    sourceNote:
      "Nasdaq-100 is proxied by Invesco QQQ total return because a reliable free historical Nasdaq-100 Total Return Index feed is not available. Uses dividend- and split-adjusted closes, so distributions are reinvested. This is a proxy, not the official XNDX index.",
  },
];

/** Last calendar-day close of each month, from daily/monthly Yahoo candles. */
async function fetchMonthEndLevels(
  symbol: string
): Promise<{ date: string; level: number }[]> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1mo&range=5y`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; portfolio-site/1.0)", Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error(`no result for ${symbol}`);

  const ts: number[] = r.timestamp ?? [];
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];

  const out: { date: string; level: number }[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null || !isFinite(c)) continue;
    // Yahoo's 1mo candles are stamped at the month START; the close is the
    // month's last trading close. Re-stamp to the month end so the series
    // aligns with month-end NAV marks.
    const d = new Date(ts[i] * 1000);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const monthEnd = new Date(Date.UTC(y, m + 1, 0));
    out.push({ date: monthEnd.toISOString().slice(0, 10), level: c });
  }
  return out;
}

async function main() {
  const output: Record<string, unknown> = { fetchedAt: new Date().toISOString().slice(0, 10) };
  const benchmarks: Record<string, unknown> = {};

  for (const spec of SPECS) {
    if (!spec.symbol) {
      console.log(`${spec.key.padEnd(10)} UNAVAILABLE — ${spec.unavailableReason}`);
      benchmarks[spec.key] = {
        key: spec.key,
        name: spec.name,
        totalReturn: spec.totalReturn,
        available: false,
        sourceNote: spec.sourceNote,
        unavailableReason: spec.unavailableReason,
        levels: [],
      };
      continue;
    }
    try {
      const levels = await fetchMonthEndLevels(spec.symbol);
      console.log(
        `${spec.key.padEnd(10)} ${levels.length} month-ends  ` +
          `${levels[0]?.date} → ${levels[levels.length - 1]?.date}  (${spec.symbol})`
      );
      benchmarks[spec.key] = {
        key: spec.key,
        name: spec.name,
        symbol: spec.symbol,
        // proxy = this symbol stands in for the named index rather than being
        // it. Consumers must disclose the substitution, never imply the symbol
        // IS the index.
        proxy: spec.proxy ?? false,
        totalReturn: spec.totalReturn,
        available: levels.length > 0,
        sourceNote: spec.sourceNote,
        levels,
      };
    } catch (err) {
      console.error(`${spec.key} FAILED:`, err instanceof Error ? err.message : err);
      benchmarks[spec.key] = {
        key: spec.key, name: spec.name, symbol: spec.symbol,
        totalReturn: spec.totalReturn, available: false,
        sourceNote: spec.sourceNote,
        unavailableReason: `Fetch failed: ${err instanceof Error ? err.message : String(err)}`,
        levels: [],
      };
    }
  }

  output.benchmarks = benchmarks;
  const dest = resolve(process.cwd(), "data/benchmarkSeries.json");
  writeFileSync(dest, JSON.stringify(output, null, 2) + "\n");
  console.log(`\nWrote ${dest}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
