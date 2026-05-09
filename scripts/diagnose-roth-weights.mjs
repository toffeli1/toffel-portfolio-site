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

let total = 0;
const liveValues = {};
const fallbacks = [];
for (const t of tickers) {
  const p = prices[t];
  if (p && p > 0) {
    liveValues[t] = SHARES[t] * p;
    total += liveValues[t];
  } else {
    fallbacks.push(t);
  }
}

const colW = (s, w) => String(s).padEnd(w);
const colN = (n, w, dec = 2) => (typeof n === "number" ? n.toFixed(dec) : "—").padStart(w);

console.log();
console.log("ROTH WEIGHT DIAGNOSTIC");
console.log("=".repeat(95));
console.log(
  colW("ticker", 8) +
  colN("shares", 9) +
  colN("livePrice", 12) +
  colN("currentVal", 14) +
  colN("portfolioPct", 14) +
  colN("fallbackPct", 14) +
  "  isFallback"
);
console.log("-".repeat(95));

let derivedSum = 0;
for (const t of tickers) {
  const p = prices[t];
  const v = liveValues[t];
  const pct = v ? (v / total) * 100 : FALLBACK[t];
  const isFb = !v;
  derivedSum += pct;
  console.log(
    colW(t, 8) +
    colN(SHARES[t], 9) +
    colN(p, 12) +
    colN(v, 14) +
    colN(pct, 14) +
    colN(FALLBACK[t], 14) +
    "  " + (isFb ? "TRUE" : "")
  );
}
console.log("-".repeat(95));
console.log(`Total live value: $${total.toFixed(2)}`);
console.log(`Sum of derived %: ${derivedSum.toFixed(2)}%`);
if (fallbacks.length) {
  console.log(`Fallback tickers: ${fallbacks.join(", ")}`);
}
console.log();
