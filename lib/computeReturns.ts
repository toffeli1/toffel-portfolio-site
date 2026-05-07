// Live return-since-entry computation. Combines broker-provided average cost
// (lib/positionLots.ts) with the most recent cached live quote (lib/quoteCache.ts).
//
// Returns undefined on cache miss or missing avgCost — callers should fall back
// to the static returnPct field in the holdings data so a temporarily empty
// quote cache never causes a position to disappear from the AI context.

import { positionAverageCost } from "./positionLots";
import { getCachedQuote } from "./quoteCache";

export function computeReturnPct(
  ticker: string,
  avgCostOverride?: number
): number | undefined {
  const avgCost = avgCostOverride ?? positionAverageCost[ticker];
  if (!avgCost) return undefined;

  const quote = getCachedQuote(ticker);
  if (!quote || quote.price === null) return undefined;

  return ((quote.price - avgCost) / avgCost) * 100;
}
