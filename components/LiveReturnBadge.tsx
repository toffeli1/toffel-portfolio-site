"use client";

import { useQuotes } from "./QuotesProvider";
import { getAvgCost, computeReturnPct } from "@/lib/costBasis";

export function LiveReturnBadge({
  ticker,
  sleeve,
  avgCost: avgCostProp,
}: {
  ticker: string;
  sleeve?: string;
  avgCost?: number;
}) {
  const { quotes, loading } = useQuotes();
  const q = quotes[ticker];
  const avgCost = avgCostProp ?? getAvgCost(ticker, sleeve);

  const currentPrice = q?.price ?? null;
  const liveReturn =
    avgCost !== null && currentPrice !== null
      ? computeReturnPct(avgCost, currentPrice)
      : null;

  const pos = (liveReturn ?? 0) >= 0;

  return (
    <div className="flex flex-col items-end gap-0.5">
      {loading && q === undefined ? (
        <span className="font-mono text-[11px] animate-pulse" style={{ color: "#a8b2bd" }}>
          ···
        </span>
      ) : liveReturn !== null ? (
        <span
          className="font-mono text-[11px] font-semibold tabular-nums"
          style={{ color: pos ? "#15542e" : "#8b1a1a" }}
        >
          {pos ? "+" : ""}
          {liveReturn.toFixed(2)}%
        </span>
      ) : (
        <span className="font-mono text-[11px]" style={{ color: "#a8b2bd" }}>
          —
        </span>
      )}
      {!loading && q?.changePercent != null && (
        <span className="font-mono text-[9px] tabular-nums" style={{ color: "#a8b2bd" }}>
          {q.changePercent >= 0 ? "+" : ""}
          {q.changePercent.toFixed(2)}% today
        </span>
      )}
    </div>
  );
}
