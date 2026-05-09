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
 * Derive sleeve holdings from raw shares × live price with a denominator-
 * consistent fallback path. Three branches, all guaranteed to produce
 * weights that sum to ~100%:
 *
 * (a) ALL tickers have live (shares + valid quote)
 *     weight[t] = liveValue[t] / Σ liveValue × 100
 *
 * (b) SOME tickers live, SOME fallback
 *     impliedTotal = Σ liveValue / (Σ staticPct of live subset / 100)
 *     fallback estimate[t] = impliedTotal × staticPct[t] / 100
 *     totalAll = Σ liveValue + Σ fallbackEstimate (= impliedTotal × staticPctTotal / 100)
 *     weight[t] = (liveValue or fallbackEstimate) / totalAll × 100
 *     ➜ Live tickers do NOT inflate; their values divide by the SAME
 *       denominator as fallback tickers' estimated values.
 *
 * (c) NO live data
 *     weight[t] = staticPct[t] / staticPctTotal × 100
 *     ➜ Pure static fallback, normalized to 100%.
 *
 * In all three cases Σ weights = 100% (within floating-point tolerance).
 */
export function deriveSleeveHoldings(
  rawHoldings: SleeveHolding[],
  quoteMap: QuoteMap | null,
  avgCostFor: (ticker: string) => number | null
): DerivedSleeveHolding[] {
  // Pass 1: bucket tickers and accumulate sums.
  const liveValues: Record<string, number> = {};
  let totalLiveValue = 0;
  let staticPctLive = 0;
  let staticPctTotal = 0;
  const fallbackTickers: string[] = [];

  for (const h of rawHoldings) {
    staticPctTotal += h.portfolioWeightPct;
    const price = quoteMap?.[h.ticker]?.price ?? null;
    if (h.shares !== undefined && price !== null && price > 0) {
      const value = h.shares * price;
      liveValues[h.ticker] = value;
      totalLiveValue += value;
      staticPctLive += h.portfolioWeightPct;
    } else {
      fallbackTickers.push(h.ticker);
    }
  }

  // Compute the consistent denominator.
  const safeStaticPctTotal = staticPctTotal > 0 ? staticPctTotal : 1;
  let impliedTotal: number;
  let totalAll: number;
  let useStaticOnly: boolean;
  if (totalLiveValue > 0 && staticPctLive > 0) {
    impliedTotal = totalLiveValue / (staticPctLive / 100);
    totalAll = (impliedTotal * safeStaticPctTotal) / 100;
    useStaticOnly = false;
  } else {
    // No live data at all — fall back to pure static, normalized.
    impliedTotal = 0;
    totalAll = safeStaticPctTotal;
    useStaticOnly = true;
  }

  // Pass 2: build derived rows.
  const derived = rawHoldings.map((h): DerivedSleeveHolding => {
    const quote: Quote | undefined = quoteMap?.[h.ticker];
    const price = quote?.price ?? null;
    const avgCost = avgCostFor(h.ticker);
    const liveValue = liveValues[h.ticker];
    const hasLiveShares = liveValue !== undefined;

    let value: number;
    let isLive: boolean;
    if (hasLiveShares) {
      value = liveValue;
      isLive = true;
    } else if (useStaticOnly) {
      value = h.portfolioWeightPct;
      isLive = false;
    } else {
      // Estimate this fallback ticker's value from its static weight share
      // of the implied total. Same denominator as live tickers — sum stays 100%.
      value = impliedTotal * (h.portfolioWeightPct / 100);
      isLive = false;
    }

    const portfolioPct = totalAll > 0 ? (value / totalAll) * 100 : h.portfolioWeightPct;

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

  // Dev-only diagnostic: requested / live / fallback / sum.
  if (process.env.NODE_ENV !== "production" && rawHoldings.length > 0) {
    const sum = derived.reduce((s, d) => s + d.portfolioPct, 0);
    const liveCount = rawHoldings.length - fallbackTickers.length;
    const tag = useStaticOnly
      ? "static-only"
      : fallbackTickers.length === 0
      ? "all-live"
      : "mixed";
    console.warn(
      `[deriveSleeveHoldings] mode=${tag} ` +
      `requested=${rawHoldings.length} live=${liveCount} ` +
      `fallback=${fallbackTickers.length}` +
      (fallbackTickers.length > 0 ? ` (${fallbackTickers.join(", ")})` : "") +
      ` sum=${sum.toFixed(2)}%`
    );
  }

  return derived;
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
