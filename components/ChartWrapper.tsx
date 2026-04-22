"use client";

import dynamic from "next/dynamic";
import type { EntryMarker, ExitMarker } from "./PositionChart";
import type { PurchaseLot } from "@/lib/positionLots";

// Recharts uses browser-only APIs — load client-side only.
const DynamicChart = dynamic(
  () => import("./PositionChart").then((m) => m.PositionChart),
  { ssr: false }
);

type Range = "1w" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y" | "max";

export function ChartWrapper({
  ticker,
  entryMarker,
  purchaseLots,
  averageCost,
  exitMarker,
  defaultRange,
}: {
  ticker: string;
  entryMarker?: EntryMarker;
  purchaseLots?: PurchaseLot[];
  averageCost?: number;
  exitMarker?: ExitMarker;
  defaultRange?: Range;
}) {
  return (
    <DynamicChart
      ticker={ticker}
      entryMarker={entryMarker}
      purchaseLots={purchaseLots}
      averageCost={averageCost}
      exitMarker={exitMarker}
      defaultRange={defaultRange}
    />
  );
}
