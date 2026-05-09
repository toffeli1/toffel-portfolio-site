// Derived portfolio calculation layer.
//
// Source-of-truth split:
//   - data/sleeveHoldings.ts (rawHoldings) holds qualitative + manual fallback
//     fields (portfolioWeightPct, returnPct).
//   - lib/positionLots.ts (positionLots) holds FIFO-surviving lot share counts.
//   - Live quotes come from lib/quoteCache.ts (server) or QuotesProvider (client).
//
// This module derives current-state values (weights, returns, status) from those
// inputs without exposing dollar amounts or share counts in the return shape.
// Internal math uses values; public surface only emits percentages.

import { positionLots } from "./positionLots";
import type { SleeveHolding } from "@/data/sleeveHoldings";
import type { Quote, QuoteMap } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────

export type WeightStatus =
  | "No target"
  | "Underweight"
  | "In range"
  | "Watch"
  | "Review for trim";

export interface DerivedSleeveHolding {
  ticker: string;
  company: string;
  account: string;
  /** Asset type: Equity, ETF, Crypto-linked ETF, etc. */
  category: string;
  subcategory?: string;
  thesis?: string;
  currentPrice: number | null;
  /** Resolved weight: derived from live data when possible, else fallback. */
  portfolioPct: number;
  /** Whether portfolioPct came from live (shares × price) math. */
  isLive: boolean;
  /** Whether this specific holding had its own live shares × price input. */
  hasLiveShares: boolean;
  /** Resolved return %. Live-computed when possible, else static fallback. */
  returnPct: number | undefined;
  /** Weight × return / 100 — percentage-point contribution. */
  returnContribution: number;
  /** Decimal target (0.10 = 10%). */
  targetWeight?: number;
  /** Decimal max band (0.115 = 11.5%). */
  maxWeight?: number;
  weightStatus: WeightStatus;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Sum of FIFO-surviving shares for a ticker from positionLots.
 * Returns undefined if no lots are tracked for this ticker.
 */
export function getSurvivingShares(ticker: string): number | undefined {
  const lots = positionLots[ticker];
  if (!lots || lots.length === 0) return undefined;
  return lots.reduce((s, l) => s + (l.shares ?? 0), 0);
}

/** ((current / cost) - 1) * 100 */
export function calculateReturnPct(currentPrice: number, avgCost: number): number {
  return ((currentPrice / avgCost) - 1) * 100;
}

/** weight × return / 100, in percentage-point units. */
export function calculateReturnContribution(
  portfolioPct: number,
  returnPct: number | undefined
): number {
  if (returnPct === undefined) return 0;
  return (portfolioPct / 100) * returnPct;
}

export function computeWeightStatus(
  currentPct: number,
  targetWeight?: number,
  maxWeight?: number
): WeightStatus {
  if (targetWeight === undefined) return "No target";
  const targetPct = targetWeight * 100;
  const maxPct = (maxWeight ?? targetWeight * 1.15) * 100;

  if (currentPct < targetPct * 0.80) return "Underweight";
  if (currentPct <= targetPct) return "In range";
  if (currentPct <= maxPct) return "Watch";
  return "Review for trim";
}

// ── Derive ───────────────────────────────────────────────────────────────────

/**
 * Derive sleeve holdings directly from raw shares × live price.
 *
 * Source of truth: each holding's manually-maintained `shares` field combined
 * with its live quote. No inference from partial coverage — every ticker with
 * shares + a valid live quote contributes to the live denominator. Tickers
 * without shares OR without a quote fall back to their static
 * portfolioWeightPct *for that ticker only*; the live denominator is not
 * shrunk. A development-only console.warn names the fallback tickers so
 * silent drift gets noticed.
 *
 * Returns derived holdings in the same order as rawHoldings.
 */
export function deriveSleeveHoldings(
  rawHoldings: SleeveHolding[],
  quoteMap: QuoteMap | null,
  avgCostFor: (ticker: string) => number | null
): DerivedSleeveHolding[] {
  // Pass 1: compute per-ticker live value when shares + quote are both present.
  const liveValues: Record<string, number> = {};
  let totalLiveValue = 0;
  const fallbackTickers: string[] = [];

  for (const h of rawHoldings) {
    const price = quoteMap?.[h.ticker]?.price ?? null;
    if (h.shares !== undefined && price !== null && price > 0) {
      const value = h.shares * price;
      liveValues[h.ticker] = value;
      totalLiveValue += value;
    } else {
      fallbackTickers.push(h.ticker);
    }
  }

  if (fallbackTickers.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn(
      `[deriveSleeveHoldings] Falling back to static weights for: ${fallbackTickers.join(", ")} (missing shares or live quote)`
    );
  }

  // Pass 2: build derived rows.
  return rawHoldings.map((h): DerivedSleeveHolding => {
    const quote: Quote | undefined = quoteMap?.[h.ticker];
    const price = quote?.price ?? null;
    const avgCost = avgCostFor(h.ticker);
    const liveValue = liveValues[h.ticker];
    const hasLiveShares = liveValue !== undefined;

    // Resolve weight.
    let portfolioPct: number;
    let isLive: boolean;
    if (hasLiveShares && totalLiveValue > 0) {
      portfolioPct = (liveValue / totalLiveValue) * 100;
      isLive = true;
    } else {
      portfolioPct = h.portfolioWeightPct;
      isLive = false;
    }

    // Resolve return %.
    let returnPct: number | undefined = h.returnPct;
    if (avgCost !== null && price !== null && price > 0) {
      returnPct = calculateReturnPct(price, avgCost);
    }

    const returnContribution = calculateReturnContribution(portfolioPct, returnPct);

    return {
      ticker: h.ticker,
      company: h.company,
      account: "Roth Retirement Account",
      category: h.assetType,
      subcategory: h.subcategory,
      thesis: h.thesis,
      currentPrice: price,
      portfolioPct,
      isLive,
      hasLiveShares,
      returnPct,
      returnContribution,
      targetWeight: h.targetWeight,
      maxWeight: h.maxWeight,
      weightStatus: computeWeightStatus(portfolioPct, h.targetWeight, h.maxWeight),
    };
  });
}

// ── Aggregations (operate on derived holdings) ───────────────────────────────

/** Sum of returnContribution across all derived holdings. */
export function calculateWeightedReturnContribution(
  derived: DerivedSleeveHolding[]
): number {
  return derived.reduce((s, h) => s + h.returnContribution, 0);
}

/** Herfindahl-Hirschman Index using derived weights (0 to 1 scale). */
export function calculateHHI(derived: DerivedSleeveHolding[]): number {
  const totalPct = derived.reduce((s, h) => s + h.portfolioPct, 0) || 1;
  return derived.reduce((s, h) => {
    const w = h.portfolioPct / totalPct;
    return s + w * w;
  }, 0);
}

/** 1 / HHI — equivalent number of equal-weight positions. */
export function calculateEffectiveN(derived: DerivedSleeveHolding[]): number {
  const hhi = calculateHHI(derived);
  return hhi === 0 ? 0 : 1 / hhi;
}

/** Sum of top-N portfolio percentages, sorted desc. */
export function calculateTopNConcentration(
  derived: DerivedSleeveHolding[],
  n: number
): number {
  return [...derived]
    .sort((a, b) => b.portfolioPct - a.portfolioPct)
    .slice(0, n)
    .reduce((s, h) => s + h.portfolioPct, 0);
}

/** Whether any holding in the derived set used live shares × price math. */
export function hasAnyLiveData(derived: DerivedSleeveHolding[]): boolean {
  return derived.some((h) => h.isLive);
}
