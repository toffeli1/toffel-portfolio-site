// Regenerates data/performanceDerived.json (committed, percentage-only) from
// data/performanceSeed.local.json (gitignored, contains real $ NAVs/flows).
//
// Run this locally after editing the local seed file, then commit the
// regenerated data/performanceDerived.json. See app/performance/README.md.
//
//   npm run compute-performance
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { computePerformance, type PerformanceSeed } from "../lib/perf";
import seed from "../data/performanceSeed.local.json";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../data/performanceDerived.json");

const result = computePerformance(seed as PerformanceSeed);

writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");

console.log(`Wrote ${outPath}`);
console.log(`n=${result.n}, cumulative TWR ${result.cumulativeTWRPct.toFixed(2)}%, as of ${result.asOfDate}`);
