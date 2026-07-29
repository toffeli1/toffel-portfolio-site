// ─── Toffel AI knowledge base — pure reads of committed, percentages-only data ─
//
// Every function here is a deterministic lookup or aggregation over data that
// is already public and committed (data/performanceDerived.json, the canonical
// holdings, the decision log, position narratives). Nothing here computes a
// number that isn't already sitting in a committed file — it only selects,
// filters, and sums. There is no live model and no gitignored/dollar data
// anywhere near this module.

import {
  performanceHoldings,
  isFlaggedConcentration,
  CONCENTRATION_CAP_PCT,
  type PerformanceHoldingPosition,
} from "@/data/performanceHoldings";
import { positionDetails, type PositionDetail } from "@/data/positionDetails";
import { previousHoldings, type PreviousHolding } from "@/data/previousHoldings";
import { decisionLog, type DecisionEntry } from "@/data/decisionLog";
import performanceDerived from "@/data/performanceDerived.json";

export function holdingsRankedByWeight(): PerformanceHoldingPosition[] {
  return [...performanceHoldings.positions].sort((a, b) => b.weightPct - a.weightPct);
}

export function holdingsByTheme(): { theme: string; weightPct: number; tickers: string[] }[] {
  const map = new Map<string, { weightPct: number; tickers: string[] }>();
  for (const p of performanceHoldings.positions) {
    const entry = map.get(p.theme) ?? { weightPct: 0, tickers: [] };
    entry.weightPct += p.weightPct;
    entry.tickers.push(p.ticker);
    map.set(p.theme, entry);
  }
  return [...map.entries()]
    .map(([theme, v]) => ({ theme, ...v }))
    .sort((a, b) => b.weightPct - a.weightPct);
}

export function etfExposure(): { totalWeightPct: number; positions: PerformanceHoldingPosition[] } {
  const positions = performanceHoldings.positions.filter(
    (p) => p.assetType === "ETF" || p.assetType === "Crypto-linked ETF"
  );
  return { totalWeightPct: positions.reduce((s, p) => s + p.weightPct, 0), positions };
}

export function concentrationFlags(): { capPct: number; flagged: PerformanceHoldingPosition[] } {
  return {
    capPct: CONCENTRATION_CAP_PCT,
    flagged: performanceHoldings.positions.filter(isFlaggedConcentration).sort((a, b) => b.weightPct - a.weightPct),
  };
}

export function performanceSummary(): typeof performanceDerived {
  return performanceDerived;
}

// decisionLog is authored/maintained in reverse-chronological order (see its
// header comment) — sliced directly rather than re-sorted by date string,
// since several entries share a month-resolution date that would otherwise
// sort ambiguously against day-resolution ones.
export function recentDecisions(n = 5): DecisionEntry[] {
  return decisionLog.slice(0, n);
}

export function archivedDecisions(n = 5): DecisionEntry[] {
  return decisionLog.filter((d) => d.status === "Fully Exited").slice(0, n);
}

export function positionNarrative(ticker: string): PositionDetail | undefined {
  return positionDetails[ticker.toUpperCase()];
}

export function archivedNarrative(ticker: string): PreviousHolding | undefined {
  return previousHoldings.find((h) => h.ticker === ticker.toUpperCase());
}
