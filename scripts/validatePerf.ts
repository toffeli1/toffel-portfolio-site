// One-off validation script — checks lib/perf.ts against the acceptance
// numbers from the spec. Not part of the build; run manually with:
//   npx tsx scripts/validatePerf.ts
import { computePerformance, type PerformanceSeed } from "../lib/perf";
import seed from "../data/performanceSeed.local.json";

const result = computePerformance(seed as PerformanceSeed);

function fmt(n: number, digits = 2): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

console.log("Monthly returns:");
result.monthlyReturns.forEach((r) => console.log(`  ${r.date}: ${fmt(r.returnPct)}`));

console.log(`\nLinked TWR (n=${result.n}): ${fmt(result.cumulativeTWRPct)}  (expect +33.90%)`);
console.log(`Annualized-equivalent: ${fmt(result.annualizedEquivalentPct, 1)}  (expect +37.5%)`);
console.log(`Annualized vol: ${fmt(result.annualizedVolPct, 2)}  (expect 28.98%)`);
console.log(
  `Max drawdown: ${fmt(result.drawdown.maxDrawdownPct, 2)} (${result.drawdown.peakDate} -> ${result.drawdown.troughDate})  (expect -16.37%, Oct->Mar)`
);
console.log(
  `Best month: ${result.bestMonth.date} ${fmt(result.bestMonth.returnPct)}  (expect Apr +17.97%)`
);
console.log(
  `Worst month: ${result.worstMonth.date} ${fmt(result.worstMonth.returnPct)}  (expect Feb -7.80%)`
);
console.log(`Hit rate: ${result.hitRateFraction}  (expect 6 of 11)`);
console.log(
  `Sortino: ${result.sortino.sortinoAnnualized.toFixed(2)}  (expect 2.71)`
);
console.log(
  `Sharpe: ${result.sharpe.sharpeAnnualized.toFixed(2)} SE=${result.sharpe.standardError.toFixed(
    2
  )} CI=[${result.sharpe.ciLow.toFixed(2)}, ${result.sharpe.ciHigh.toFixed(2)}]  (expect 1.10, SE 1.07, CI [-1.00, 3.20])`
);
console.log(
  `Benchmark price return (full window): ${fmt(result.benchmarkFullWindow.priceReturnLinkedPct)}  (expect +16.89%)`
);
console.log(
  `Benchmark total-return proxy (full window): ${fmt(result.benchmarkFullWindow.totalReturnProxyPct)}  (expect +18.18%)`
);
console.log(`Alpha (full window): ${fmt(result.alphaFullWindowPts, 1)} pts  (expect about +15.7 pts)`);
console.log(
  `Alpha (through ${result.priorMonthDate}): ${fmt(result.alphaThroughPriorMonthPts!, 1)} pts  (expect about +14.9 pts, through May)`
);
