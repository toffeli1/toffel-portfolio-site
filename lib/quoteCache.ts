// Server-side in-memory quote cache shared across route handlers and the
// Toffel AI live-quote tool. Persists across requests within a single
// serverless function instance (Vercel keeps a warm instance alive between
// invocations), so bursts of traffic to the same tickers within the TTL
// window do not re-hit Finnhub.
//
// The cache is intentionally small and simple — no eviction policy, no LRU.
// At 17 unique tickers on the site the working set fits in the Map without
// bound, and stale entries are simply ignored on read.

import type { Quote, QuoteMap } from "./types";

const TTL_MS = 60_000;

interface CacheEntry {
  quote: Quote;
  ts: number;
}

const cache = new Map<string, CacheEntry>();

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.ts < TTL_MS;
}

export function getCachedQuote(symbol: string): Quote | null {
  const entry = cache.get(symbol);
  if (!entry) return null;
  if (!isFresh(entry)) return null;
  return entry.quote;
}

export function setCachedQuote(symbol: string, quote: Quote): void {
  cache.set(symbol, { quote, ts: Date.now() });
}

/** Bucket symbols into cached + missing, fetch only the missing set, merge results. */
export async function getOrFetchQuotes(
  symbols: string[],
  fetcher: (missing: string[]) => Promise<QuoteMap>
): Promise<QuoteMap> {
  const result: QuoteMap = {};
  const missing: string[] = [];

  for (const sym of symbols) {
    const cached = getCachedQuote(sym);
    if (cached) {
      result[sym] = cached;
    } else {
      missing.push(sym);
    }
  }

  if (missing.length === 0) {
    return result;
  }

  const fresh = await fetcher(missing);
  for (const [sym, quote] of Object.entries(fresh)) {
    setCachedQuote(sym, quote);
    result[sym] = quote;
  }
  return result;
}
