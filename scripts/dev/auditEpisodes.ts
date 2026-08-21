// Dev-only full historical audit. Run: npx tsx scripts/dev/auditEpisodes.ts
// Reconciles every ownership episode against independent cash-ledger targets.
// PRIVATE diagnostic — never committed as output.
//
// Reads the ledger through the SHARED ingestion layer, so the episode dates
// printed here are the same normalized dates every public surface uses. When
// this script normalized dates on its own, it reported an episode start one
// session earlier than the Decision Log for a position first bought on a
// non-trading day.
import { readFileSync } from "node:fs";
import { ingestLedger, makeExDateResolver } from "../../lib/reconstruction/ingest";
import { reconstruct } from "../../lib/reconstruction/engine";
import { asTradedClose, type PriceCache } from "../../lib/reconstruction/prices";
import {
  ownershipEpisodes, episodeRealizedReturnPct, ownershipIntervals,
} from "../../lib/reconstruction/fifo";
import { isPubliclyExcluded } from "../../lib/reconstruction/exclusions";
import type { Transaction } from "../../lib/reconstruction/types";

const INCEPTION = "2025-07-03";
const TRANSFERRED_IN = new Set(["QQQ", "VGT", "VOO"]);

// Independent cash-ledger checks. NOT used in any calculation.
const TARGET: Record<string, number> = {
  AMD: 134.78, ASML: 77.02, AVEX: 5.39, CAVA: -19.48, CRWD: 23.24,
  DUOL: -46.15, FBTC: -27.84, GEV: 1.47, HIMS: -43.53, HOOD: 8.48, IREN: 64.65,
  LMND: 63.73, NU: -2.38, NVDA: 4.51, PENG: 26.08, QBTS: 60.63, SATL: 10.40,
  SCHD: 4.25, SOAR: -38.50, SOFI: 25.95, SPOT: -11.15,
};
const EPISODE_TARGET: Record<string, number> = {
  "UNH#0": 38.26, "OSCR#0": -13.08, "OSCR#1": -2.80,
};

const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;
const calendar = px.tradingDays.filter((d) => d >= INCEPTION);

const { transactions: txs, audit } = ingestLedger(px.tradingDays, INCEPTION);
console.log(
  `source audit: type=${audit.accountType} rows=${audit.rowCount} ` +
  `owningAccountIds=${audit.owningAccountIds} foreignRows=${audit.foreignRows} ` +
  `counterpartyRefs=${audit.counterpartyRefs}\n`
);

const res = reconstruct(txs, {
  from: INCEPTION, to: calendar[calendar.length - 1],
  opening: { date: INCEPTION, shares: {}, cash: 0 },
  calendar, splits: px.splits,
  priceLookup: (t, d) => asTradedClose(t, d, px),
});

const dividendFor = (tx: Transaction): string | undefined => {
  const m = /dividend of \$[\d.,]+ from ([A-Z.]{1,6})/i.exec(tx.rawDescription ?? "");
  return m ? m[1].toUpperCase() : undefined;
};
const openingMark = (t: string) =>
  TRANSFERRED_IN.has(t) ? asTradedClose(t, INCEPTION, px) : undefined;

const exDateFor = makeExDateResolver(px.dividends);
const unattributed: { ticker: string; date: string; amount: number }[] = [];
const all = ownershipEpisodes(txs, {
  splits: px.splits, openingMark, dividendFor, exDateFor, unattributedOut: unattributed,
});
const eps = all.filter((e) => !isPubliclyExcluded(e.ticker));

console.log("ticker ep start      end        st   tx  derived   target     diff  note");
let worst = 0;
const unresolved: string[] = [];
for (const ep of eps) {
  const r = episodeRealizedReturnPct(ep);
  const key = `${ep.ticker}#${ep.index}`;
  const soleEpisode = ep.index === 0 && !eps.some((e) => e.ticker === ep.ticker && e.index > 0);
  const tgt = ep.open
    ? undefined
    : EPISODE_TARGET[key] ?? (soleEpisode ? TARGET[ep.ticker] : undefined);
  const diff = r !== undefined && tgt !== undefined ? r - tgt : undefined;
  if (diff !== undefined) {
    worst = Math.max(worst, Math.abs(diff));
    if (Math.abs(diff) > 1.0) unresolved.push(`${key} ${diff.toFixed(2)}`);
  }
  const notes = [
    ep.basisFromOpeningMark ? "opening-mark basis" : "",
    ep.inferredDividends ? "inferred distribution" : "",
  ].filter(Boolean).join(" ");
  console.log(
    `${ep.ticker.padEnd(6)} ${String(ep.index).padStart(2)} ${ep.start} ${(ep.end ?? "current").padEnd(10)} ` +
    `${(ep.open ? "open" : "closed").padEnd(6)} ${String(ep.txCount).padStart(3)} ` +
    `${(r === undefined ? "n/a" : r.toFixed(2)).padStart(8)} ${(tgt === undefined ? "-" : tgt.toFixed(2)).padStart(8)} ` +
    `${(diff === undefined ? "-" : diff.toFixed(2)).padStart(8)}  ${notes}`
  );
}

console.log(`\nmax |diff| vs targets = ${worst.toFixed(2)} pts`);
console.log(`episodes >1pt off: ${unresolved.length ? unresolved.join(", ") : "none"}`);
console.log(`\nepisodes total=${eps.length} open=${eps.filter((e) => e.open).length} closed=${eps.filter((e) => !e.open).length}`);
console.log(`AEVA equity episodes (must be 0): ${eps.filter((e) => e.ticker === "AEVA").length}`);

// ── Canonical episode starts, cross-checked against the public artifact ──────
const derived = JSON.parse(readFileSync("data/performanceDerived.json", "utf8"));
console.log("\ncanonical current-interval starts (private diagnostic vs public artifact):");
let mismatches = 0;
for (const ep of eps.filter((e) => e.open).sort((a, b) => a.ticker.localeCompare(b.ticker))) {
  const pub = derived.activeHoldings.find((h: { ticker: string }) => h.ticker === ep.ticker);
  const same = pub?.currentIntervalStart === ep.start;
  if (!same) mismatches++;
  console.log(
    `  ${ep.ticker.padEnd(6)} diagnostic=${ep.start} artifact=${pub?.currentIntervalStart ?? "—"} ` +
    `${same ? "" : "  << MISMATCH"}`
  );
}
console.log(`start-date mismatches: ${mismatches}`);

const shown = unattributed.filter((u) => !isPubliclyExcluded(u.ticker));
console.log(`\nunattributed distributions: ${shown.length}`);
for (const u of shown) console.log(`  ${u.ticker} paid ${u.date} — no episode covers its ex-date`);
const inferred = eps.filter((e) => e.inferredDividends);
console.log(`fallback-inferred distributions: ${inferred.length}`);
for (const e of inferred) console.log(`  ${e.ticker} ep${e.index}`);

const sessionsFor = (t: string, i: number) => ownershipIntervals(res.days, t)[i]?.sessions ?? 0;
console.log(`\n(session counts available, e.g. first UNH interval = ${sessionsFor("UNH", 0)} sessions)`);
