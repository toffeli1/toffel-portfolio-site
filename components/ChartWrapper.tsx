"use client";

import dynamic from "next/dynamic";
import type { EntryMarker } from "./PositionChart";
import type { PurchaseLot } from "@/lib/positionLots";

// Recharts uses browser-only APIs — load client-side only.
const DynamicChart = dynamic(
  () => import("./PositionChart").then((m) => m.PositionChart),
  { ssr: false }
);

export function ChartWrapper({
  ticker,
  entryMarker,
  purchaseLots,
  averageCost,
}: {
  ticker: string;
  entryMarker?: EntryMarker;
  purchaseLots?: PurchaseLot[];
  averageCost?: number;
}) {
  return <DynamicChart ticker={ticker} entryMarker={entryMarker} purchaseLots={purchaseLots} averageCost={averageCost} />;
}
