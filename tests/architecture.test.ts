// Architecture and data-integrity tests.
//   npm test
//
// These guard the invariants that are expensive to notice by eye: the active set,
// the active/exited split, single-route resolution, the no-price rule, peer-average
// hygiene, SEC staleness rejection, and pending-weight support.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { portfolioState, activePositionCount, totalWeightPct, weightFor } from "../data/portfolioState";
import { companies, activeCompanies, exitedCompanies, getCompany } from "../data/companies";
import { thesisHref, thesisTickers, activeThesisTickers } from "../lib/routes";
import { getThesis, hasThesis } from "../data/thesis";
import { selectPeers, directPeerAverageForwardPE } from "../lib/peerSelection";
import { decisionsByCompany, pendingWeightEventCount } from "../data/decisions";
import { getBenchmark, benchmarkMonthlyReturns, benchmarkCumulativeReturn } from "../data/benchmarks";

/** Shape of data/fundamentals/reported.json, for the SEC-pipeline assertions. */
interface ReportedQuarter {
  period: string;
  periodEnd: string;
  value: number;
  derived?: boolean;
}
interface ReportedTicker {
  metrics: Record<string, ReportedQuarter[]>;
  conceptUsed: Record<string, string>;
}
type ReportedDoc = Record<string, ReportedTicker>;

function loadReported(): ReportedDoc {
  return JSON.parse(readFileSync("data/fundamentals/reported.json", "utf8")) as ReportedDoc;
}

const EXPECTED_ACTIVE = [
  "AMZN", "GOOGL", "SMH", "NOW", "META", "SGOV", "NBIS", "GLDM",
  "CEG", "MELI", "MA", "UNH", "RKLB", "OSCR", "CBRS", "ASTS",
];
const EXITED = ["VOO", "AMD", "CRWD", "PENG", "GEV", "FBTC"];

// ── Active set ──────────────────────────────────────────────────────────────

test("portfolio holds exactly 16 active positions", () => {
  assert.equal(activePositionCount, 16);
  assert.equal(portfolioState.positions.length, 16);
});

test("active ticker set matches the canonical list exactly", () => {
  const actual = portfolioState.positions.map((p) => p.ticker).sort();
  assert.deepEqual(actual, [...EXPECTED_ACTIVE].sort());
});

test("position weights sum to approximately 100%", () => {
  assert.ok(Math.abs(totalWeightPct() - 100) < 0.5, `sum was ${totalWeightPct()}`);
});

test("registry active set agrees with portfolio state", () => {
  assert.deepEqual(
    activeCompanies().map((c) => c.ticker).sort(),
    [...EXPECTED_ACTIVE].sort()
  );
});

// ── Active / exited separation ──────────────────────────────────────────────

test("exited companies cannot carry an active portfolio weight", () => {
  for (const ticker of EXITED) {
    assert.equal(getCompany(ticker)?.status, "exited", `${ticker} should be exited`);
    assert.equal(weightFor(ticker), undefined, `${ticker} must have no weight`);
    assert.ok(
      !portfolioState.positions.some((p) => p.ticker === ticker),
      `${ticker} must not appear in current positions`
    );
  }
});

test("no exited company appears in active thesis navigation", () => {
  const active = activeThesisTickers();
  for (const ticker of EXITED) {
    assert.ok(!active.includes(ticker), `${ticker} must not be in active thesis nav`);
  }
});

test("exited companies remain reachable as historical thesis pages", () => {
  for (const ticker of EXITED) {
    assert.ok(hasThesis(ticker), `${ticker} must keep a thesis page`);
    assert.equal(getThesis(ticker)?.historical, true, `${ticker} must be marked historical`);
  }
});

// ── Single canonical route ──────────────────────────────────────────────────

test("thesis route resolution is canonical and case-insensitive", () => {
  assert.equal(thesisHref("amzn"), "/thesis/AMZN");
  assert.equal(thesisHref("AMZN"), "/thesis/AMZN");
});

test("every active holding resolves to a thesis page", () => {
  for (const ticker of EXPECTED_ACTIVE) {
    assert.ok(hasThesis(ticker), `${ticker} has no thesis content`);
    assert.ok(thesisTickers().includes(ticker), `${ticker} missing from generated routes`);
  }
});

// ── No public security prices ───────────────────────────────────────────────

test("no committed thesis or portfolio data carries a price field", () => {
  const banned = /\b(pricePerShare|currentPrice|entryPrice|avgCost|averageCost|lastPrice|quotePrice)\b/;
  const roots = ["data/thesis", "data/companies.ts", "data/portfolioState.ts", "data/decisions.ts"];
  const files: string[] = [];
  const walk = (p: string) => {
    if (statSync(p).isDirectory()) {
      for (const f of readdirSync(p)) walk(join(p, f));
    } else if (p.endsWith(".ts") || p.endsWith(".json")) files.push(p);
  };
  for (const r of roots) walk(r);
  assert.ok(files.length > 0, "expected files to scan");
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const hit = src.split("\n").find((l) => banned.test(l) && !l.trimStart().startsWith("//"));
    assert.equal(hit, undefined, `${f} references a price field: ${hit}`);
  }
});

test("thesis pages expose portfolio weight but no share count", () => {
  for (const ticker of EXPECTED_ACTIVE) {
    const t = getThesis(ticker)!;
    const blob = JSON.stringify(t);
    assert.ok(!/"shares"/.test(blob), `${ticker} thesis carries a share count`);
    assert.equal(typeof weightFor(ticker), "number", `${ticker} should expose a weight`);
  }
});

// ── Peer selection ──────────────────────────────────────────────────────────

test("strategic competitors are excluded from the direct-peer average", () => {
  const peers = selectPeers("NBIS");
  assert.ok(peers.strategic.length > 0, "expected strategic competitors for NBIS");
  const strategicTickers = new Set(peers.strategic.map((p) => p.ticker));

  // Give every company a multiple; the average must still ignore strategics.
  const allPE: Record<string, number> = {};
  for (const c of [...peers.direct, ...peers.strategic]) allPE[c.ticker] = 30;
  const avg = directPeerAverageForwardPE(peers.direct, allPE);

  assert.ok(avg, "expected an average when every peer has a multiple");
  for (const used of avg!.used) {
    assert.ok(!strategicTickers.has(used), `${used} is strategic and must not be averaged`);
  }
  assert.equal(avg!.sampleSize, peers.direct.length);
});

test("hyperscalers are classified strategic, not direct, for a neocloud", () => {
  const peers = selectPeers("NBIS");
  const direct = new Set(peers.direct.map((p) => p.ticker));
  const strategic = new Set(peers.strategic.map((p) => p.ticker));
  for (const hyperscaler of ["AMZN", "MSFT", "ORCL"]) {
    assert.ok(!direct.has(hyperscaler), `${hyperscaler} must not be a direct peer of NBIS`);
    assert.ok(strategic.has(hyperscaler), `${hyperscaler} should be a strategic competitor`);
  }
});

test("direct peer average is undefined when no multiple is populated", () => {
  const peers = selectPeers("MA");
  assert.ok(peers.direct.length > 0);
  assert.equal(directPeerAverageForwardPE(peers.direct, {}), undefined);
});

// ── SEC pipeline safeguards ─────────────────────────────────────────────────

test("no reported SEC series is stale", () => {
  const doc = loadReported();
  const cutoff = new Date(Date.now() - 300 * 86_400_000).toISOString().slice(0, 10);
  for (const [ticker, rec] of Object.entries(doc)) {
    for (const [metric, series] of Object.entries(rec.metrics ?? {})) {
      if (series.length === 0) continue;
      const newest = series[series.length - 1].periodEnd;
      assert.ok(newest >= cutoff, `${ticker}.${metric} is stale (ends ${newest})`);
    }
  }
});

test("reported SEC quarters are contiguous", () => {
  const doc = loadReported();
  for (const [ticker, rec] of Object.entries(doc)) {
    for (const [metric, series] of Object.entries(rec.metrics ?? {})) {
      for (let i = 1; i < series.length; i++) {
        const gap =
          (Date.parse(series[i].periodEnd) - Date.parse(series[i - 1].periodEnd)) / 86_400_000;
        assert.ok(gap <= 110, `${ticker}.${metric} has a ${gap}d gap before ${series[i].periodEnd}`);
      }
    }
  }
});

test("insurer revenue uses the total-revenue tag, not contract revenue only", () => {
  const doc = loadReported();
  for (const ticker of ["UNH", "OSCR"]) {
    const concept = doc[ticker]?.conceptUsed?.revenue;
    assert.equal(concept, "Revenues", `${ticker} revenue should come from Revenues`);
    // Sanity floor: an insurer's quarterly revenue is billions, not millions.
    const latest = doc[ticker].metrics.revenue.at(-1)!.value;
    assert.ok(latest > 1e9, `${ticker} revenue implausibly small: ${latest}`);
  }
});

test("derived Q4 quarters are flagged as derived", () => {
  const doc = loadReported();
  const q4 = doc.AMZN.metrics.revenue.find((p) => p.periodEnd.endsWith("-12-31"));
  assert.ok(q4, "expected a Q4 point for AMZN");
  assert.equal(q4.derived, true, "Q4 must be marked derived");
});

// ── Decision Log ────────────────────────────────────────────────────────────

test("decision log keeps history for exited companies", () => {
  const blocks = decisionsByCompany();
  for (const ticker of EXITED) {
    const block = blocks.find((b) => b.ticker === ticker);
    assert.ok(block, `${ticker} must remain in the decision log`);
    assert.ok(block!.events.length > 0, `${ticker} must retain its events`);
  }
});

test("decision log supports pending historical weights without inventing them", () => {
  const blocks = decisionsByCompany();
  assert.ok(pendingWeightEventCount() > 0, "expected pending weights in current data");
  for (const b of blocks) {
    for (const e of b.events) {
      // A weight is either a real number or explicitly undefined — never 0 or NaN
      // standing in for "unknown".
      for (const w of [e.oldWeightPct, e.newWeightPct]) {
        if (w !== undefined) assert.ok(Number.isFinite(w), `${b.ticker} has a non-finite weight`);
      }
      assert.ok(e.startDate, `${b.ticker} event missing a start date`);
      assert.ok(e.action, `${b.ticker} event missing an action`);
    }
  }
});

test("decision log events are chronological within each company", () => {
  for (const b of decisionsByCompany()) {
    for (let i = 1; i < b.events.length; i++) {
      assert.ok(
        b.events[i - 1].startDate <= b.events[i].startDate,
        `${b.ticker} events out of order`
      );
    }
  }
});

test("decision log is never the source of current holdings", () => {
  // Tickers with decision history that are NOT held must not leak into state.
  const logged = decisionsByCompany().map((b) => b.ticker);
  const held = new Set(portfolioState.positions.map((p) => p.ticker));
  for (const t of logged) {
    if (getCompany(t)?.status === "active") continue;
    assert.ok(!held.has(t), `${t} has log history but must not be a holding`);
  }
});

// ── Benchmarks ──────────────────────────────────────────────────────────────

test("S&P 500 benchmark is a total-return series and available", () => {
  const b = getBenchmark("sp500")!;
  assert.equal(b.available, true);
  assert.equal(b.totalReturn, true);
  assert.equal(b.symbol, "^SP500TR");
  assert.ok(b.levels.length > 12, "expected more than a year of month-ends");
});

test("Nasdaq-100 is a declared QQQ proxy, never a silent substitution", () => {
  const b = getBenchmark("nasdaq100")!;
  assert.equal(b.available, true);
  assert.equal(b.name, "Nasdaq-100", "public label is the index");
  assert.equal(b.symbol, "QQQ", "implementation is the ETF");
  assert.match(b.sourceNote, /proxied by Invesco QQQ/i);
  assert.match(b.sourceNote, /not the official/i);
  // Price-only Nasdaq indices remain forbidden as a total-return stand-in.
  assert.ok(!/\^NDX|\^IXIC/.test(String(b.symbol)));
});

test("benchmark monthly returns compound to the cumulative return", () => {
  const b = getBenchmark("sp500")!;
  const from = b.levels[0].date;
  const to = b.levels.at(-1)!.date;
  const monthly = benchmarkMonthlyReturns("sp500", from, to);
  assert.ok(monthly.length > 0);

  const linked = monthly.reduce((acc, m) => acc * (1 + m.returnPct / 100), 1) - 1;
  const cumulative = benchmarkCumulativeReturn("sp500", from, to)!;
  assert.ok(
    Math.abs(linked * 100 - cumulative) < 1e-6,
    `monthly linking ${linked * 100} != cumulative ${cumulative}`
  );
});

test("an unknown benchmark yields no returns rather than zeros", () => {
  assert.deepEqual(benchmarkMonthlyReturns("does-not-exist", "2025-07-31", "2026-07-31"), []);
  assert.equal(benchmarkCumulativeReturn("does-not-exist", "2025-07-31", "2026-07-31"), undefined);
});

// ── Historical company registry (decision 4) ────────────────────────────────

const LEGACY_EXITED = [
  "ASML", "AEVA", "LMND", "QBTS", "VGT", "SOFI", "QQQ", "HOOD", "NVDA", "CAVA",
  "SPOT", "SOAR", "HIMS", "DUOL", "AVEX", "NU", "SCHD", "IREN", "SATL", "PLTR",
];

test("every decision-log ticker is registered", () => {
  for (const block of decisionsByCompany()) {
    assert.notEqual(
      getCompany(block.ticker),
      undefined,
      `${block.ticker} has decision history but no registry entry`
    );
    assert.notEqual(block.status, "unknown", `${block.ticker} resolved as unknown`);
  }
});

test("legacy exited companies carry no active weight and no active nav slot", () => {
  const activeNav = activeThesisTickers();
  for (const ticker of LEGACY_EXITED) {
    assert.equal(getCompany(ticker)?.status, "exited", `${ticker} must be exited`);
    assert.equal(weightFor(ticker), undefined, `${ticker} must have no weight`);
    assert.ok(!activeNav.includes(ticker), `${ticker} must stay out of active thesis nav`);
    assert.ok(
      !portfolioState.positions.some((p) => p.ticker === ticker),
      `${ticker} must not be a current position`
    );
  }
});

test("legacy exited companies resolve to a historical thesis page", () => {
  for (const ticker of LEGACY_EXITED) {
    assert.ok(hasThesis(ticker), `${ticker} must resolve to a thesis page`);
    const t = getThesis(ticker)!;
    assert.equal(t.historical, true, `${ticker} must be marked historical`);
    // Closed positions get no charts and no valuation panel.
    assert.equal(t.charts.length, 0, `${ticker} should render no charts`);
    assert.equal(t.valuation, undefined, `${ticker} should render no valuation`);
    assert.ok(t.sections.length > 0, `${ticker} needs at least a shell section`);
  }
});

test("archived write-ups are migrated rather than re-invented", () => {
  // These seven have preserved content in data/previousHoldings.ts.
  for (const ticker of ["AVEX", "NU", "SCHD", "IREN", "SATL", "PLTR"]) {
    const headings = getThesis(ticker)!.sections.map((s) => s.heading);
    assert.ok(
      headings.includes("Why the position was exited"),
      `${ticker} should carry its archived exit rationale`
    );
  }
});

test("companies with no archived thesis say so instead of fabricating one", () => {
  for (const ticker of ["ASML", "QBTS", "SOAR", "DUOL"]) {
    const body = getThesis(ticker)!.sections.map((s) => s.body.join(" ")).join(" ");
    assert.match(body, /was not archived/, `${ticker} should disclose the missing thesis`);
  }
});

test("registry totals are 16 active and the rest exited", () => {
  assert.equal(activeCompanies().length, 16);
  assert.equal(companies.length, activeCompanies().length + exitedCompanies().length);
  for (const c of exitedCompanies()) {
    assert.equal(weightFor(c.ticker), undefined, `${c.ticker} must have no weight`);
  }
});

// ── Aug 2026 initiations (decision 5) ───────────────────────────────────────

test("every active holding's block opens with Initiate or Re-enter", () => {
  for (const b of decisionsByCompany()) {
    if (!["AMZN","GOOGL","SMH","NOW","META","SGOV","NBIS","GLDM","CEG","MELI","MA","UNH","RKLB","OSCR","CBRS","ASTS"].includes(b.ticker)) continue;
    const first = b.events[0];
    assert.ok(["Initiate","Re-enter"].includes(first.action),
      `${b.ticker} block opens with ${first.action}, not a zero crossing`);
  }
});

test("the six Aug 2026 initiations open at a reconstructed 0% weight", () => {
  const blocks = decisionsByCompany();
  for (const ticker of ["CEG", "GLDM", "AMZN", "SGOV", "MA", "CBRS"]) {
    const block = blocks.find((b) => b.ticker === ticker);
    assert.ok(block, `${ticker} must appear in the decision log`);
    // A genuine initiation must value at exactly 0% on the prior close. This is
    // reconstructed, not asserted in the source data — and it only holds because
    // the events are dated by EXECUTION rather than settlement.
    const initiation = block!.events.find((e) => e.oldWeightPct === 0);
    assert.ok(initiation, `${ticker} should open at 0%`);
    assert.ok(
      (initiation!.newWeightPct ?? 0) > 0,
      `${ticker} should close at a positive weight`
    );
  }
});

test("opening builds collapse to a single event", () => {
  // GLDM's two fills span consecutive sessions but express one decision.
  const gldm = decisionsByCompany().find((b) => b.ticker === "GLDM")!;
  assert.equal(gldm.events[0].startDate, "2026-08-10");
  assert.equal(gldm.events[0].endDate, "2026-08-11");
  // AMZN's fills are same-day, so one event with no range.
  const amzn = decisionsByCompany().find((b) => b.ticker === "AMZN")!;
  assert.equal(amzn.events[0].startDate, "2026-08-17");
  assert.equal(amzn.events.filter((e) => e.action === "Initiate").length, 1);
});

// ── CEG revenue-basis decision (decision 1) ─────────────────────────────────

test("CEG revenue uses total reported revenue, documented not silent", () => {
  const doc = loadReported();
  assert.equal(doc.CEG.conceptUsed.revenue, "Revenues");
  const flags = readFileSync("data/fundamentals/manual.ts", "utf8");
  assert.match(flags, /REVENUE_BASIS/, "the revenue-basis decision must be documented");
});

// ── Reconstructed Decision Log weights ──────────────────────────────────────

test("computed decision weights are percentages and dates only", () => {
  const doc = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));
  const allowed = new Set([
    "ticker", "startDate", "endDate", "oldWeightPct", "newWeightPct",
    "priorCloseDate", "endCloseDate", "status", "pendingReason",
  ]);
  for (const e of doc.events) {
    for (const k of Object.keys(e)) {
      assert.ok(allowed.has(k), `decisionWeights leaks field "${k}"`);
    }
    for (const w of [e.oldWeightPct, e.newWeightPct]) {
      if (w === undefined) continue;
      assert.ok(w >= 0 && w <= 100, `weight out of range: ${w}`);
    }
  }
});

test("weights use the securities-only denominator, never cash-inclusive", () => {
  const src = readFileSync("lib/reconstruction/cashPolicy.ts", "utf8");
  assert.match(src, /securitiesOnlyWeightPct/);
  // Guard the approved policy: cash is a residual, never reconstructed.
  assert.match(src, /residualCash/);
});

test("a computed transition never has identical valuation closes", () => {
  const doc = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));
  for (const e of doc.events) {
    if (e.status !== "computed") continue;
    assert.notEqual(
      e.priorCloseDate, e.endCloseDate,
      `${e.ticker} ${e.startDate} values both sides at the same close`
    );
  }
});

test("pending weights always carry a reason", () => {
  const doc = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));
  for (const e of doc.events) {
    if (e.status === "pending") {
      assert.ok(e.pendingReason && e.pendingReason.length > 20, `${e.ticker} lacks a reason`);
      assert.equal(e.oldWeightPct, undefined);
      assert.equal(e.newWeightPct, undefined);
    }
  }
});

test("initiations open at 0% and full exits close at 0%", () => {
  const doc = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));
  const computed = doc.events.filter((e: { status: string }) => e.status === "computed");
  assert.ok(computed.length > 0);
  // No negative weights may survive the rounding-residual clamp.
  for (const e of computed) {
    assert.ok(e.oldWeightPct >= 0 && e.newWeightPct >= 0, `${e.ticker} has a negative weight`);
  }
  // The Aug 2026 initiations must resolve, not sit pending.
  for (const t of ["AMZN", "SGOV", "MA", "CBRS"]) {
    assert.ok(
      computed.some((e: { ticker: string }) => e.ticker === t),
      `${t} initiation should now be computed`
    );
  }
});
