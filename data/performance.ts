// ─── Public performance data accessor ─────────────────────────────────────────
// Typed view over data/performanceDerived.json, the committed percentage-only
// artifact produced by scripts/computePerformance.ts.
//
// This is the ONLY module any surface should read performance numbers from.
// lib/perf.ts (monthly Modified Dietz, VOO benchmark, assumed dividend yield) is
// retired and no longer referenced by anything public.

import raw from "./performanceDerived.json";

export interface WealthPoint { date: string; index: number }
export interface DrawdownPoint { date: string; drawdownPct: number }
export interface PeriodReturn {
  key: string; label: string; returnPct: number;
  partial?: boolean; from: string; to: string;
}
export interface BenchmarkView {
  key: string; name: string; symbol?: string;
  available: boolean; totalReturn: boolean;
  /** True when `symbol` proxies the named index rather than being it. */
  proxy?: boolean;
  sourceNote: string; unavailableReason?: string;
  /** Whether the benchmark series is daily or monthly. */
  granularity?: "daily" | "monthly";
  cumulativeReturnPct: number | null;
  excessCumulativePts?: number;
  wealth: WealthPoint[];
  monthly: { key: string; returnPct: number }[];
  calendarYear: { key: string; returnPct: number }[];
}
export interface HistoricalEpisode {
  ticker: string;
  company: string;
  /** 0-based ownership episode index for this ticker. */
  episode: number;
  initiatedOn: string;
  exitedOn: string | null;
  sessionsHeld: number;
  totalReturnPct: number | null;
  geometricPerSessionReturnPct: number | null;
  /** True when basis is the tracked-inception mark, not a purchase price. */
  trackedPeriodBasis: boolean;
  contributionPts: number | null;
}

export interface HoldingPerformance {
  ticker: string;
  totalReturnPct: number | null;
  /** Sessions in the CURRENT interval (active) or all intervals (historical). */
  sessionsHeld: number | null;
  /** Active rows: bounds of the current continuous ownership interval. */
  currentIntervalStart?: string | null;
  currentIntervalEnd?: string | null;
  /** Active rows: how many earlier intervals were closed before this one. */
  priorClosedIntervals?: number;
  /** Historical rows: every ownership interval. */
  intervals?: { from: string; to: string; sessions: number }[];
  firstHeld?: string | null;
  lastHeld?: string | null;
  reEntered: boolean;
  geometricPerSessionReturnPct: number | null;
  contributionPts: number | null;
}
export interface PerformanceArtifact {
  generatedAt: string;
  inceptionDate: string;
  inceptionNote: string;
  asOfDate: string;
  sessions: number;
  methodology: {
    returnBasis: string; formula: string; navBasis: string;
    weightBasisNote: string; dividends: string; externalFlows: string;
    dateConvention: string; retired: string[];
  };
  holdingReturnBasis: string;
  /** Why a derived active return can differ from the broker's own figure. */
  valuationMarkNote: string;
  cumulativeReturnPct: number;
  wealth: WealthPoint[];
  monthly: PeriodReturn[];
  calendarYear: PeriodReturn[];
  drawdown: DrawdownPoint[];
  maxDrawdownPct: number;
  maxDrawdownDate: string;
  annualizedVolatilityPct: number;
  volatilityNote: string;
  betaVsSp500: number | null;
  sensitivity: {
    excludingNBIS: {
      label: string;
      cumulativeReturnPct: number;
      excessVsSp500Pts: number | null;
      methodologyNote: string;
    };
  };
  benchmarks: Record<string, BenchmarkView>;
  activeHoldings: HoldingPerformance[];
  historicalHoldings: HistoricalEpisode[];
  contributionNote: string;
}

export const performance = raw as unknown as PerformanceArtifact;

export function availableBenchmarkViews(): BenchmarkView[] {
  return Object.values(performance.benchmarks).filter((b) => b.available);
}
export function pendingBenchmarkViews(): BenchmarkView[] {
  return Object.values(performance.benchmarks).filter((b) => !b.available);
}
