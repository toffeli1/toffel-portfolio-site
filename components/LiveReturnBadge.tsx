"use client";

import { useQuotes } from "./QuotesProvider";
import { getAvgCost, computeReturnPct } from "@/lib/costBasis";
import { MUTED, POSITIVE, NEGATIVE } from "@/lib/theme";

// NO-PRICE RULE: renders a total-return percentage only. A "% today" daily
// price-change sub-line used to render beneath it — removed, since the site
// does not display daily/intraday price changes. The live quote is still read
// here, but only as an input to the return %; the price itself never renders.

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
        <span className="font-mono text-[11px] animate-pulse" style={{ color: MUTED }}>
          ···
        </span>
      ) : liveReturn !== null ? (
        <span
          className="font-mono text-[11px] font-semibold tabular-nums"
          style={{ color: pos ? POSITIVE : NEGATIVE }}
        >
          {pos ? "+" : ""}
          {liveReturn.toFixed(2)}%
        </span>
      ) : (
        <span className="font-mono text-[11px]" style={{ color: MUTED }}>
          —
        </span>
      )}
    </div>
  );
}
