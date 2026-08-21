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

test("QQQ is never used as the Nasdaq-100 total-return benchmark", () => {
  const blob = JSON.stringify(performance.benchmarks);
  assert.ok(!/"symbol":\s*"QQQ"/.test(blob));
  for (const b of Object.values(performance.benchmarks)) {
    assert.notEqual(b.symbol, "QQQ", `${b.key} must not proxy with QQQ`);
  }
});

test("the ^NDX price index is never used as a total-return benchmark", () => {
  for (const b of Object.values(performance.benchmarks)) {
    assert.notEqual(b.symbol, "^NDX");
    assert.notEqual(b.symbol, "^IXIC");
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

test("an unavailable benchmark fabricates nothing", () => {
  const nq = performance.benchmarks.nasdaq100;
  assert.equal(nq.available, false);
  assert.equal(nq.cumulativeReturnPct, null, "no cumulative may be invented");
  assert.equal(nq.monthly.length, 0, "no monthly bars may be invented");
  assert.equal(nq.calendarYear.length, 0);
  assert.equal(nq.wealth.length, 0);
  assert.ok(nq.unavailableReason && nq.unavailableReason.length > 30);
  assert.ok(pendingBenchmarkViews().some((b) => b.key === "nasdaq100"));
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

test("historical holdings contain only exited names", () => {
  const active = new Set(activeCompanies().map((c) => c.ticker));
  assert.ok(performance.historicalHoldings.length > 0);
  for (const h of performance.historicalHoldings) {
    assert.ok(!active.has(h.ticker), `${h.ticker} is active and must not be historical`);
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
    const expected = geometricPerSessionReturn(h.totalReturnPct, h.sessionsHeld);
    assert.ok(
      expected !== undefined && Math.abs(expected - h.geometricPerSessionReturnPct) < 1e-9,
      `${h.ticker} geometric per-session return mismatch`
    );
  }
});

test("re-entered positions are measured over real intervals", () => {
  const reentered = [...performance.activeHoldings, ...performance.historicalHoldings]
    .filter((h) => h.reEntered);
  assert.ok(reentered.length > 0, "expected at least one re-entered holding");
  for (const h of reentered) {
    assert.ok(h.intervals.length > 1, `${h.ticker} should have multiple intervals`);
    const summed = h.intervals.reduce((s, i) => s + i.sessions, 0);
    assert.equal(summed, h.sessionsHeld, `${h.ticker} days must sum from real intervals`);
    // Intervals must not overlap or run backwards.
    for (let i = 1; i < h.intervals.length; i++) {
      assert.ok(h.intervals[i].from > h.intervals[i - 1].to, `${h.ticker} intervals overlap`);
    }
  }
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

test("27 computed and 34 pending Decision Log weights remain intact", () => {
  const doc = JSON.parse(readFileSync("data/decisionWeights.json", "utf8"));
  const computed = doc.events.filter((e: { status: string }) => e.status === "computed");
  const pending = doc.events.filter((e: { status: string }) => e.status === "pending");
  assert.equal(doc.events.length, 61);
  assert.equal(computed.length, 27);
  assert.equal(pending.length, 34);
});
