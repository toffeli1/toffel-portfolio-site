"use client";

import dynamic from "next/dynamic";

const DynamicCalculator = dynamic(
  () =>
    import("./RetirementCalculator").then((m) => m.RetirementCalculator),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-64 w-full animate-pulse rounded-xl"
        style={{ background: "rgba(15,30,53,0.04)" }}
      />
    ),
  }
);

export function RetirementCalculatorWrapper() {
  return <DynamicCalculator />;
}
