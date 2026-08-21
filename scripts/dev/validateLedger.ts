// Dev-only: replay the full private ledger and verify ending share counts.
// Run: npx tsx scripts/dev/validateLedger.ts
import { ingestLedger } from "../../lib/reconstruction/ingest";
import { readFileSync } from "node:fs";
import { reconstruct } from "../../lib/reconstruction/engine";
import { asTradedClose, type PriceCache } from "../../lib/reconstruction/prices";

const INCEPTION = "2025-07-03";
// Expected ending share counts are PRIVATE (they are quantities), so they live
// in the gitignored reconstruction config rather than in this tracked file.
interface ReconConfig { expectedEndingShares: Record<string, number> }
const EXPECTED = (
  JSON.parse(readFileSync("data/reconstructionConfig.local.json", "utf8")) as ReconConfig
).expectedEndingShares;

const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;

// Shared ingestion: identical rows, classification and session normalization to
// the public pipeline, so this replay validates what actually ships.
const { transactions: txs, audit } = ingestLedger(px.tradingDays, INCEPTION);
console.log(
  `source audit: type=${audit.accountType} rows=${audit.rowCount} ` +
  `owningAccountIds=${audit.owningAccountIds} foreignRows=${audit.foreignRows}\n`
);

const unknown = txs.filter((t) => t.kind === "unknown");
console.log(`rows=${txs.length}  unclassified=${unknown.length}`);
for (const u of [...new Set(unknown.map((u) => `${u.rawType}|${u.rawDescription?.slice(0, 50)}`))].slice(0, 8)) {
  console.log("   UNKNOWN:", u);
}

const calendar = px.tradingDays.filter((d) => d >= INCEPTION);
const res = reconstruct(txs, {
  from: INCEPTION, to: calendar[calendar.length - 1],
  opening: { date: INCEPTION, shares: {}, cash: 0 },
  calendar, splits: px.splits,
  priceLookup: (t, d) => asTradedClose(t, d, px),
});

const last = res.days[res.days.length - 1];
console.log(`\nsessions=${res.days.length}  final=${last.date}  unresolved=${res.unresolved.length}`);
console.log(`\n${"tkr".padEnd(6)}${"ledger".padStart(14)}${"expected".padStart(14)}${"diff".padStart(13)}`);
let ok = 0;
for (const [t, e] of Object.entries(EXPECTED)) {
  const a = last.shares[t] ?? 0;
  const good = Math.abs(a - e) < 1e-5;
  ok += good ? 1 : 0;
  console.log(`${t.padEnd(6)}${a.toFixed(6).padStart(14)}${e.toFixed(6).padStart(14)}${(a - e).toFixed(6).padStart(13)}  ${good ? "OK" : "<-- MISMATCH"}`);
}
console.log(`\n${ok}/16 reconcile`);
const stray = Object.entries(last.shares).filter(([t, v]) => !(t in EXPECTED) && Math.abs(v) > 1e-4);
console.log("stray balances in exited names:", stray.length ? stray.map(([t, v]) => `${t}=${v.toFixed(6)}`).join(" ") : "none");
console.log(`\ncash at ${last.date}: ${last.cash.toFixed(2)}`);
console.log(`securities: ${last.securitiesValue.toFixed(2)}  NAV: ${last.nav.toFixed(2)}`);
if (last.missingPrices.length) console.log("missing prices:", last.missingPrices.join(", "));
