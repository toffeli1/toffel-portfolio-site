"use client";

import dynamic from "next/dynamic";

export const ReturnChartWrapper = dynamic(
  () => import("./ReturnChart").then((m) => m.ReturnChart),
  { ssr: false }
);
