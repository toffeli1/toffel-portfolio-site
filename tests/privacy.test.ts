// Privacy tests: private reconstruction inputs must never reach public output.
//
// Two independent guards, because either alone is insufficient:
//   1. STATIC — no client component (or any committed module) may import the
//      private ledger, the price cache, or the reconstruction pipeline.
//   2. ARTIFACT — committed data files carry no prices, quantities, dollar
//      values, transaction descriptions or account identifiers.

import { test } from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_EXCLUDED_TICKERS } from "../lib/reconstruction/exclusions";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

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

// ─── Account identifiers must never reach a committed artifact ────────────────

test("no public artifact carries an account identifier", () => {
  const artifacts = [
    "data/performanceDerived.json",
    "data/lifecycleEvents.json",
    "data/decisionWeights.json",
    "data/benchmarkSeries.json",
  ];
  // Shapes an account id could take: masked tails, long digit runs, and the
  // provenance keys the guard reads.
  const banned: [RegExp, string][] = [
    [/\*{2,}\d{3,}/, "masked account number"],
    [/\baccount_?[Ii]d\b/, "account id field"],
    [/\bsourceAccountId\b/, "source account id"],
    [/ending in \d{4}/, "counterparty account tail"],
    [/\bRH-[A-Z]+-/, "broker account identifier"],
  ];
  for (const f of artifacts) {
    if (!existsSync(f)) continue;
    const raw = readFileSync(f, "utf8");
    for (const [re, label] of banned) {
      assert.ok(!re.test(raw), `${f} contains a ${label}`);
    }
  }
});

test("the private reconstruction config and ledger are not tracked", () => {
  const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n");
  for (const f of [
    "data/rothTransactions.local.json",
    "data/reconstructionConfig.local.json",
    "data/priceCache.local.json",
  ]) {
    assert.ok(!tracked.includes(f), `${f} must never be tracked`);
  }
});

// ─── Owner-directed presentation exclusions ──────────────────────────────────

test("publicly excluded tickers appear in no artifact, registry or page", () => {
  const files = execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .filter((f) => /\.(ts|tsx|json|md)$/.test(f))
    .filter((f) => f !== "lib/reconstruction/exclusions.ts" && !f.startsWith("tests/"));

  for (const ticker of PUBLIC_EXCLUDED_TICKERS) {
    const word = new RegExp(`\\b${ticker}\\b`);
    for (const f of files) {
      if (!existsSync(f)) continue;
      assert.ok(!word.test(readFileSync(f, "utf8")), `${f} still mentions ${ticker}`);
    }
  }
});

test("excluded tickers are absent from every derived holding row", () => {
  const derived = JSON.parse(readFileSync("data/performanceDerived.json", "utf8"));
  const rows = [...derived.activeHoldings, ...derived.historicalHoldings];
  for (const r of rows) {
    assert.ok(!PUBLIC_EXCLUDED_TICKERS.has(r.ticker), `${r.ticker} must not be published`);
  }
});

// ─── Repo-wide sweep for per-share / dollar values ───────────────────────────
// The fixed-list check above missed data/holdings.ts, which carried real
// averageCost values for ten positions: its regex only matched JSON-quoted keys
// ("costBasis"), not TypeScript object literals (averageCost: 123.45), and the
// file was not on the list. This sweep covers EVERY tracked data module in both
// syntaxes, so "internal only, never rendered" cannot be used as a boundary in
// a public repository again.

test("no tracked file assigns a numeric per-share or dollar value", () => {
  const files = execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .filter((f) => /^(data|lib|components|app|scripts)\/.*\.(ts|tsx|json)$/.test(f))
    // Test fixtures and the guard's own pattern lists name these fields on purpose.
    .filter((f) => !f.startsWith("tests/"));

  // Field names that carry money or share counts, in TS-literal or JSON form,
  // assigned a NON-ZERO number. Type declarations (`averageCost: number`),
  // regex/ban-list mentions, and zero-initialised accumulators
  // (`proceeds: 0`) are not disclosures and do not match.
  const banned = new RegExp(
    '"?\\b(' +
      [
        "averageCost", "avgCost", "averageCostPerShare", "costBasis", "cost_basis",
        "pricePerShare", "price_per_share", "entryPrice", "estimatedEntryPrice",
        "purchasePrice", "lastPrice", "currentPrice", "quotePrice", "marketValue",
        "amountUsd", "proceeds", "navDollars", "cashBalance",
      ].join("|") +
      ')\\b"?\\s*:\\s*-?(?!0[,;\\s}]|0$)\\d',
    "i"
  );

  const offenders: string[] = [];
  for (const f of files) {
    if (!existsSync(f)) continue;
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (banned.test(line)) offenders.push(`${f}:${i + 1} ${line.trim().slice(0, 70)}`);
    });
  }
  assert.deepEqual(offenders, [], `real money/share values in tracked files:\n${offenders.join("\n")}`);
});

test("share quantities are not assigned in tracked files", () => {
  // scripts/ is included deliberately: a dev diagnostic had a hardcoded table of
  // exact ending share counts for all 16 holdings. Expected quantities belong in
  // the gitignored reconstruction config, never in a tracked file.
  const files = execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .filter((f) => /^(data|lib|scripts)\/.*\.(ts|json)$/.test(f));
  const banned = /"?\b(shares|shareCount|quantity|qty|lotQuantity)\b"?\s*:\s*-?(?!0[,;\s}]|0$)\d/i;
  const offenders: string[] = [];
  for (const f of files) {
    if (!existsSync(f)) continue;
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (banned.test(line)) offenders.push(`${f}:${i + 1} ${line.trim().slice(0, 70)}`);
    });
  }
  assert.deepEqual(offenders, [], `share quantities in tracked files:\n${offenders.join("\n")}`);
});

test("no ticker-keyed table of fractional quantities is tracked", () => {
  // The field-name sweep above cannot see a table keyed by TICKER rather than by
  // a telling field name — which is exactly the shape the leak took:
  //   const EXPECTED = { TICKER: 12, OTHER: 3.456789, ... }   (shape, synthetic)
  // The broker exports quantities to six decimals, while every legitimate
  // ticker-keyed constant in this repo holds a percentage quoted to two. So a
  // ticker key assigned four or more decimal places is a share count.
  // Scoped to TS sources: the JSON artifacts carry normalised index levels at
  // high precision by design and are validated field-by-field elsewhere.
  const files = execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .filter((f) => /^(data|lib|scripts|components|app)\/.*\.tsx?$/.test(f));

  const fractional = /\b[A-Z]{1,6}:\s*-?\d+\.\d{4,}/;
  const offenders: string[] = [];
  for (const f of files) {
    if (!existsSync(f)) continue;
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (fractional.test(line)) offenders.push(`${f}:${i + 1} ${line.trim().slice(0, 70)}`);
    });
  }
  assert.deepEqual(offenders, [],
    `fractional share quantities in tracked source:\n${offenders.join("\n")}`);
});
