// ─── Public-safe current-book snapshot for /performance ───────────────────────
// Weights, tickers, and themes only — no dollar amounts. Update by replacing
// data/toffel_performance_holdings_public.json and redeploying.

import raw from "./toffel_performance_holdings_public.json";

export interface PerformanceHoldingPosition {
  ticker: string;
  name: string;
  weightPct: number;
  theme: string;
  researchUrl?: string;
}

export interface PerformanceHoldingsData {
  asOf: string;
  asOfNote: string;
  positions: PerformanceHoldingPosition[];
}

export const performanceHoldings: PerformanceHoldingsData = raw as PerformanceHoldingsData;

/** Positions above this weight are flagged — matches the stated internal
 *  single-name cap for non-index, non-cash holdings. */
export const CONCENTRATION_CAP_PCT = 10.0;

export function isFlaggedConcentration(p: PerformanceHoldingPosition): boolean {
  if (p.theme === "Core index" || p.theme === "Cash") return false;
  return p.weightPct > CONCENTRATION_CAP_PCT;
}
