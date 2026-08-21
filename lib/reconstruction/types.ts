// ─── Reconstruction types ─────────────────────────────────────────────────────
// Shapes for rebuilding daily Roth portfolio state from the private Robinhood
// ledger (data/rothTransactions.local.json).
//
// PRIVACY: every type in this file describes PRIVATE data — prices, quantities,
// dollar amounts. Nothing here may cross into a client component or a committed
// artifact. Only percentage-shaped output leaves the reconstruction pipeline.
// tests/privacy.test.ts enforces both halves of that.

/** Semantic transaction class, resolved from the provider's own labels. */
export type TxKind =
  | "buy"
  | "sell"
  | "contribution"     // external cash IN
  | "withdrawal"       // external cash OUT
  | "transfer_in_cash" // external cash IN via account transfer
  | "transfer_out_cash"
  | "transfer_in_kind"  // securities arriving in-kind (external)
  | "transfer_out_kind"
  | "dividend"         // investment return
  | "interest"         // investment return
  | "fee"              // reduces investment return
  | "tax"              // reduces investment return
  | "split"            // corporate action, share-count only
  | "stock_distribution"
  | "unknown";

/** A normalised ledger row. Raw provider rows are mapped into this. */
export interface Transaction {
  /** Provider settlement / posted date, "YYYY-MM-DD". */
  postedDate: string;
  /** Execution timestamp when present, ISO-8601. */
  transactionDatetime?: string;
  /**
   * The date at which portfolio exposure actually changed. For trades this is
   * derived from transactionDatetime; for cash flows it is postedDate. See
   * effectiveDate() in ./dates.ts for the full convention.
   */
  effectiveDate: string;
  kind: TxKind;
  ticker?: string;
  /** Share quantity, always POSITIVE. Direction comes from `kind`. */
  quantity?: number;
  /** Per-share price as executed. Private. */
  price?: number;
  /** Provider's raw signed amount, exactly as exported. Sign is meaningful. */
  rawAmount: number;
  /** Separate fee column; NOT included in rawAmount. */
  fees?: number;
  /** Provider's own type/description strings, kept for provenance. Private. */
  rawType?: string;
  rawDescription?: string;
  /** Split ratio for corporate actions: 4 means 4-for-1. */
  splitRatio?: number;
}

/** Holdings and cash at a single point in time. */
export interface PortfolioSnapshot {
  date: string;
  /** ticker → shares held. */
  shares: Record<string, number>;
  /** Settled cash. May legitimately be negative (opening debit). */
  cash: number;
}

/** One reconstructed trading day. */
export interface DailyState {
  date: string;
  shares: Record<string, number>;
  cash: number;
  /** ticker → shares × unadjusted close. Private. */
  positionValues: Record<string, number>;
  /** Sum of position values. Private. */
  securitiesValue: number;
  /** securitiesValue + cash. Private. */
  nav: number;
  /**
   * Net EXTERNAL cash flow on this date. Positive = money entering the account.
   * Contributions, withdrawals, cash transfers and in-kind transfer value only.
   * Buys, sells, dividends and fees are all excluded — see cashDelta.ts.
   */
  externalFlow: number;
  /** Dividends and interest received. Part of return, not a flow. */
  incomeReceived: number;
  /** Fees and taxes paid. Reduces return, not a flow. */
  feesPaid: number;
  /** Tickers whose close was unavailable, so NAV is incomplete. */
  missingPrices: string[];
}

export interface ReconstructionResult {
  days: DailyState[];
  /** Tickers seen in the ledger over the window. */
  tickers: string[];
  /** Transactions the classifier could not resolve — must be empty to trust NAV. */
  unresolved: Transaction[];
}
