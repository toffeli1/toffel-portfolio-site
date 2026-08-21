// Dev-only: reconcile FIFO-derived current-position returns against the
// broker's reported figures. Run: npx tsx scripts/dev/validateHoldingReturns.ts
import { ingestLedger } from "../../lib/reconstruction/ingest";
import { readFileSync } from "node:fs";
import { reconstruct } from "../../lib/reconstruction/engine";
import { asTradedClose, type PriceCache } from "../../lib/reconstruction/prices";
import { survivingLots, currentPositionReturnPct, currentInterval } from "../../lib/reconstruction/fifo";

const INCEPTION = "2025-07-03";
const TARGET: Record<string, number> = {
  AMZN: 1.89, GOOGL: 25.57, SMH: 11.55, NOW: 29.99, META: -9.06, SGOV: 0.01,
  NBIS: 179.22, GLDM: 2.82, CEG: 3.80, MELI: -2.69, MA: 1.87, UNH: -1.41,
  RKLB: -3.94, OSCR: 19.05, CBRS: -3.73, ASTS: -32.32,
};
const START: Record<string, string> = {
  AMZN: "2026-08-17", GOOGL: "2025-07-15", SMH: "2026-01-26", NOW: "2026-05-14",
  META: "2026-01-22", SGOV: "2026-08-17", NBIS: "2025-07-14", GLDM: "2026-08-10",
  CEG: "2026-08-06", MELI: "2025-08-12", MA: "2026-08-17", UNH: "2026-08-17",
  RKLB: "2026-01-23", OSCR: "2026-08-07", CBRS: "2026-08-17", ASTS: "2026-01-26",
};

const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;
const calendar = px.tradingDays.filter((d) => d >= INCEPTION);

// Shared ingestion: same rows, same classification, same SESSION-NORMALIZED
// dates the public artifact is built from. Re-deriving them here is how a
// diagnostic ends up disagreeing with the site it is meant to validate.
const { transactions: txs } = ingestLedger(px.tradingDays, INCEPTION);
const asOf = calendar[calendar.length - 1];
const res = reconstruct(txs, { from: INCEPTION, to: asOf,
  opening: { date: INCEPTION, shares: {}, cash: 0 }, calendar, splits: px.splits,
  priceLookup: (t, d) => asTradedClose(t, d, px) });

const lots = survivingLots(txs, px.splits);
console.log(`as-of ${asOf}\n`);
console.log("ticker |  derived |   target |    diff | interval start | exp start  | sessions");
let worst = 0, badStart = 0;
for (const t of Object.keys(TARGET)) {
  const pos = lots.get(t);
  const close = asTradedClose(t, asOf, px);
  const r = pos ? currentPositionReturnPct(pos, close) : undefined;
  const iv = currentInterval(res.days, t);
  const d = r === undefined ? NaN : r - TARGET[t];
  if (Number.isFinite(d)) worst = Math.max(worst, Math.abs(d));
  const okStart = iv?.from === START[t];
  if (!okStart) badStart++;
  console.log(
    `${t.padEnd(6)} | ${(r===undefined?"n/a":r.toFixed(2)).padStart(8)} | ${TARGET[t].toFixed(2).padStart(8)} | ` +
    `${(Number.isFinite(d)?d.toFixed(2):"n/a").padStart(7)} | ${(iv?.from??"none").padStart(14)} | ${START[t].padStart(10)} | ` +
    `${String(iv?.sessions??"-").padStart(8)} ${okStart?"":"<-- START MISMATCH"}`
  );
}
console.log(`\nmax |diff| = ${worst.toFixed(2)} pts   interval-start mismatches = ${badStart}`);

// ── Diagnose the residual: back-solve the price the target implies ──────────
console.log("\nticker |   my close | implied close |  ratio | note");
for (const t of Object.keys(TARGET)) {
  const pos = lots.get(t); if (!pos) continue;
  const close = asTradedClose(t, asOf, px);
  const implied = (pos.costBasis * (1 + TARGET[t] / 100)) / pos.qty;
  const ratio = close ? implied / close : NaN;
  const flag = Math.abs(ratio - 1) > 0.02 ? "<-- price mismatch >2%" : "";
  console.log(`${t.padEnd(6)} | ${(close?.toFixed(4) ?? "n/a").padStart(10)} | ${implied.toFixed(4).padStart(13)} | ${ratio.toFixed(4).padStart(6)} | ${flag}`);
}
