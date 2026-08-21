// ─── Cost-basis lookup (retired data source) ──────────────────────────────────
// Per-share cost basis is PRIVATE and is no longer tracked in this repository.
// The sources this module used to read — lib/positionLots.ts's
// positionAverageCost, and entryPrice on data/holdings.ts — held real per-share
// prices in a public repo and have been removed.
//
// getAvgCost() therefore always returns null, and its callers already handle
// that: the return badge renders an em dash rather than a percentage. Return
// figures now come from the reconstruction pipeline instead, as
// percentage-only artifacts (data/performanceDerived.json).
//
// Kept as a stub rather than deleted so the dormant legacy routes still compile.
// Do NOT reintroduce a private price source here.

/** ((currentPrice / avgCost) - 1) * 100 */
export function computeReturnPct(avgCost: number, currentPrice: number): number {
  return ((currentPrice / avgCost) - 1) * 100;
}

/**
 * Always null: no cost-basis source is tracked in this repository.
 * Callers must treat null as "unavailable" and render nothing numeric.
 */
export function getAvgCost(_ticker: string, _sleeve?: string): number | null {
  return null;
}
