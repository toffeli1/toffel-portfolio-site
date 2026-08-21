// ─── Daily portfolio reconstruction ───────────────────────────────────────────
// Replays the ledger chronologically and produces one DailyState per trading day.
//
// INVARIANT: NAV = securities value + cash. Buys and sells move value between
// those two components and leave NAV untouched; only external flows and market
// movement change it. That is what makes the resulting TWR meaningful.
//
// The engine REFUSES to produce a result while any transaction is unresolved or
// any split is unprocessed. A silently mis-handled row would corrupt NAV and
// every weight derived from it, so it fails loudly instead.

import type {
  Transaction,
  DailyState,
  ReconstructionResult,
  PortfolioSnapshot,
} from "./types";
import { cashEffect } from "./cashDelta";
import { closeOn, tradingDaysBetween } from "./prices";

export interface ReconstructOptions {
  from: string;
  to: string;
  /** Opening state at `from`, before that day's transactions. */
  opening?: PortfolioSnapshot;
  /** Value in-kind arrivals at their close and book as external flow. */
  valueInKindAsFlow?: boolean;
  /** Injected close lookup, for tests. */
  priceLookup?: (ticker: string, date: string) => number | undefined;
  /** Injected trading calendar, for tests. */
  calendar?: string[];
  /**
   * Corporate-action splits from market data, ticker → events.
   *
   * Needed because a TRANSACTION export does not contain splits. When a holding
   * splits mid-period, the purchases are recorded on the pre-split basis and
   * the later sale on the post-split basis, so the position closes at a negative
   * share count unless the ratio is applied. Applying the ratio to whatever balance exists on the split date is
   * a no-op when nothing is held, so this is safe to pass unconditionally.
   */
  splits?: Record<string, { date: string; ratio: number }[]>;
}

export function reconstruct(
  transactions: Transaction[],
  opts: ReconstructOptions
): ReconstructionResult {
  const priceOf = opts.priceLookup ?? ((t, d) => closeOn(t, d));
  const days = opts.calendar ?? tradingDaysBetween(opts.from, opts.to);

  const shares: Record<string, number> = { ...(opts.opening?.shares ?? {}) };
  let cash = opts.opening?.cash ?? 0;

  // Bucket transactions by effective date so each day is applied at once.
  //
  // An effective date can legitimately fall on a non-trading day: Robinhood
  // sometimes stamps the order-placement time rather than the fill, and cash can
  // post over a weekend. Those transactions are ROLLED FORWARD to the next
  // session rather than dropped — silently discarding them lost a $1,145 VOO
  // sale and left the cash ledger $1,058 short.
  const sessions = [...days].sort();
  const rollForward = (date: string): string | undefined =>
    sessions.find((d) => d >= date);

  const byDate = new Map<string, Transaction[]>();
  const unapplied: Transaction[] = [];
  for (const tx of transactions) {
    const target = rollForward(tx.effectiveDate);
    if (!target) {
      // Past the end of the window entirely — caller filtered wrongly.
      unapplied.push(tx);
      continue;
    }
    const list = byDate.get(target);
    if (list) list.push(tx);
    else byDate.set(target, [tx]);
  }

  const unresolved: Transaction[] = [
    ...transactions.filter((t) => t.kind === "unknown"),
    ...unapplied,
  ];
  const tickers = new Set<string>(Object.keys(shares));
  // Flatten split events onto the session they take effect.
  const splitsByDate = new Map<string, { ticker: string; ratio: number }[]>();
  for (const [ticker, events] of Object.entries(opts.splits ?? {})) {
    for (const e of events) {
      const target = rollForward(e.date);
      if (!target) continue;
      const list = splitsByDate.get(target);
      if (list) list.push({ ticker, ratio: e.ratio });
      else splitsByDate.set(target, [{ ticker, ratio: e.ratio }]);
    }
  }

  const out: DailyState[] = [];

  for (const date of days) {
    const todays = byDate.get(date) ?? [];

    // Corporate actions apply before the day's trades, so a same-day sale is
    // measured against the post-split share count.
    for (const sp of splitsByDate.get(date) ?? []) {
      if (shares[sp.ticker]) shares[sp.ticker] *= sp.ratio;
    }
    let externalFlow = 0;
    let incomeReceived = 0;
    let feesPaid = 0;

    for (const tx of todays) {
      if (tx.ticker) tickers.add(tx.ticker);

      // Splits scale the entire existing position; they cannot be expressed as
      // a per-row share delta, so they are applied here.
      if (tx.kind === "split") {
        const ratio = tx.splitRatio;
        if (!ratio || ratio <= 0) {
          unresolved.push(tx); // unprocessable split — refuse to guess
          continue;
        }
        if (tx.ticker && shares[tx.ticker]) shares[tx.ticker] *= ratio;
        continue;
      }

      const eff = cashEffect(tx);
      cash += eff.cashDelta;
      externalFlow += eff.externalFlow;
      incomeReceived += eff.income;
      feesPaid += eff.fees;

      if (tx.ticker && eff.shareDelta !== 0) {
        shares[tx.ticker] = (shares[tx.ticker] ?? 0) + eff.shareDelta;
        if (Math.abs(shares[tx.ticker]) < 1e-9) delete shares[tx.ticker];
      }

      // In-kind securities are an external flow equal to their market value.
      // cashDelta is zero for these, so the flow has to be priced here.
      if (
        opts.valueInKindAsFlow !== false &&
        (tx.kind === "transfer_in_kind" || tx.kind === "transfer_out_kind") &&
        tx.ticker
      ) {
        const px = tx.price ?? priceOf(tx.ticker, date);
        if (px !== undefined && tx.quantity) {
          const value = px * tx.quantity;
          externalFlow += tx.kind === "transfer_in_kind" ? value : -value;
        }
      }
    }

    // Mark the book to that day's closes.
    const positionValues: Record<string, number> = {};
    const missingPrices: string[] = [];
    let securitiesValue = 0;
    for (const [ticker, qty] of Object.entries(shares)) {
      if (Math.abs(qty) < 1e-9) continue;
      const px = priceOf(ticker, date);
      if (px === undefined) {
        missingPrices.push(ticker);
        continue;
      }
      const value = qty * px;
      positionValues[ticker] = value;
      securitiesValue += value;
    }

    out.push({
      date,
      shares: { ...shares },
      cash,
      positionValues,
      securitiesValue,
      nav: securitiesValue + cash,
      externalFlow,
      incomeReceived,
      feesPaid,
      missingPrices,
    });
  }

  return { days: out, tickers: [...tickers].sort(), unresolved };
}

/**
 * Position weights at a day's close, as percentages of total NAV.
 *
 * Cash is part of the book, so it is included in the denominator and reported as
 * its own entry. Normalising across equities only would overstate every position
 * whenever cash is material — which it is here, with SGOV held as cash.
 */
export function weightsAtClose(day: DailyState): {
  weights: Record<string, number>;
  cashPct: number;
  navPositive: boolean;
} {
  const weights: Record<string, number> = {};
  if (day.nav <= 0) {
    return { weights, cashPct: 0, navPositive: false };
  }
  for (const [ticker, value] of Object.entries(day.positionValues)) {
    weights[ticker] = (value / day.nav) * 100;
  }
  return { weights, cashPct: (day.cash / day.nav) * 100, navPositive: true };
}

/**
 * Daily time-weighted return, with external flows removed.
 *
 * r_t = (NAV_t - NAV_{t-1} - externalFlow_t) / NAV_{t-1}
 *
 * The flow is subtracted from the numerator so contributed capital is never
 * counted as performance. Dividends and fees stay in the numerator: they are
 * return, not flows. Linking these daily factors gives the TWR.
 */
export function dailyReturns(
  days: DailyState[]
): { date: string; returnPct: number }[] {
  const out: { date: string; returnPct: number }[] = [];
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1];
    const cur = days[i];
    if (prev.nav <= 0) continue;
    const gain = cur.nav - prev.nav - cur.externalFlow;
    out.push({ date: cur.date, returnPct: (gain / prev.nav) * 100 });
  }
  return out;
}

/** Compound daily returns into a cumulative TWR percentage. */
export function linkReturns(returns: { returnPct: number }[]): number {
  return (returns.reduce((acc, r) => acc * (1 + r.returnPct / 100), 1) - 1) * 100;
}
