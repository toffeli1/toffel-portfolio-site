import { positionAverageCost } from "./positionLots";
import { holdings } from "@/data/holdings";

// Build a quick lookup of explicit entry prices declared on holdings.
const HOLDING_ENTRY_PRICE: Record<string, number | undefined> = {};
for (const h of holdings) {
  if (h.entryPrice !== undefined) HOLDING_ENTRY_PRICE[h.ticker] = h.entryPrice;
}

// Sleeve-specific overrides for tickers with materially different entry prices per sleeve.
const SLEEVE_OVERRIDES: Record<string, Partial<Record<string, number>>> = {
  // SMH: Roth IRA lot entered Jan 26, 2026 @ $398.63.
  // ETFs sleeve cost basis is older and untracked — no entry for "etfs".
  SMH: { "roth-ira": 398.63 },
};

/** ((currentPrice / avgCost) - 1) * 100 */
export function computeReturnPct(avgCost: number, currentPrice: number): number {
  return ((currentPrice / avgCost) - 1) * 100;
}

/**
 * Average cost per share for a ticker, optionally scoped to a sleeve slug.
 * Returns null when no cost basis is available (untracked entry, recurring lots, wrong sleeve).
 */
export function getAvgCost(ticker: string, sleeve?: string): number | null {
  // First prefer an explicit entry price declared on the holding itself.
  const holdingEntry = HOLDING_ENTRY_PRICE[ticker];
  if (holdingEntry !== undefined) return holdingEntry;
  if (sleeve !== undefined) {
    const overrides = SLEEVE_OVERRIDES[ticker];
    if (overrides !== undefined) {
      return overrides[sleeve] ?? null;
    }
  }
  const val = (positionAverageCost as Record<string, number | undefined>)[ticker];
  return val ?? null;
}
