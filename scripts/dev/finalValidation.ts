// Dev-only final validation gate. Run: npx tsx scripts/dev/finalValidation.ts
// Asserts every condition required before this work can be committed. Exits
// non-zero on the first failure so nothing passes by inspection alone.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { ingestLedger, makeExDateResolver } from "../../lib/reconstruction/ingest";
import { reconstruct } from "../../lib/reconstruction/engine";
import { asTradedClose, type PriceCache } from "../../lib/reconstruction/prices";
import { ownershipEpisodes, episodeRealizedReturnPct } from "../../lib/reconstruction/fifo";
import { isPubliclyExcluded, PUBLIC_EXCLUDED_TICKERS } from "../../lib/reconstruction/exclusions";
import type { Transaction } from "../../lib/reconstruction/types";

const INCEPTION = "2025-07-03";
let failures = 0;

function check(label: string, ok: boolean, detail: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(52)} ${detail}`);
  if (!ok) failures++;
}

const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;
const cal = px.tradingDays.filter((d) => d >= INCEPTION);
const { transactions: txs, audit } = ingestLedger(px.tradingDays, INCEPTION);
const res = reconstruct(txs, {
  from: INCEPTION, to: cal[cal.length - 1],
  opening: { date: INCEPTION, shares: {}, cash: 0 },
  calendar: cal, splits: px.splits,
  priceLookup: (t, d) => asTradedClose(t, d, px),
});

const dividendFor = (tx: Transaction): string | undefined => {
  const m = /dividend of \$[\d.,]+ from ([A-Z.]{1,6})/i.exec(tx.rawDescription ?? "");
  return m ? m[1].toUpperCase() : undefined;
};
const TRANSFERRED_IN = new Set(["QQQ", "VGT", "VOO"]);
const unattributed: { ticker: string; date: string; amount: number }[] = [];
const allEps = ownershipEpisodes(txs, {
  splits: px.splits,
  openingMark: (t) => (TRANSFERRED_IN.has(t) ? asTradedClose(t, INCEPTION, px) : undefined),
  dividendFor,
  exDateFor: makeExDateResolver(px.dividends),
  unattributedOut: unattributed,
});
const eps = allEps.filter((e) => !isPubliclyExcluded(e.ticker));

const derived = JSON.parse(readFileSync("data/performanceDerived.json", "utf8"));
const lifecycle = JSON.parse(readFileSync("data/lifecycleEvents.json", "utf8"));
const weights = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));

// ── 1. Source account boundary ───────────────────────────────────────────────
console.log("\nSOURCE ACCOUNT BOUNDARY");
check("Roth source rows", audit.rowCount === 525, `${audit.rowCount}`);
check("unique owning account IDs", audit.owningAccountIds === 1, `${audit.owningAccountIds}`);
check("foreign owning rows", audit.foreignRows === 0, `${audit.foreignRows}`);
check("counterparty refs observed, not owned", audit.counterpartyRefs > 0, `${audit.counterpartyRefs}`);
check("no account_id survives ingestion",
  txs.every((t) => !("account_id" in (t as object)) && !("accountId" in (t as object))), "0 rows");

// ── 2. Episodes ──────────────────────────────────────────────────────────────
console.log("\nEPISODES");
const open = eps.filter((e) => e.open).length;
const closed = eps.filter((e) => !e.open).length;
check("open episodes", open === 16, `${open}`);
check("closed episodes", closed === 28,
  `${closed} (29 before the ${[...PUBLIC_EXCLUDED_TICKERS].join("/")} exclusion)`);
check("AEVA produces no equity episode", eps.every((e) => e.ticker !== "AEVA"), "0");

// ── 3. Canonical session-normalized start dates ──────────────────────────────
console.log("\nCANONICAL START DATES (one value across every surface)");
const EXPECT: Record<string, string> = {
  CBRS: "2026-08-17", UNH: "2026-08-17", OSCR: "2026-08-07",
};
for (const [ticker, want] of Object.entries(EXPECT)) {
  const ep = eps.find((e) => e.ticker === ticker && e.open);
  const pub = derived.activeHoldings.find((h: { ticker: string }) => h.ticker === ticker);
  const lc = (lifecycle.events as { ticker: string; startDate: string }[])
    .filter((e) => e.ticker === ticker).map((e) => e.startDate);
  const wr = (weights.events as { ticker: string; startDate: string }[])
    .filter((r) => r.ticker === ticker).map((r) => r.startDate);
  const agree =
    ep?.start === want &&
    pub?.currentIntervalStart === want &&
    lc.includes(want) &&
    wr.includes(want);
  check(`${ticker} canonical start = ${want}`, agree,
    `episode=${ep?.start} artifact=${pub?.currentIntervalStart} lifecycle=${lc.includes(want)} weights=${wr.includes(want)}`);
}
// No date anywhere may fall on a non-session.
const sessionSet = new Set(px.tradingDays);
const offCal = txs.filter((t) => !sessionSet.has(t.effectiveDate));
check("every effective date is a real session", offCal.length === 0, `${offCal.length} off-calendar`);

// ── 4. Historical reconciliation ─────────────────────────────────────────────
console.log("\nHISTORICAL RECONCILIATION");
const TARGET: Record<string, number> = {
  AMD: 134.78, ASML: 77.02, AVEX: 5.39, CAVA: -19.48, CRWD: 23.24,
  DUOL: -46.15, FBTC: -27.84, GEV: 1.47, HIMS: -43.53, HOOD: 8.48, IREN: 64.65,
  LMND: 63.73, NU: -2.38, NVDA: 4.51, PENG: 26.08, QBTS: 60.63, SATL: 10.40,
  SCHD: 4.25, SOAR: -38.50, SOFI: 25.95, SPOT: -11.15,
};
const EPISODE_TARGET: Record<string, number> = { "UNH#0": 38.26, "OSCR#0": -13.08, "OSCR#1": -2.80 };
// Targets are quoted to two decimals, so agreement means |diff| <= 0.005.
const TOLERANCE = 0.005;
const closedEps = eps.filter((e) => !e.open);
let worst = 0, checkedTargets = 0;
// Names owned more than once reconcile against an AGGREGATE cash target: the
// independent figure covers all of the ownership, not one episode of it.
const multiEpisode = new Set(
  closedEps.filter((e) => closedEps.some((o) => o.ticker === e.ticker && o.index !== e.index))
        .map((e) => e.ticker)
);

for (const ep of closedEps) {
  const key = `${ep.ticker}#${ep.index}`;
  if (EPISODE_TARGET[key] !== undefined) {
    const r = episodeRealizedReturnPct(ep);
    if (r === undefined) continue;
    checkedTargets++;
    worst = Math.max(worst, Math.abs(r - EPISODE_TARGET[key]));
    continue;
  }
  if (multiEpisode.has(ep.ticker)) continue; // handled in aggregate below
  const tgt = TARGET[ep.ticker];
  if (tgt === undefined) continue;
  const r = episodeRealizedReturnPct(ep);
  if (r === undefined) continue;
  checkedTargets++;
  worst = Math.max(worst, Math.abs(r - tgt));
}

// Aggregate reconciliation for the multi-episode names.
for (const ticker of multiEpisode) {
  const tgt = TARGET[ticker];
  if (tgt === undefined) continue;
  const mine = closedEps.filter((e) => e.ticker === ticker);
  const cost = mine.reduce((s, e) => s + e.acquisitionCost, 0);
  if (cost <= 0) continue;
  const net = mine.reduce((s, e) => s + e.proceeds + e.dividends - e.acquisitionCost - e.fees, 0);
  const agg = (net / cost) * 100;
  checkedTargets++;
  worst = Math.max(worst, Math.abs(agg - tgt));
  console.log(`      ${ticker} aggregate across ${mine.length} episodes = ${agg.toFixed(2)}% (target ${tgt.toFixed(2)}%)`);
}

// Every independent target must actually have been exercised, so a name
// silently missing from the reconstruction cannot pass by omission.
const expectedChecks = Object.keys(TARGET).length + Object.keys(EPISODE_TARGET).length;
check("independent targets exercised", checkedTargets === expectedChecks,
  `${checkedTargets}/${expectedChecks}`);
check("max |diff| vs targets", worst <= TOLERANCE, `${worst.toFixed(4)} pts (targets quoted to 2dp)`);

// ── 5. Distribution attribution ──────────────────────────────────────────────
console.log("\nDISTRIBUTION ATTRIBUTION");
const shownUnattributed = unattributed.filter((u) => !isPubliclyExcluded(u.ticker));
const inferred = eps.filter((e) => e.inferredDividends);
check("no ambiguous attribution silently accepted", shownUnattributed.length === 0,
  `${shownUnattributed.length} unattributed`);
check("no fallback inference required", inferred.length === 0, `${inferred.length} inferred`);
check("no day-window heuristic in source",
  !/DIVIDEND_LAG_DAYS/.test(readFileSync("lib/reconstruction/fifo.ts", "utf8")), "absent");

// ── 6. Public data boundary ──────────────────────────────────────────────────
console.log("\nPUBLIC DATA BOUNDARY");
const tracked = execSync("git ls-files", { encoding: "utf8" }).trim().split("\n");
check("private inputs untracked",
  !tracked.some((f) => /\.local\.(json|ts)$/.test(f)), "none tracked");
const artifacts = ["data/performanceDerived.json", "data/lifecycleEvents.json", "data/decisionWeights.json"];
const banned = [/\*{2,}\d{3,}/, /account_?[Ii]d/, /ending in \d{4}/, /RH-[A-Z]+-/,
                /pricePerShare/, /costBasis/, /averageCost/, /entryPrice/, /"shares"/, /"quantity"/];
let leaks = 0;
for (const f of artifacts) {
  const raw = readFileSync(f, "utf8");
  for (const re of banned) if (re.test(raw)) { leaks++; console.log(`      ${f} matched ${re}`); }
}
check("no price/share/cost/account data in artifacts", leaks === 0, `${leaks} matches`);

// ── 7. Benchmark disclosure ──────────────────────────────────────────────────
console.log("\nBENCHMARK DISCLOSURE");
const nq = derived.benchmarks.nasdaq100;
check("Nasdaq-100 flagged as a proxy", nq.proxy === true, `proxy=${nq.proxy}`);
check("proxy disclosure text present", /proxied by/.test(nq.sourceNote ?? ""), "present");
check("proxy is total return", nq.totalReturn === true, `${nq.totalReturn}`);

// ── 8. Lifecycle events open at zero ────────────────────────────────────────
console.log("\nLIFECYCLE EVENTS");
const openers = (weights.events as {
  ticker: string; startDate: string; oldWeightPct?: number; status: string;
}[]).filter((r) =>
  (lifecycle.events as { ticker: string; startDate: string }[])
    .some((e) => e.ticker === r.ticker && e.startDate === r.startDate)
);
const nonZero = openers.filter((r) => r.status === "computed" && (r.oldWeightPct ?? 0) !== 0);
check("every Initiate/Re-enter opens at 0.00%", nonZero.length === 0,
  `${openers.length} events checked, ${nonZero.length} non-zero`);

// ── 9. Owner-directed exclusions ─────────────────────────────────────────────
// Two-sided: the name must be absent from every PUBLIC surface, AND its private
// rows must still be doing work in the account arithmetic. Checking only the
// first would pass if the transactions had simply been deleted, which would
// misstate cash, NAV and portfolio TWR.
console.log("\nEXCLUSIONS — PUBLIC ABSENCE");
const rows = [...derived.activeHoldings, ...derived.historicalHoldings,
              ...lifecycle.events, ...weights.events] as { ticker: string }[];
check("excluded tickers absent from every artifact row",
  rows.every((r) => !PUBLIC_EXCLUDED_TICKERS.has(r.ticker)), `${rows.length} rows scanned`);

const trackedText = tracked.filter((f) => /\.(ts|tsx|json|md)$/.test(f))
  .filter((f) => f !== "lib/reconstruction/exclusions.ts" && !f.startsWith("tests/"));
let mentions = 0;
for (const t of PUBLIC_EXCLUDED_TICKERS) {
  const word = new RegExp(`\\b${t}\\b`);
  for (const f of trackedText) {
    try { if (word.test(readFileSync(f, "utf8"))) { mentions++; console.log(`      ${f} mentions ${t}`); } }
    catch { /* deleted from disk */ }
  }
}
check("no tracked source file mentions an excluded ticker", mentions === 0, `${mentions} mentions`);

console.log("\nEXCLUSIONS — PRIVATE ARITHMETIC STILL INCLUDED");
for (const t of PUBLIC_EXCLUDED_TICKERS) {
  // 9a. The rows survived ingestion.
  const own = txs.filter((x) => x.ticker === t);
  const named = txs.filter((x) => dividendFor(x) === t);
  check(`${t} rows present in the ingested ledger`, own.length + named.length > 0,
    `${own.length} position rows + ${named.length} distribution rows`);

  // 9b. The episode exists privately even though it is never published.
  const priv = allEps.filter((e) => e.ticker === t);
  const pub = eps.filter((e) => e.ticker === t);
  check(`${t} episode exists privately but not publicly`,
    priv.length > 0 && pub.length === 0, `private=${priv.length} published=${pub.length}`);

  // 9c. The position was actually held in the daily reconstruction.
  const heldDays = res.days.filter((d) => (d.shares[t] ?? 0) > 0).length;
  check(`${t} held in the daily NAV reconstruction`, heldDays > 0, `${heldDays} sessions`);
}

// 9d. Counterfactual: dropping the excluded rows WOULD move cash and NAV, which
// proves they are participating rather than being quietly ignored.
const withoutExcluded = txs.filter(
  (x) => !isPubliclyExcluded(x.ticker) && !isPubliclyExcluded(dividendFor(x))
);
check("excluded rows are a real part of the ledger",
  withoutExcluded.length < txs.length, `${txs.length - withoutExcluded.length} rows would be lost`);

const resWithout = reconstruct(withoutExcluded, {
  from: INCEPTION, to: cal[cal.length - 1],
  opening: { date: INCEPTION, shares: {}, cash: 0 },
  calendar: cal, splits: px.splits,
  priceLookup: (t, d) => asTradedClose(t, d, px),
});
const twr = (days: typeof res.days) => {
  let w = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1], cur = days[i];
    if (prev.nav <= 0) continue;
    w *= 1 + (cur.nav - prev.nav - cur.externalFlow) / prev.nav;
  }
  return (w - 1) * 100;
};
const twrFull = twr(res.days);
const twrWithout = twr(resWithout.days);
check("dropping the excluded rows would change portfolio TWR",
  Math.abs(twrFull - twrWithout) > 0.005,
  `included ${twrFull.toFixed(2)}% vs excluded-from-math ${twrWithout.toFixed(2)}%`);

// 9e. The PUBLISHED TWR is the one computed WITH the excluded rows.
check("published TWR is the full-account figure",
  Math.abs(derived.cumulativeReturnPct - twrFull) < 0.01,
  `artifact ${derived.cumulativeReturnPct.toFixed(2)}% vs full-ledger ${twrFull.toFixed(2)}%`);

// 9f. Account reconciliation still uses every row.
const lastDay = res.days[res.days.length - 1];
check("account reconciliation runs on the full ledger",
  Math.abs(lastDay.nav - (resWithout.days[resWithout.days.length - 1]?.nav ?? 0)) > 0.01,
  "NAV differs when excluded rows are removed");

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
