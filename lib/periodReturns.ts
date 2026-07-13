// Server-only — trailing period-return computation for the portfolio heatmap.
// Pulls a year of daily closes from Yahoo (keyless) and derives 1M/3M/6M/12M
// total returns; "since purchase" is layered on in the route from cost basis.
// Do not import in client components.

import type { HistoricalPoint } from "./types";

export interface PeriodReturns {
  sincePurchase?: number;
  return1M?: number;
  return3M?: number;
  return6M?: number;
  return12M?: number;
}

// Calendar-day lookbacks per trailing window.
const DAYS: Record<"return1M" | "return3M" | "return6M" | "return12M", number> = {
  return1M: 30,
  return3M: 91,
  return6M: 182,
  return12M: 365,
};

/**
 * Fetch ~1y of daily closes for a symbol. Requests daily granularity for the
 * full year directly (the shared provider caps daily ranges lower), so every
 * trailing window resolves against real daily data. Returns [] on any failure.
 */
export async function fetchDailyCloses(symbol: string): Promise<HistoricalPoint[]> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&range=1y`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; portfolio-site/1.0)",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return [];
    const ts: number[] = result.timestamp ?? [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
    const points: HistoricalPoint[] = [];
    for (let i = 0; i < ts.length; i++) {
      const t = ts[i];
      const c = closes[i];
      if (t && c != null && isFinite(c)) points.push({ t, c });
    }
    return points;
  } catch {
    return [];
  }
}

/**
 * Trailing total returns (%) from a daily close series. For each window, the
 * base is the last close on or before (latest − N days). Returns the latest
 * close alongside so the caller can derive since-purchase from cost basis.
 */
export function trailingReturns(
  points: HistoricalPoint[]
): { last: number; returns: Omit<PeriodReturns, "sincePurchase"> } | null {
  if (points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const last = sorted[sorted.length - 1];
  const returns: Omit<PeriodReturns, "sincePurchase"> = {};

  for (const key of Object.keys(DAYS) as (keyof typeof DAYS)[]) {
    const target = last.t - DAYS[key] * 86400;
    let base = sorted[0];
    for (const p of sorted) {
      if (p.t <= target) base = p;
      else break;
    }
    if (base.c > 0) returns[key] = ((last.c - base.c) / base.c) * 100;
  }
  return { last: last.c, returns };
}
