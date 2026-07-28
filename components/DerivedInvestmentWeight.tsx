"use client";

import { useEffect, useState } from "react";
import { rothIraHoldings } from "@/data/sleeveHoldings";
import {
  deriveSleeveHoldings,
  type DerivedSleeveHolding,
  type WeightStatus,
} from "@/lib/portfolioCalculations";
import { getAvgCost } from "@/lib/costBasis";
import type { QuoteMap } from "@/lib/types";
import WeightStatusBadge from "./WeightStatusBadge";

interface State {
  pct: number;
  isLive: boolean;
  status: WeightStatus;
  targetPct?: number;
  maxPct?: number;
}

function deriveOne(ticker: string, quotes: QuoteMap | null, fallbackPct: number): State {
  const derived = deriveSleeveHoldings(rothIraHoldings, quotes, (t) => getAvgCost(t, "roth-ira"));
  const mine: DerivedSleeveHolding | undefined = derived.find((d) => d.ticker === ticker);
  if (!mine) {
    return { pct: fallbackPct, isLive: false, status: "No target" };
  }
  return {
    pct: mine.portfolioPct,
    isLive: mine.isLive,
    status: mine.weightStatus,
    targetPct: mine.targetWeight !== undefined ? mine.targetWeight * 100 : undefined,
    maxPct: mine.maxWeight !== undefined ? mine.maxWeight * 100 : undefined,
  };
}

/**
 * Live-derived Investments-account weight for a single ticker. On mount,
 * fetches /api/quotes once and re-derives. Falls back to the static
 * fallbackPct until then or on fetch failure.
 */
export default function DerivedInvestmentWeight({
  ticker,
  fallbackPct,
  showStatus = false,
}: {
  ticker: string;
  fallbackPct: number;
  showStatus?: boolean;
}) {
  const [state, setState] = useState<State>(() => deriveOne(ticker, null, fallbackPct));

  useEffect(() => {
    let cancelled = false;
    fetch("/api/quotes")
      .then((r) => (r.ok ? (r.json() as Promise<QuoteMap>) : null))
      .then((qm) => {
        if (cancelled || !qm) return;
        setState(deriveOne(ticker, qm, fallbackPct));
      })
      .catch(() => {
        /* silent — keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [ticker, fallbackPct]);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-[11px] tabular-nums text-[#3d4f66]">
        {state.pct.toFixed(1)}%
      </span>
      {showStatus && state.status !== "No target" && (
        <WeightStatusBadge status={state.status} />
      )}
    </span>
  );
}
