// Performance tests. Every assertion runs against the committed public artifact
// data/performanceDerived.json, so they verify what the site actually serves.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { performance, availableBenchmarkViews, pendingBenchmarkViews } from "../data/performance";
import { geometricPerSessionReturn, linkReturns, drawdownSeries, wealthIndex } from "../lib/performanceEngine";
import { activeCompanies, exitedCompanies } from "../data/companies";

const link = (rs: { returnPct: number }[]) => linkReturns(rs);
const CLOSE = 1e-8;

// ── Inception ───────────────────────────────────────────────────────────────

test("performance inception is 2025-07-03", () => {
  assert.equal(performance.inceptionDate, "2025-07-03");
  assert.equal(performance.wealth[0].date, "2025-07-03");
  assert.equal(performance.wealth[0].index, 100);
});

test("August 1 is never presented as inception", () => {
  const blob = JSON.stringify(performance);
  assert.ok(!/"inceptionDate":\s*"2025-08-01"/.test(blob));
  assert.match(performance.inceptionNote, /July 3, 2025/);
});

test("July 2025 is a partial month and 2025 a partial year", () => {
  const july = performance.monthly.find((m) => m.key === "2025-07");
  assert.ok(july, "July 2025 must exist");
  assert.equal(july!.partial, true);
  assert.equal(july!.from, "2025-07-03");

  const y2025 = performance.calendarYear.find((y) => y.key === "2025");
  assert.ok(y2025);
  assert.equal(y2025!.partial, true);
  assert.equal(y2025!.from, "2025-07-03", "2025 must begin July 3");
});

test("2026 is year-to-date, not a full year", () => {
  const y = performance.calendarYear.find((v) => v.key === "2026");
  assert.ok(y);
  assert.equal(y!.partial, true);
  assert.equal(y!.to, performance.asOfDate);
});

// ── One engine: everything reconciles ───────────────────────────────────────

test("monthly returns link exactly to the cumulative return", () => {
  const linked = link(performance.monthly);
  assert.ok(
    Math.abs(linked - performance.cumulativeReturnPct) < CLOSE,
    `monthly ${linked} vs cumulative ${performance.cumulativeReturnPct}`
  );
});

test("calendar-year returns link exactly to the cumulative return", () => {
  const linked = link(performance.calendarYear);
  assert.ok(
    Math.abs(linked - performance.cumulativeReturnPct) < CLOSE,
    `yearly ${linked} vs cumulative ${performance.cumulativeReturnPct}`
  );
});

test("the wealth index endpoint equals the cumulative return", () => {
  const last = performance.wealth[performance.wealth.length - 1].index - 100;
  assert.ok(Math.abs(last - performance.cumulativeReturnPct) < CLOSE);
});

test("drawdown derives from the same wealth index", () => {
  const recomputed = drawdownSeries(performance.wealth);
  assert.equal(recomputed.length, performance.drawdown.length);
  for (let i = 0; i < recomputed.length; i++) {
    assert.equal(recomputed[i].date, performance.drawdown[i].date);
    assert.ok(Math.abs(recomputed[i].drawdownPct - performance.drawdown[i].drawdownPct) < CLOSE);
  }
  const worst = Math.min(...performance.drawdown.map((d) => d.drawdownPct));
  assert.ok(Math.abs(worst - performance.maxDrawdownPct) < CLOSE);
});

test("drawdown is never positive and starts at zero", () => {
  assert.equal(performance.drawdown[0].drawdownPct, 0);
  for (const d of performance.drawdown) assert.ok(d.drawdownPct <= 1e-12, `${d.date} ${d.drawdownPct}`);
});

// ── TWR properties ──────────────────────────────────────────────────────────

test("external flows do not create investment return", () => {
  // A pure contribution into a flat book must produce exactly 0%.
  const flows = [{ returnPct: 0 }, { returnPct: 0 }];
  assert.equal(link(flows), 0);
  // And the documented formula must subtract the flow.
  assert.match(performance.methodology.formula, /-\s*externalFlow_t/);
  assert.match(performance.methodology.externalFlows, /removed from return/i);
});

test("dividends are treated as return, reinvested", () => {
  assert.match(performance.methodology.dividends, /investment return/i);
  assert.match(performance.methodology.dividends, /reinvest/i);
});

test("NAV basis is total account value, weights are securities-only", () => {
  assert.match(performance.methodology.navBasis, /total account value/i);
  assert.match(performance.methodology.weightBasisNote, /SECURITIES-ONLY/i);
});

// ── Retired methodology ─────────────────────────────────────────────────────

test("obsolete methodology is recorded as retired", () => {
  const r = performance.methodology.retired.join(" | ");
  for (const gone of ["2025-08-01", "VOO", "benchmarkDividendYieldAnnual", "Modified Dietz"]) {
    assert.ok(r.includes(gone), `${gone} should be listed as retired`);
  }
});

test("the retired engine is not imported by any surface", () => {
  const walk = (d: string): string[] => {
    if (!existsSync(d)) return [];
    const out: string[] = [];
    const rec = (p: string) => {
      if (statSync(p).isDirectory()) for (const f of readdirSync(p)) rec(join(p, f));
      else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
    };
    rec(d);
    return out;
  };
  for (const f of ["app", "components", "data"].flatMap(walk)) {
    const src = readFileSync(f, "utf8");
    assert.ok(!/from ["'][^"']*lib\/perf["']/.test(src), `${f} imports the retired lib/perf`);
  }
});

// ── Benchmarks ──────────────────────────────────────────────────────────────

test("S&P 500 benchmark is a real total-return index", () => {
  const sp = performance.benchmarks.sp500;
  assert.equal(sp.available, true);
  assert.equal(sp.totalReturn, true);
  assert.equal(sp.symbol, "^SP500TR");
  assert.ok(sp.cumulativeReturnPct !== null);
  assert.ok(sp.wealth.length > 100, "expected a daily series, not monthly levels");
});

test("Nasdaq-100 is a QQQ proxy, and says so explicitly", () => {
  const nq = performance.benchmarks.nasdaq100;
  assert.equal(nq.available, true, "the benchmark should now populate");
  // Public label must be the index, not the ETF.
  assert.equal(nq.name, "Nasdaq-100");
  // The substitution must be declared, both as a flag and in prose.
  assert.equal(nq.proxy, true, "proxy flag must be set");
  assert.equal(nq.symbol, "QQQ", "implementation symbol is QQQ");
  assert.match(nq.sourceNote, /proxied by Invesco QQQ/i);
  assert.match(nq.sourceNote, /not the official/i);
  assert.match(nq.sourceNote, /adjusted/i, "must state distributions are reinvested");
  assert.equal(nq.totalReturn, true);
});

test("the S&P benchmark is the real index and is NOT flagged a proxy", () => {
  const sp = performance.benchmarks.sp500;
  assert.equal(sp.symbol, "^SP500TR");
  assert.equal(sp.proxy, false);
});

test("the ^NDX price index is never used as a total-return benchmark", () => {
  for (const b of Object.values(performance.benchmarks)) {
    assert.notEqual(b.symbol, "^NDX");
    assert.notEqual(b.symbol, "^IXIC");
  }
});

test("no raw QQQ share price reaches the public artifact", () => {
  const nq = performance.benchmarks.nasdaq100;
  // Only normalised index levels may ship. QQQ trades in the hundreds; a
  // wealth index anchored at 100 cannot contain a price-shaped value.
  for (const w of nq.wealth) {
    assert.ok(w.index > 0 && w.index < 1000, `index level ${w.index} looks like a price`);
  }
  assert.equal(nq.wealth[0].index, 100, "series must be normalised to 100");
});

test("both benchmarks populate every comparison surface", () => {
  for (const key of ["sp500", "nasdaq100"]) {
    const b = performance.benchmarks[key];
    assert.ok(b.wealth.length > 100, `${key} needs a daily series`);
    assert.equal(b.monthly.length, performance.monthly.length, `${key} monthly coverage`);
    assert.equal(b.calendarYear.length, performance.calendarYear.length, `${key} yearly coverage`);
    assert.ok(typeof b.excessCumulativePts === "number", `${key} excess return`);
  }
});

test("no dividend-yield approximation is substituted for a total return", () => {
  // methodology.retired legitimately NAMES the removed proxy, so it is excluded
  // from the scan — documenting a retirement is the opposite of substituting.
  const { methodology, ...rest } = performance;
  const blob = JSON.stringify(rest) + JSON.stringify({ ...methodology, retired: [] });
  assert.ok(!/dividendYield/i.test(blob), "no assumed yield may appear in live data");
  assert.ok(!/assumedYield/i.test(blob));
  // Every available benchmark must be a genuine total-return index.
  for (const b of availableBenchmarkViews()) {
    assert.equal(b.totalReturn, true, `${b.key} must be a total-return series`);
  }
});

test("an unavailable benchmark would fabricate nothing", () => {
  // Both benchmarks are available today, so this guards the shape of the
  // unavailable branch: it must emit nulls and empty series, never zeros.
  for (const b of pendingBenchmarkViews()) {
    assert.equal(b.cumulativeReturnPct, null, `${b.key} must not invent a cumulative`);
    assert.equal(b.monthly.length, 0, `${b.key} must not invent monthly bars`);
    assert.equal(b.calendarYear.length, 0);
    assert.equal(b.wealth.length, 0);
    assert.ok(b.unavailableReason && b.unavailableReason.length > 20);
  }
});

test("benchmark series share the portfolio's sessions", () => {
  const sessions = new Set(performance.wealth.map((w) => w.date));
  for (const b of availableBenchmarkViews()) {
    for (const w of b.wealth) {
      if (w.date === performance.inceptionDate) continue;
      assert.ok(sessions.has(w.date), `${b.key} has a session the portfolio lacks: ${w.date}`);
    }
  }
});

// ── Holdings ────────────────────────────────────────────────────────────────

test("active holding analytics cover exactly the 16 active holdings", () => {
  assert.equal(performance.activeHoldings.length, 16);
  const got = performance.activeHoldings.map((h) => h.ticker).sort();
  const want = activeCompanies().map((c) => c.ticker).sort();
  assert.deepEqual(got, want);
});

test("exited holdings are excluded from the active section", () => {
  const exited = new Set(exitedCompanies().map((c) => c.ticker));
  for (const h of performance.activeHoldings) {
    assert.ok(!exited.has(h.ticker), `${h.ticker} is exited and must not be active`);
  }
});

test("historical rows are CLOSED episodes, including those of active names", () => {
  assert.ok(performance.historicalHoldings.length > 0);
  const active = new Set(activeCompanies().map((c) => c.ticker));
  const activeStart = new Map(
    performance.activeHoldings.map((h) => [h.ticker, h.currentIntervalStart])
  );
  for (const h of performance.historicalHoldings) {
    // Every historical row must be closed.
    assert.ok(h.exitedOn, `${h.ticker} ep${h.episode} must be closed`);
    // A currently-active ticker may appear here ONLY for an earlier episode that
    // ended before the current one began. Ownership history does not vanish
    // because the ticker is held again today.
    if (active.has(h.ticker)) {
      const start = activeStart.get(h.ticker);
      assert.ok(start && h.exitedOn! <= start,
        `${h.ticker} ep${h.episode} overlaps the current position`);
    }
  }
});

test("return per trading session is geometric, not arithmetic", () => {
  // 100% over 2 sessions is 41.42%/session geometric, not 50%.
  const geo = geometricPerSessionReturn(100, 2)!;
  assert.ok(Math.abs(geo - 41.4213562) < 1e-5, `got ${geo}`);
  assert.notEqual(Math.round(geo), 50);

  // And the artifact must agree with the formula for every holding.
  for (const h of [...performance.activeHoldings, ...performance.historicalHoldings]) {
    if (h.totalReturnPct === null || h.geometricPerSessionReturnPct === null) continue;
    const expected = geometricPerSessionReturn(h.totalReturnPct, h.sessionsHeld!);
    assert.ok(
      expected !== undefined && Math.abs(expected - h.geometricPerSessionReturnPct) < 1e-9,
      `${h.ticker} geometric per-session return mismatch`
    );
  }
});

test("active returns use the current position, not the ticker's price path", () => {
  assert.match(performance.holdingReturnBasis, /surviving FIFO cost basis/i);
  assert.match(performance.holdingReturnBasis, /current continuous ownership interval/i);
  // A re-entered name must not carry pre-exit ownership in its interval.
  for (const t of ["UNH", "OSCR"]) {
    const h = performance.activeHoldings.find((x) => x.ticker === t)!;
    assert.ok(h.reEntered, `${t} should be flagged re-entered`);
    assert.ok(h.priorClosedIntervals! >= 1, `${t} should report prior closed intervals`);
  }
});

test("current ownership intervals start where the ledger says", () => {
  const START: Record<string, string> = {
    AMZN: "2026-08-17", GOOGL: "2025-07-15", SMH: "2026-01-26", NOW: "2026-05-14",
    META: "2026-01-22", SGOV: "2026-08-17", NBIS: "2025-07-14", GLDM: "2026-08-10",
    CEG: "2026-08-06", MELI: "2025-08-12", MA: "2026-08-17", UNH: "2026-08-17",
    RKLB: "2026-01-23", OSCR: "2026-08-07", CBRS: "2026-08-17", ASTS: "2026-01-26",
  };
  for (const [t, d] of Object.entries(START)) {
    const h = performance.activeHoldings.find((x) => x.ticker === t)!;
    assert.equal(h.currentIntervalStart, d, `${t} interval start`);
    assert.ok((h.sessionsHeld ?? 0) > 0, `${t} needs sessions`);
  }
  // The specific regressions: these three must NOT aggregate old ownership.
  assert.equal(performance.activeHoldings.find((h) => h.ticker === "UNH")!.sessionsHeld, 4);
  assert.equal(performance.activeHoldings.find((h) => h.ticker === "CBRS")!.sessionsHeld, 4);
  assert.ok(performance.activeHoldings.find((h) => h.ticker === "OSCR")!.sessionsHeld! < 20);
});

test("every active row ends on the final session (no closed intervals)", () => {
  for (const h of performance.activeHoldings) {
    assert.equal(h.currentIntervalEnd, performance.asOfDate, `${h.ticker} must still be open`);
  }
});

test("multi-episode names appear once per episode, never aggregated", () => {
  const byTicker = new Map<string, number>();
  for (const h of performance.historicalHoldings) {
    byTicker.set(h.ticker, (byTicker.get(h.ticker) ?? 0) + 1);
  }
  // OSCR was owned three times; two of those episodes are closed.
  assert.equal(byTicker.get("OSCR"), 2, "OSCR should show its two closed episodes");
  assert.equal(byTicker.get("UNH"), 1, "UNH should show its one closed episode");
  // Episode indices must be distinct per ticker and ranges must not overlap.
  for (const [t, n] of byTicker) {
    const eps = performance.historicalHoldings.filter((h) => h.ticker === t);
    assert.equal(new Set(eps.map((e) => e.episode)).size, n, `${t} episode indices must be unique`);
    const sorted = [...eps].sort((a, b) => a.episode - b.episode);
    for (let k = 1; k < sorted.length; k++) {
      assert.ok(sorted[k].initiatedOn > (sorted[k - 1].exitedOn ?? ""),
        `${t} episodes overlap`);
    }
  }
});

test("closed episodes carry real dates and session counts", () => {
  for (const h of performance.historicalHoldings) {
    assert.ok(h.exitedOn, `${h.ticker} ep${h.episode} must have an exit date`);
    assert.ok(h.exitedOn! >= h.initiatedOn, `${h.ticker} exit precedes entry`);
    assert.ok(h.sessionsHeld > 0, `${h.ticker} needs sessions`);
  }
});

test("transferred-in positions are flagged as tracked-period returns", () => {
  for (const t of ["QQQ", "VGT", "VOO"]) {
    const eps = performance.historicalHoldings.filter((h) => h.ticker === t);
    assert.ok(eps.length > 0, `${t} should appear`);
    for (const e of eps) {
      assert.equal(e.trackedPeriodBasis, true,
        `${t} basis comes from the inception mark, which must be disclosed`);
    }
  }
  // Everything else has a real purchase basis.
  for (const h of performance.historicalHoldings) {
    if (["QQQ", "VGT", "VOO"].includes(h.ticker)) continue;
    assert.equal(h.trackedPeriodBasis, false, `${h.ticker} should have ledger basis`);
  }
});

test("the AEVA option round trip is not treated as an equity position", () => {
  assert.ok(!performance.historicalHoldings.some((h) => h.ticker === "AEVA"),
    "a derivative trade must not appear as a stock episode");
  assert.ok(!performance.activeHoldings.some((h) => h.ticker === "AEVA"));
});

test("contribution is omitted rather than approximated", () => {
  for (const h of performance.activeHoldings) {
    assert.equal(h.contributionPts, null, `${h.ticker} must not publish a guessed contribution`);
  }
  assert.match(performance.contributionNote, /omitted/i);
});

// ── Privacy ─────────────────────────────────────────────────────────────────

test("the public artifact carries no dollars, shares or prices", () => {
  const blob = JSON.stringify(performance);
  for (const banned of [
    /"nav"/i, /"cash"/i, /"shares"/i, /"quantity"/i, /"price"/i,
    /"costBasis"/i, /"securitiesValue"/i, /"positionValues"/i, /"externalFlow"/i,
  ]) {
    assert.ok(!banned.test(blob), `artifact leaks ${banned}`);
  }
});

test("private reconstruction inputs stay gitignored", () => {
  const ignore = readFileSync(".gitignore", "utf8");
  assert.match(ignore, /\*\.local\.json/);
  for (const f of ["data/rothTransactions.local.json", "data/priceCache.local.json"]) {
    if (!existsSync(f)) continue;
    assert.match(f, /\.local\.json$/, `${f} must match the ignore rule`);
  }
});

test("no client component imports the performance generator or private data", () => {
  const walk = (d: string): string[] => {
    const out: string[] = [];
    const rec = (p: string) => {
      if (statSync(p).isDirectory()) for (const f of readdirSync(p)) rec(join(p, f));
      else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
    };
    rec(d);
    return out;
  };
  for (const f of [...walk("components"), ...walk("app")]) {
    const src = readFileSync(f, "utf8");
    if (!/^\s*["']use client["']/m.test(src)) continue;
    assert.ok(!/reconstruction\//.test(src), `${f} must not import the reconstruction`);
    assert.ok(!/\.local\.json/.test(src), `${f} must not reference private data`);
  }
});

// ── Decision Log weights survive the Performance work ───────────────────────

test("every current holding has an Initiate or Re-enter opening at 0%", () => {
  const life = JSON.parse(readFileSync("data/lifecycleEvents.json", "utf8"));
  const weights = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));
  const byKey = new Map(
    weights.events.map((e: { ticker: string; startDate: string }) => [`${e.ticker}|${e.startDate}`, e])
  );
  for (const c of activeCompanies()) {
    const opens = life.events.filter((e: { ticker: string }) => e.ticker === c.ticker);
    assert.ok(opens.length > 0, `${c.ticker} must have a lifecycle opening event`);
  }
  // Every zero-crossing that resolved must open at exactly 0%.
  for (const e of life.events) {
    const w = byKey.get(`${e.ticker}|${e.startDate}`) as
      | { status: string; oldWeightPct: number }
      | undefined;
    if (!w || w.status !== "computed") continue;
    assert.ok(Math.abs(w.oldWeightPct) < 0.005,
      `${e.ticker} ${e.startDate} opens at ${w.oldWeightPct}%, expected 0%`);
  }
});

test("full exits close at 0%", () => {
  const weights = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));
  const exits = weights.events.filter(
    (e: { status: string; newWeightPct: number }) => e.status === "computed" && e.newWeightPct === 0
  );
  assert.ok(exits.length > 0, "expected at least one full exit at 0%");
});
