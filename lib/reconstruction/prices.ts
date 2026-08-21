// ─── Historical price access ──────────────────────────────────────────────────
// Reads a locally cached price series so a build never depends on a live network
// call. The cache is data/priceCache.local.json — PRIVATE, because prices must
// never reach the public site, and covered by the *.local.json ignore rule.
//
// WHICH CLOSE, AND WHY
// We use Yahoo's `close`, never `adjclose`. `adjclose` is back-adjusted for
// dividends, so multiplying it by the share count actually held on a past date
// systematically misstates that date's market value — exactly the distortion the
// spec warns about. `close` is dividend-unadjusted, which is what a historical
// valuation needs.
//
// SPLITS
// Yahoo's `close` IS retroactively split-adjusted. Share counts from the ledger
// are as-traded. Mixing the two would misvalue any position that later split.
// Rather than un-adjust prices (error-prone), the engine keeps share counts on
// the same split basis as the price series by applying ledger split events —
// position VALUE is invariant to the basis, since a split scales shares up and
// price down by the same ratio. Any split present in the ledger is therefore
// processed explicitly, and unprocessed splits are reported rather than ignored.

import { readFileSync, existsSync } from "node:fs";

export interface SplitEvent {
  date: string;
  /** 8 means 8-for-1. */
  ratio: number;
}

export interface PriceCache {
  fetchedAt: string;
  /** ticker → { "YYYY-MM-DD": close } — Yahoo's SPLIT-ADJUSTED close. */
  series: Record<string, Record<string, number>>;
  /** Dividend+split adjusted closes. Benchmark total-return use ONLY. */
  adjusted?: Record<string, Record<string, number>>;
  /** ticker → split events, used to recover the as-traded price. */
  splits?: Record<string, SplitEvent[]>;
  /** ticker → dividend EX-dates, used to attribute distributions to episodes. */
  dividends?: Record<string, { exDate: string; amount: number }[]>;
  /** Dates the market was open, ascending. */
  tradingDays: string[];
}

/**
 * Factor converting a split-adjusted close back to the AS-TRADED price on that
 * date: the product of every split ratio occurring AFTER it.
 *
 * This is not a nicety. A holding in this book split 8-for-1, so its pre-split
 * closes come back divided by eight. Valuing a ledger share count (which is
 * as-traded) at the adjusted close understates that position by the full split
 * ratio — a material error in total portfolio value.
 */
export function splitFactorAfter(
  ticker: string,
  date: string,
  cache: PriceCache
): number {
  const events = cache.splits?.[ticker] ?? [];
  return events.reduce((f, e) => (e.date > date ? f * e.ratio : f), 1);
}

/** As-traded close: Yahoo's adjusted close scaled back up by later splits. */
export function asTradedClose(
  ticker: string,
  date: string,
  cache: PriceCache
): number | undefined {
  const adj = cache.series[ticker]?.[date];
  if (adj === undefined) return undefined;
  return adj * splitFactorAfter(ticker, date, cache);
}

const CACHE_PATH = "data/priceCache.local.json";

let cache: PriceCache | null = null;

export function priceCacheExists(): boolean {
  return existsSync(CACHE_PATH);
}

export function loadPriceCache(path = CACHE_PATH): PriceCache {
  if (cache) return cache;
  if (!existsSync(path)) {
    throw new Error(
      `[prices] ${path} not found. Run: npx tsx scripts/fetchHistoricalPrices.ts`
    );
  }
  cache = JSON.parse(readFileSync(path, "utf8")) as PriceCache;
  return cache;
}

/** Reset memoised cache — tests inject their own fixtures. */
export function __setPriceCacheForTest(c: PriceCache | null): void {
  cache = c;
}

/**
 * Close for a ticker on a date. Falls back to the most recent prior close
 * within `maxStaleDays` so a holiday or halted session doesn't blank a NAV;
 * returns undefined beyond that rather than carrying a stale mark forward.
 */
export function closeOn(
  ticker: string,
  date: string,
  maxStaleDays = 5
): number | undefined {
  const c = loadPriceCache();
  const series = c.series[ticker];
  if (!series) return undefined;
  const exact = series[date];
  if (exact !== undefined) return exact * splitFactorAfter(ticker, date, c);

  const target = Date.parse(date);
  let best: { date: string; value: number } | undefined;
  for (const [d, v] of Object.entries(series)) {
    const t = Date.parse(d);
    if (t > target) continue;
    const ageDays = (target - t) / 86_400_000;
    if (ageDays > maxStaleDays) continue;
    if (!best || d > best.date) best = { date: d, value: v };
  }
  return best ? best.value * splitFactorAfter(ticker, best.date, c) : undefined;
}

/** Trading days in [from, to], from the cache's calendar. */
export function tradingDaysBetween(from: string, to: string): string[] {
  const c = loadPriceCache();
  return c.tradingDays.filter((d) => d >= from && d <= to);
}
