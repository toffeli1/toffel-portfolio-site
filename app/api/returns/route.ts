// Live period-return feed for the portfolio heatmap.
// Returns a public-safe map: { [ticker]: { sincePurchase, return1M, return3M, return6M, return12M } }.
// Only percentages surface — no prices, shares, or cost basis.
//
// Trailing (1M/3M/6M/12M) returns come from Yahoo daily closes. "Since purchase"
// is derived server-side from cost basis (lib/positionLots) vs. the latest close.
//
// IMPORTANT: cost basis in positionAverageCost MUST be kept in split-ADJUSTED
// terms so it lines up with the split-adjusted live feed. A stale pre-split
// basis produces a nonsensical since-purchase (e.g. CRWD before its 4:1 split
// adjustment read −72%). Results are cached in-memory per ticker so repeat
// traffic within the TTL window doesn't re-hit Yahoo.

import { NextResponse } from "next/server";
import { holdings } from "@/data/holdings";
import { rothIraHoldings } from "@/data/sleeveHoldings";
import { positionAverageCost } from "@/lib/positionLots";
import {
  fetchDailyCloses,
  trailingReturns,
  type PeriodReturns,
} from "@/lib/periodReturns";

export const dynamic = "force-dynamic";

const TTL_MS = 15 * 60 * 1_000;
const cache = new Map<string, { data: PeriodReturns; ts: number }>();

// Only serve tickers the site actually tracks — never fetch arbitrary symbols.
const KNOWN = new Set<string>([
  ...holdings.map((h) => h.ticker),
  ...rothIraHoldings.map((h) => h.ticker),
]);

// SMH's Roth lot has a distinct cost basis from the brokerage SMH position.
function costBasisFor(ticker: string): number | undefined {
  if (ticker === "SMH") return positionAverageCost["SMH_ROTH"];
  return positionAverageCost[ticker];
}

const round = (v: number | undefined): number | undefined =>
  v == null || !isFinite(v) ? undefined : Math.round(v * 100) / 100;

async function computeFor(ticker: string): Promise<PeriodReturns | null> {
  const points = await fetchDailyCloses(ticker);
  const tr = trailingReturns(points);
  if (!tr) return null;

  const data: PeriodReturns = {
    return1M: round(tr.returns.return1M),
    return3M: round(tr.returns.return3M),
    return6M: round(tr.returns.return6M),
    return12M: round(tr.returns.return12M),
  };
  const avgCost = costBasisFor(ticker);
  if (avgCost && avgCost > 0) {
    data.sincePurchase = round(((tr.last - avgCost) / avgCost) * 100);
  }
  return data;
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
  const result: Record<string, PeriodReturns> = {};
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
