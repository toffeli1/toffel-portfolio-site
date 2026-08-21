// Dev-only: replay the full private ledger and verify ending share counts.
// Run: npx tsx scripts/dev/validateLedger.ts
import { readFileSync } from "node:fs";
import { reconstruct } from "../../lib/reconstruction/engine";
import { classify, isTradeKind } from "../../lib/reconstruction/classify";
import { effectiveDate } from "../../lib/reconstruction/dates";
import { asTradedClose, type PriceCache } from "../../lib/reconstruction/prices";
import type { Transaction } from "../../lib/reconstruction/types";

const INCEPTION = "2025-07-03";
const EXPECTED: Record<string, number> = {
  AMZN: 13, GOOGL: 9.829171, SMH: 5.58843, NOW: 23.93604, META: 5.502409,
  SGOV: 29.829969, NBIS: 9.467157, GLDM: 22, CEG: 7, MELI: 1, MA: 3,
  UNH: 4, RKLB: 15.220655, OSCR: 30, CBRS: 3, ASTS: 8,
};

interface Row { [k: string]: unknown }
const pick = <T,>(r: Row, keys: string[]): T | undefined => {
  for (const k of keys) if (r[k] !== undefined && r[k] !== null) return r[k] as T;
  return undefined;
};

const raw = JSON.parse(readFileSync("data/rothTransactions.local.json", "utf8"));
const rows: Row[] = raw.transactions;
const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;

const txs: Transaction[] = rows.map((r) => {
  const postedDate = String(pick<string>(r, ["date"]) ?? "").slice(0, 10);
  const dt = pick<string>(r, ["transaction_datetime"]) ?? undefined;
  const rawType = pick<string>(r, ["type"]);
  const subtype = pick<string>(r, ["subtype"]);
  const rawDescription = pick<string>(r, ["name"]);
  const ticker = pick<string>(r, ["ticker_symbol"]);
  const quantity = Number(pick<number>(r, ["quantity"]) ?? 0) || undefined;
  const kind = classify(rawType, rawDescription, subtype, Boolean(ticker?.trim()), quantity ?? 0);
  return {
    postedDate, transactionDatetime: dt,
    effectiveDate: effectiveDate({
      postedDate, transactionDatetime: dt, isTrade: isTradeKind(kind),
      isOpeningInKind: kind === "transfer_in_kind" && (!dt || dt.slice(0, 10) <= INCEPTION),
      inceptionDate: INCEPTION,
    }),
    kind, ticker: ticker?.trim().toUpperCase() || undefined,
    quantity, price: Number(pick<number>(r, ["price"]) ?? 0) || undefined,
    rawAmount: Number(pick<number>(r, ["amount"]) ?? 0),
    fees: Number(pick<number>(r, ["fees"]) ?? 0),
    rawType, rawDescription,
  };
});

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
