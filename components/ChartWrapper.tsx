"use client";

// Lazily loads the performance-history chart so recharts stays out of the
// initial bundle.
//
// The price-bearing props (entryMarker, purchaseLots, sellEvents, averageCost)
// were removed along with the private data behind them. This wrapper's surface
// is deliberately narrow so a caller cannot pass a share count or a price into
// a client component again.

import dynamic from "next/dynamic";
import type { ExitMarker } from "./PositionChart";

const PositionChart = dynamic(
  () => import("./PositionChart").then((m) => m.PositionChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[380px] w-full animate-pulse"
        style={{ background: "rgba(15,30,53,0.04)", borderRadius: 10 }}
      />
    ),
  }
);

export function ChartWrapper(props: {
  ticker: string;
  exitMarker?: ExitMarker;
  defaultRange?: "1w" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y" | "max";
}) {
  return <PositionChart {...props} />;
}
