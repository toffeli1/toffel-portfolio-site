// Privacy tests: private reconstruction inputs must never reach public output.
//
// Two independent guards, because either alone is insufficient:
//   1. STATIC — no client component (or any committed module) may import the
//      private ledger, the price cache, or the reconstruction pipeline.
//   2. ARTIFACT — committed data files carry no prices, quantities, dollar
//      values, transaction descriptions or account identifiers.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string, exts = [".ts", ".tsx"]): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const rec = (p: string) => {
    const s = statSync(p);
    if (s.isDirectory()) {
      for (const f of readdirSync(p)) rec(join(p, f));
    } else if (exts.some((e) => p.endsWith(e))) out.push(p);
  };
  rec(dir);
  return out;
}

const SOURCE_DIRS = ["app", "components", "lib", "data"];
const allSource = SOURCE_DIRS.flatMap((d) => walk(d));

// ── 1. Static import boundaries ─────────────────────────────────────────────

test("no committed module imports a *.local.json private file", () => {
  for (const f of allSource) {
    const src = readFileSync(f, "utf8");
    const lines = src.split("\n").filter((l) => !l.trimStart().startsWith("//") && !l.trimStart().startsWith("*"));
    const hit = lines.find((l) => /\.local\.json/.test(l) && /\b(import|require|from)\b/.test(l));
    assert.equal(hit, undefined, `${f} imports a private file: ${hit}`);
  }
});

test("no client component imports the reconstruction pipeline", () => {
  const clientFiles = allSource.filter((f) => {
    const src = readFileSync(f, "utf8");
    return /^\s*["']use client["']/m.test(src);
  });
  assert.ok(clientFiles.length > 0, "expected to find client components to check");
  for (const f of clientFiles) {
    const src = readFileSync(f, "utf8");
    assert.ok(
      !/reconstruction\//.test(src),
      `${f} is a client component and must not import lib/reconstruction`
    );
    assert.ok(
      !/priceCache|rothTransactions/.test(src),
      `${f} is a client component and must not reference private data`
    );
  }
});

test("the reconstruction pipeline is server-only (no 'use client')", () => {
  for (const f of walk("lib/reconstruction")) {
    const src = readFileSync(f, "utf8");
    assert.ok(!/^\s*["']use client["']/m.test(src), `${f} must not be a client module`);
  }
});

// ── 2. Committed artifacts carry no private values ──────────────────────────

/** Committed data files that must contain percentages/identifiers only. */
const PUBLIC_DATA = [
  "data/toffel_investments_public.json",
  "data/benchmarkSeries.json",
];

test("public portfolio data contains no dollar or quantity fields", () => {
  const banned = /"(price|prices|shares|quantity|qty|cost_basis|costBasis|amount|amountUsd|nav|marketValue|dollar)"/i;
  for (const f of PUBLIC_DATA) {
    if (!existsSync(f)) continue;
    const src = readFileSync(f, "utf8");
    const hit = src.split("\n").find((l) => banned.test(l));
    assert.equal(hit, undefined, `${f} exposes a private-shaped field: ${hit}`);
  }
});

test("the public weights file holds only tickers and percentages", () => {
  const doc = JSON.parse(readFileSync("data/toffel_investments_public.json", "utf8"));
  for (const h of doc.holdings) {
    assert.deepEqual(
      Object.keys(h).sort(),
      ["ticker", "weight_pct"],
      `unexpected keys on ${h.ticker}: ${Object.keys(h)}`
    );
    assert.ok(h.weight_pct > 0 && h.weight_pct < 100, `${h.ticker} weight out of range`);
  }
});

test("benchmark series carries index levels only, no portfolio values", () => {
  interface BenchmarkDoc {
    benchmarks: Record<string, { levels: Record<string, unknown>[] }>;
  }
  const doc = JSON.parse(readFileSync("data/benchmarkSeries.json", "utf8")) as BenchmarkDoc;
  for (const b of Object.values(doc.benchmarks)) {
    for (const l of b.levels) {
      assert.deepEqual(Object.keys(l).sort(), ["date", "level"]);
    }
  }
});

test("private files are gitignored, not merely absent", () => {
  const ignore = readFileSync(".gitignore", "utf8");
  assert.match(ignore, /\*\.local\.json/, "*.local.json must be ignored");
  assert.match(ignore, /\*\.local\.ts/, "*.local.ts must be ignored");
});

// ── 3. Built output ─────────────────────────────────────────────────────────
// Skipped when .next isn't present so the suite runs before a build.

test("built HTML contains no private transaction vocabulary", (t) => {
  if (!existsSync(".next/server/app")) return t.skip("no build output");
  const html = walk(".next/server/app", [".html"]);
  assert.ok(html.length > 0, "expected prerendered HTML");
  // Targets PRIVATE VALUES and identifiers. Deliberately not the word
  // "settlement" on its own — the Decision Log legitimately explains that a
  // logged date was a settlement date rather than an execution date, which is
  // methodology, not disclosure.
  const banned = [
    /transaction_datetime/,
    /pricePerShare/,
    /account (number|ending)/i,
    /\bshares held\b/i,
    /rothTransactions/,
    /priceCache/,
  ];
  for (const f of html) {
    const src = readFileSync(f, "utf8");
    for (const re of banned) {
      assert.ok(!re.test(src), `${f} leaks ${re}`);
    }
  }
});
