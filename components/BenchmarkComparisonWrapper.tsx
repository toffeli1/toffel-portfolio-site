"use client";

import dynamic from "next/dynamic";

const DynamicBenchmarkComparison = dynamic(
  () =>
    import("./BenchmarkComparison").then((m) => m.BenchmarkComparison),
  { ssr: false }
);

export function BenchmarkComparisonWrapper({
  holdingTickers,
}: {
  holdingTickers: string[];
}) {
  return <DynamicBenchmarkComparison holdingTickers={holdingTickers} />;
}
