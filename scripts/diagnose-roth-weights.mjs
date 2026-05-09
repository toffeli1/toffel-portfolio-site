#!/usr/bin/env node
// One-off correctness check: fetches Finnhub quotes for every Roth ticker
// and prints the derived weight table so we can sanity-check before
// committing share-count changes.
//
// Run from repo root:
//   node scripts/diagnose-roth-weights.mjs
//
// Reads FINNHUB_API_KEY from .env.local.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(
  readFileSync(resolve(".env.local"), "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    })
);
const KEY = env.FINNHUB_API_KEY;
if (!KEY) {
  console.error("FINNHUB_API_KEY missing from .env.local");
  process.exit(1);
}

const SHARES = {
  VOO: 16.83,  AMD: 8.46,   UNH: 3.82,  NBIS: 7.47,  DLO: 77.09,
  GOOGL: 4.33, FBTC: 34.09, MELI: 1.00, NU: 37.62,   META: 1.99,
  RKLB: 12.75, SMH: 3.25,   ASTS: 8.00, AVEX: 13.74,
};
const FALLBACK = {
  VOO: 31.60,  AMD: 9.55,   UNH: 4.71,  NBIS: 4.16,  DLO: 3.61,
  GOOGL: 5.06, FBTC: 7.69,  MELI: 6.54, NU: 1.98,    META: 4.67,
  RKLB: 3.90,  SMH: 2.90,   ASTS: 1.67, AVEX: 1.33,
};

async function fetchPrice(ticker) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const d = await res.json();
  return d.c || d.pc || null;
}

const tickers = Object.keys(SHARES);
const prices = Object.fromEntries(
  await Promise.all(tickers.map(async (t) => [t, await fetchPrice(t)]))
);

// Mirrors lib/portfolioCalculations.ts:deriveSleeveHoldings — Option B math.
// Sum of weights is guaranteed ~100% in all three coverage branches.
function derive(suppressed = new Set()) {
  const liveValues = {};
  let totalLiveValue = 0;
  let staticPctLive = 0;
  let staticPctTotal = 0;
  const fallbacks = [];

  for (const t of tickers) {
    staticPctTotal += FALLBACK[t];
    const p = suppressed.has(t) ? null : prices[t];
    if (p && p > 0) {
      liveValues[t] = SHARES[t] * p;
      totalLiveValue += liveValues[t];
      staticPctLive += FALLBACK[t];
    } else {
      fallbacks.push(t);
    }
  }
  let impliedTotal = 0;
  let totalAll;
  let mode;
  if (totalLiveValue > 0 && staticPctLive > 0) {
    impliedTotal = totalLiveValue / (staticPctLive / 100);
    totalAll = (impliedTotal * staticPctTotal) / 100;
    mode = fallbacks.length === 0 ? "all-live" : "mixed";
  } else {
    totalAll = staticPctTotal;
    mode = "static-only";
  }
  const rows = tickers.map((t) => {
    const liveVal = liveValues[t];
    let value;
    if (liveVal !== undefined) value = liveVal;
    else if (mode === "static-only") value = FALLBACK[t];
    else value = impliedTotal * (FALLBACK[t] / 100);
    const pct = totalAll > 0 ? (value / totalAll) * 100 : FALLBACK[t];
    return { t, p: prices[t], suppressed: suppressed.has(t), liveVal, pct };
  });
  return { rows, mode, fallbacks, totalLiveValue, impliedTotal, totalAll };
}

const colW = (s, w) => String(s).padEnd(w);
const colN = (n, w, dec = 2) => (typeof n === "number" ? n.toFixed(dec) : "—").padStart(w);

function printTable(title, result) {
  console.log();
  console.log(title);
  console.log("=".repeat(98));
  console.log(
    colW("ticker", 8) +
    colN("shares", 9) +
    colN("livePrice", 12) +
    colN("currentVal", 14) +
    colN("portfolioPct", 14) +
    colN("fallbackPct", 14) +
    "  isFallback"
  );
  console.log("-".repeat(98));
  let sum = 0;
  for (const r of result.rows) {
    sum += r.pct;
    const isFb = r.liveVal === undefined;
    console.log(
      colW(r.t, 8) +
      colN(SHARES[r.t], 9) +
      colN(r.suppressed ? null : r.p, 12) +
      colN(r.liveVal, 14) +
      colN(r.pct, 14) +
      colN(FALLBACK[r.t], 14) +
      "  " + (isFb ? "TRUE" : "")
    );
  }
  console.log("-".repeat(98));
  console.log(`mode=${result.mode}  totalLive=$${result.totalLiveValue.toFixed(2)}  impliedTotal=$${result.impliedTotal.toFixed(2)}  totalAll=$${result.totalAll.toFixed(2)}`);
  console.log(`sum=${sum.toFixed(2)}%  fallbackCount=${result.fallbacks.length}` +
    (result.fallbacks.length > 0 ? `  (${result.fallbacks.join(", ")})` : ""));
}

printTable("ROTH WEIGHT DIAGNOSTIC — full live coverage", derive());
printTable(
  "ROTH WEIGHT DIAGNOSTIC — partial coverage (AMD, NU, RKLB, AVEX simulated missing)",
  derive(new Set(["AMD", "NU", "RKLB", "AVEX"]))
);
console.log();
