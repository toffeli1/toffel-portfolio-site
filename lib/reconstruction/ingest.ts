// ─── Canonical ledger ingestion ───────────────────────────────────────────────
// ONE place that turns the private export into normalized Transactions.
//
// Every consumer — Performance, holding returns, episodes, lifecycle events,
// Decision Log weights — must go through here, so a date or classification rule
// cannot differ between surfaces. Normalizing downstream is what produced a
// CBRS start date of 2026-08-15 in the episode diagnostic while every public
// surface said 2026-08-17.
//
// Order of operations, deliberately:
//   1. assert the Roth-only boundary at source (per-row owning account id)
//   2. classify each row from the provider's own type column
//   3. resolve the effective date (execution for trades, posted for cash)
//   4. SNAP that date to a real exchange session
//   5. strip private account provenance
//
// PRIVACY: the returned Transactions carry no account identifier.

import { readFileSync } from "node:fs";
import { assertRothOnly, type AccountAudit, type ExpectedAccount } from "./accountGuard";
import { classify, isTradeKind } from "./classify";
import { effectiveDate, normalizeToSession } from "./dates";
import type { Transaction } from "./types";

const LEDGER = "data/rothTransactions.local.json";
const CONFIG = "data/reconstructionConfig.local.json";

function pick<T>(r: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) if (r[k] != null) return r[k] as T;
  return undefined;
}

export interface Ingested {
  transactions: Transaction[];
  audit: AccountAudit;
  inceptionDate: string;
}

/**
 * Load, verify and normalize the private ledger.
 * `sessions` is the exchange calendar every date is snapped onto.
 */
export function ingestLedger(sessions: string[], inceptionDate: string): Ingested {
  const doc = JSON.parse(readFileSync(LEDGER, "utf8"));
  const expected = JSON.parse(readFileSync(CONFIG, "utf8")) as ExpectedAccount;

  // Fails the whole pipeline rather than reconstructing a blended book.
  const audit = assertRothOnly(doc, expected);

  const transactions: Transaction[] = (doc.transactions as Record<string, unknown>[]).map((r) => {
    const postedDate = String(pick<string>(r, ["date"]) ?? "").slice(0, 10);
    const dt = pick<string>(r, ["transaction_datetime"]) ?? undefined;
    const rawType = pick<string>(r, ["type"]);
    const subtype = pick<string>(r, ["subtype"]);
    const rawDescription = pick<string>(r, ["name"]);
    const ticker = pick<string>(r, ["ticker_symbol"]);
    const quantity = Number(pick<number>(r, ["quantity"]) ?? 0) || undefined;
    const kind = classify(rawType, rawDescription, subtype, Boolean(ticker?.trim()), quantity ?? 0);

    const raw = effectiveDate({
      postedDate,
      transactionDatetime: dt,
      isTrade: isTradeKind(kind),
      isOpeningInKind:
        kind === "transfer_in_kind" && (!dt || dt.slice(0, 10) <= inceptionDate),
      inceptionDate,
    });

    return {
      postedDate,
      transactionDatetime: dt,
      // Snapped here, once, for everyone.
      effectiveDate: normalizeToSession(raw, sessions),
      kind,
      ticker: ticker?.trim().toUpperCase() || undefined,
      quantity,
      price: Number(pick<number>(r, ["price"]) ?? 0) || undefined,
      rawAmount: Number(pick<number>(r, ["amount"]) ?? 0),
      fees: Number(pick<number>(r, ["fees"]) ?? 0),
      rawType,
      rawDescription,
      // account_id deliberately NOT carried forward.
    };
  });

  return { transactions, audit, inceptionDate };
}

/**
 * Resolve a distribution to its EX-date using market data.
 * Matches the nearest ex-date at or before the pay date, within a normal
 * settlement window; returns undefined when no ex-date can be established.
 */
export function makeExDateResolver(
  dividends: Record<string, { exDate: string; amount: number }[]> | undefined
) {
  return (ticker: string, payDate: string): string | undefined => {
    const evs = dividends?.[ticker];
    if (!evs?.length) return undefined;
    let best: string | undefined;
    for (const e of evs) {
      if (e.exDate > payDate) continue;
      const lag = (Date.parse(payDate) - Date.parse(e.exDate)) / 86_400_000;
      if (lag > 60) continue; // beyond any plausible ex-to-pay lag
      if (!best || e.exDate > best) best = e.exDate;
    }
    return best;
  };
}
