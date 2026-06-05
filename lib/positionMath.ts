// Additive, side-effect-free helpers for deriving position metrics from raw
// transaction data. New code should prefer these over duplicating math inline.
// Existing call sites stay as-is until they're individually refactored — these
// helpers do not break or replace anything that already works.

import {
  positionLots,
  positionEvents,
  positionAverageCost,
  type PurchaseLot,
  type SellEvent,
  type PositionEvents,
} from "./positionLots";

// ── Lookup helpers ──────────────────────────────────────────────────────────

/** Full historical events (buys + sells) for a ticker, if recorded. */
export function getTransactionsForTicker(ticker: string): PositionEvents | undefined {
  return positionEvents[ticker.toUpperCase()];
}

/** FIFO-resolved surviving lots for a ticker (post all known sells). */
export function getCurrentLotsForTicker(ticker: string): PurchaseLot[] | undefined {
  return positionLots[ticker.toUpperCase()];
}

/**
 * Chart marker events for a ticker. Prefers the full event log when available;
 * falls back to surviving lots (buys only) so older tickers keep working.
 */
export function getChartEventsForTicker(
  ticker: string
): { buys: PurchaseLot[]; sells: SellEvent[] } {
  const events = getTransactionsForTicker(ticker);
  if (events) return events;
  const lots = getCurrentLotsForTicker(ticker);
  return { buys: lots ?? [], sells: [] };
}

// ── Math helpers ────────────────────────────────────────────────────────────

/** Sum surviving shares across a lot list. */
export function calculateShares(lots: readonly PurchaseLot[]): number {
  return lots.reduce((sum, l) => sum + l.shares, 0);
}

/**
 * Weighted average cost from a lot list ($ total cost / total shares).
 * Returns 0 when there are no shares so callers can guard with truthy checks.
 */
export function calculateAverageCost(lots: readonly PurchaseLot[]): number {
  const shares = calculateShares(lots);
  if (shares <= 0) return 0;
  const cost = lots.reduce((sum, l) => sum + l.amountUsd, 0);
  return cost / shares;
}

/** Market value = shares × current price. */
export function calculateMarketValue(shares: number, price: number): number {
  return shares * price;
}

/** Return % = (price - avgCost) / avgCost × 100. */
export function calculateReturnPct(avgCost: number, price: number): number {
  if (avgCost <= 0) return 0;
  return ((price - avgCost) / avgCost) * 100;
}

/** Single-position weight = market value / account total, as a 0–100 percentage. */
export function calculatePositionWeight(marketValue: number, accountTotal: number): number {
  if (accountTotal <= 0) return 0;
  return (marketValue / accountTotal) * 100;
}

/**
 * Convenience: look up the published avg cost first (matches broker truth and
 * supports cross-sleeve keys like SMH_ROTH), falling back to deriving it from
 * the surviving lots. Manual override stays the source of truth where set.
 */
export function getAverageCost(ticker: string, sleeveKey?: string): number | undefined {
  const upper = ticker.toUpperCase();
  if (sleeveKey === "roth-ira" && upper === "SMH") {
    return positionAverageCost["SMH_ROTH"];
  }
  const published = positionAverageCost[upper];
  if (typeof published === "number") return published;
  const lots = getCurrentLotsForTicker(upper);
  if (!lots || lots.length === 0) return undefined;
  return calculateAverageCost(lots);
}
