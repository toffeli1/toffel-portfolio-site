// Live period-return feed for the portfolio heatmap.
// Returns a public-safe map: { [ticker]: { return1M, return3M, return6M, return12M } }.
// Only market-derived trailing returns surface — no prices, shares, or cost basis.
//
// "Since purchase" is intentionally NOT computed here: it depends on curated
// cost basis, whose price scale doesn't always line up with the live feed, so
// the client keeps its curated static value for that window and only the four
// market windows auto-update. Results are cached in-memory per ticker so repeat
// traffic within the TTL window doesn't re-hit Yahoo.

import { NextResponse } from "next/server";
import { holdings } from "@/data/holdings";
import { rothIraHoldings } from "@/data/sleeveHoldings";
import {
  fetchDailyCloses,
  trailingReturns,
  type PeriodReturns,
} from "@/lib/periodReturns";

export const dynamic = "force-dynamic";

type MarketReturns = Omit<PeriodReturns, "sincePurchase">;

const TTL_MS = 15 * 60 * 1_000;
const cache = new Map<string, { data: MarketReturns; ts: number }>();

// Only serve tickers the site actually tracks — never fetch arbitrary symbols.
const KNOWN = new Set<string>([
  ...holdings.map((h) => h.ticker),
  ...rothIraHoldings.map((h) => h.ticker),
]);

const round = (v: number | undefined): number | undefined =>
  v == null || !isFinite(v) ? undefined : Math.round(v * 100) / 100;

async function computeFor(ticker: string): Promise<MarketReturns | null> {
  const points = await fetchDailyCloses(ticker);
  const tr = trailingReturns(points);
  if (!tr) return null;

  return {
    return1M: round(tr.returns.return1M),
    return3M: round(tr.returns.return3M),
    return6M: round(tr.returns.return6M),
    return12M: round(tr.returns.return12M),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get("tickers") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const tickers = [...new Set(requested)].filter((t) => KNOWN.has(t));
  if (tickers.length === 0) {
    return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } });
  }

  const now = Date.now();
  const result: Record<string, MarketReturns> = {};
  const toFetch: string[] = [];

  for (const t of tickers) {
    const entry = cache.get(t);
    if (entry && now - entry.ts < TTL_MS) result[t] = entry.data;
    else toFetch.push(t);
  }

  await Promise.all(
    toFetch.map(async (t) => {
      try {
        const data = await computeFor(t);
        if (data) {
          cache.set(t, { data, ts: Date.now() });
          result[t] = data;
        }
      } catch (err) {
        console.error(`[api/returns] compute failed for ${t}:`, err);
        // Omit — client falls back to its static values.
      }
    })
  );

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
