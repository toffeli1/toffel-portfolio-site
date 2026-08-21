// ─── July 3–31, 2025 reconstruction + reconciliation ──────────────────────────
//   npx tsx scripts/reconstructJuly.ts
//
// Runs the engine over the private ledger, then RECONCILES the reconstructed
// July 31 closing NAV against the first trusted NAV in
// data/performanceSeed.local.json.
//
// This script deliberately does NOT write any public artifact when reconciliation
// fails. It reports the discrepancy and exits non-zero. Forcing a match — or
// inserting a balancing plug — would corrupt every downstream return.

import { readFileSync, existsSync } from "node:fs";
import { reconstruct, dailyReturns, linkReturns } from "../lib/reconstruction/engine";
import { classify, isTradeKind } from "../lib/reconstruction/classify";
import { effectiveDate, DATE_CONVENTION_SUMMARY } from "../lib/reconstruction/dates";
import type { Transaction } from "../lib/reconstruction/types";
import { asTradedClose, type PriceCache } from "../lib/reconstruction/prices";

const LEDGER = "data/rothTransactions.local.json";
const PRICES = "data/priceCache.local.json";
const SEED = "data/performanceSeed.local.json";

const INCEPTION = "2025-07-03";
const JULY_END = "2025-07-31";

// NOTE: opening share counts and the opening cash balance are NOT hardcoded
// here. They are private account data, and they are unnecessary: the ledger's
// own incoming-transfer rows establish the opening state when replayed from an
// empty book (see the reconstruct() call below).

/** NAV agreement tolerance. Tight, because both sides should be exact marks. */
const TOLERANCE_ABS = 1.0;   // dollars
const TOLERANCE_PCT = 0.05;  // percent of seed NAV

function pick<T>(row: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) if (row[k] !== undefined && row[k] !== null) return row[k] as T;
  return undefined;
}

function normalise(rows: Record<string, unknown>[]): Transaction[] {
  return rows.map((r) => {
    const postedDate = String(pick<string>(r, ["date", "settlement_date", "Date"]) ?? "").slice(0, 10);
    const dt = pick<string>(r, ["transaction_datetime", "executed_at", "timestamp"]);
    const rawType = pick<string>(r, ["type", "transaction_type", "activity", "Type"]);
    const subtype = pick<string>(r, ["subtype", "sub_type", "Subtype"]);
    const rawDescription = pick<string>(r, ["name", "description", "desc", "Description"]);
    const ticker = pick<string>(r, ["ticker_symbol", "ticker", "symbol", "Symbol"]);
    const quantity = Number(pick<number>(r, ["quantity", "shares", "qty", "Quantity"]) ?? 0) || undefined;
    const price = Number(pick<number>(r, ["price", "price_per_share", "Price"]) ?? 0) || undefined;
    const rawAmount = Number(pick<number>(r, ["amount", "net_amount", "Amount"]) ?? 0);
    const fees = Number(pick<number>(r, ["fees", "fee", "Fees"]) ?? 0);
    const kind = classify(rawType, rawDescription, subtype, Boolean(ticker?.trim()), quantity ?? 0);

    // An in-kind arrival timestamped before inception is an opening transfer.
    const isOpeningInKind =
      kind === "transfer_in_kind" && (!dt || dt.slice(0, 10) <= INCEPTION);

    return {
      postedDate,
      transactionDatetime: dt,
      effectiveDate: effectiveDate({
        postedDate,
        transactionDatetime: dt,
        isTrade: isTradeKind(kind),
        isOpeningInKind,
        inceptionDate: INCEPTION,
      }),
      kind,
      ticker: ticker?.trim().toUpperCase(),
      quantity,
      price,
      rawAmount,
      fees,
      rawType,
      rawDescription,
      splitRatio: Number(pick<number>(r, ["split_ratio", "ratio"]) ?? 0) || undefined,
    };
  });
}

function main() {
  for (const [label, path] of [["ledger", LEDGER], ["price cache", PRICES], ["seed", SEED]] as const) {
    if (!existsSync(path)) {
      console.error(`\nMissing ${label}: ${path}`);
      if (path === PRICES) console.error("Run: npx tsx scripts/fetchHistoricalPrices.ts");
      process.exit(1);
    }
  }

  const raw = JSON.parse(readFileSync(LEDGER, "utf8"));
  const rows = Array.isArray(raw) ? raw : (raw.transactions ?? raw.records ?? []);
  const txs = normalise(rows);

  console.log(`\nDate convention\n  ${DATE_CONVENTION_SUMMARY}\n`);
  console.log(`Ledger rows: ${txs.length}`);

  // Refuse to proceed on unclassified rows — they would silently distort NAV.
  const unknown = txs.filter((t) => t.kind === "unknown");
  if (unknown.length) {
    console.error(`\nSTOP: ${unknown.length} unclassified transaction(s).`);
    const sample = [...new Set(unknown.map((t) => `${t.rawType ?? ""} | ${t.rawDescription ?? ""}`))].slice(0, 15);
    for (const s of sample) console.error(`  ${s}`);
    console.error("\nExtend RULES in lib/reconstruction/classify.ts. Not guessing.");
    process.exit(2);
  }

  const priceDoc = JSON.parse(readFileSync(PRICES, "utf8")) as PriceCache;
  // AS-TRADED prices: Yahoo's closes are split-adjusted, ledger share counts are
  // not. asTradedClose() reverses later splits so the two bases agree.
  const priceLookup = (t: string, d: string) => asTradedClose(t, d, priceDoc);
  const calendar: string[] = (priceDoc.tradingDays ?? []).filter(
    (d: string) => d >= INCEPTION && d <= JULY_END
  );

  const result = reconstruct(txs.filter((t) => t.effectiveDate <= JULY_END), {
    from: INCEPTION,
    to: JULY_END,
    // Start EMPTY. The incoming in-kind transfer rows and the opening balance
    // transfer establish the opening state themselves, dated to inception.
    // Seeding an opening snapshot as well would double-count them.
    // Because July 3 is the first day, no prior NAV exists, so nothing about the
    // transfer can be recorded as return — it is pure opening NAV.
    opening: { date: INCEPTION, shares: {}, cash: 0 },
    calendar,
    priceLookup,
  });

  if (result.unresolved.length) {
    console.error(`\nSTOP: ${result.unresolved.length} unresolved transaction(s) during replay.`);
    process.exit(2);
  }

  const first = result.days[0];
  const last = result.days[result.days.length - 1];
  console.log(`\nOpening ${first.date}: NAV ${first.nav.toFixed(2)} (securities ${first.securitiesValue.toFixed(2)}, cash ${first.cash.toFixed(2)})`);
  console.log(`Closing ${last.date}: NAV ${last.nav.toFixed(2)} (securities ${last.securitiesValue.toFixed(2)}, cash ${last.cash.toFixed(2)})`);

  const gaps = result.days.filter((d) => d.missingPrices.length);
  if (gaps.length) {
    console.warn(`\nWARNING: ${gaps.length} day(s) with missing closes — NAV incomplete:`);
    for (const g of gaps.slice(0, 5)) console.warn(`  ${g.date}: ${g.missingPrices.join(", ")}`);
  }

  // ── Reconciliation ────────────────────────────────────────────────────────
  const seed = JSON.parse(readFileSync(SEED, "utf8"));
  const seedBase = seed.navSeries?.find((n: { date: string }) => n.date === JULY_END)
    ?? seed.navSeries?.[0];
  if (!seedBase) { console.error("\nSTOP: no seed NAV to reconcile against."); process.exit(2); }

  const diff = last.nav - seedBase.nav;
  const diffPct = (diff / seedBase.nav) * 100;

  console.log(`\n── Reconciliation ──`);
  console.log(`  reconstructed ${last.date}  ${last.nav.toFixed(2)}`);
  console.log(`  seed          ${seedBase.date}  ${seedBase.nav.toFixed(2)}`);
  console.log(`  difference    ${diff.toFixed(2)} (${diffPct.toFixed(4)}%)`);

  // Also compare against securities-only. If the seed's "NAV" is actually a
  // market-value-of-holdings figure that excludes a negative settled-cash
  // balance, this is the line that will agree — and which basis the seed uses
  // is a question for the account owner, not something to assume.
  const secDiff = last.securitiesValue - seedBase.nav;
  const secDiffPct = (secDiff / seedBase.nav) * 100;
  console.log(`  securities-only  ${last.securitiesValue.toFixed(2)}  ` +
    `diff ${secDiff.toFixed(2)} (${secDiffPct.toFixed(4)}%)`);
  console.log(`  reconstructed cash at close: ${last.cash.toFixed(2)}`);

  const reconciles = Math.abs(diff) <= TOLERANCE_ABS || Math.abs(diffPct) <= TOLERANCE_PCT;
  if (!reconciles && (Math.abs(secDiff) <= TOLERANCE_ABS || Math.abs(secDiffPct) <= TOLERANCE_PCT)) {
    console.error(
      `\nNOTE: total NAV does not reconcile, but SECURITIES-ONLY agrees to ` +
      `$${Math.abs(secDiff).toFixed(2)} (${Math.abs(secDiffPct).toFixed(4)}%). ` +
      `The seed's base figure looks like market value of holdings excluding ` +
      `settled cash. Confirm the basis before bridging — still REJECTING.`
    );
  }
  if (!reconciles) {
    console.error(`\nREJECTED — outside tolerance (±$${TOLERANCE_ABS} or ±${TOLERANCE_PCT}%).`);
    console.error("Largest positions at close (diagnostic):");
    for (const [t, v] of Object.entries(last.positionValues).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
      console.error(`  ${t.padEnd(6)} ${v.toFixed(2)}  (${last.shares[t]} sh)`);
    }
    console.error(`  cash   ${last.cash.toFixed(2)}`);
    console.error("\nNo artifact written. Not forcing a match, not inserting a plug.");
    process.exit(3);
  }

  const rets = dailyReturns(result.days);
  console.log(`\nACCEPTED. July TWR ${linkReturns(rets).toFixed(4)}% over ${rets.length} trading days.`);
  console.log("Next: extend the TWR series and populate Decision Log weights.");
}

main();
