// ─── Position lot / event TYPES ────────────────────────────────────────────────
// TYPES ONLY. The real lot data that used to live here — per-lot share counts,
// execution prices, dollar amounts and per-share average cost — has been
// REMOVED from the tracked repository. It was private account data sitting in a
// public repo, and its only remaining consumers were dormant legacy routes.
//
// Nothing needs it back. Every live analytic is derived from the private
// reconstruction pipeline instead:
//   - holding returns, holding periods, per-session returns → data/performanceDerived.json
//   - allocation weights                                    → data/portfolioState.ts
//   - decision-log weight transitions                       → data/decisionWeights.json
// Those artifacts are percentage-only, and their private inputs
// (data/rothTransactions.local.json, data/priceCache.local.json) are gitignored.
//
// DO NOT re-add share counts, prices, cost basis or dollar amounts to this file.
// The empty exports below exist so the remaining legacy routes keep compiling and
// degrade gracefully to "no data" rather than rendering a private figure.

export interface PurchaseLot {
  date: string;        // "YYYY-MM-DD"
  shares: number;      // surviving share count (0 for recurring buys — computed at render)
  pricePerShare: number; // execution price (0 for recurring — looked up from chart)
  amountUsd: number;   // dollar amount of this lot
  isPartial?: boolean; // FIFO-consumed partial lot
  isRecurring?: boolean; // automatic recurring investment
  /** Optional reference to a Decision Log entry that motivated this buy. */
  decisionId?: string;
}

export interface SellEvent {
  date: string;          // "YYYY-MM-DD"
  shares: number;        // sold share count
  pricePerShare: number; // execution price
  amountUsd: number;     // proceeds in USD
  /** Optional reference to a Decision Log entry that motivated this sell. */
  decisionId?: string;
}

export interface PositionEvents {
  buys: PurchaseLot[];   // original buy events (no FIFO consumption)
  sells: SellEvent[];    // original sell events
}

/** Intentionally empty — see the header. */
export const positionLots: Record<string, PurchaseLot[]> = {};

/** Intentionally empty — see the header. */
export const positionEvents: Record<string, PositionEvents> = {};

/** Intentionally empty — per-share cost basis is private and no longer tracked. */
export const positionAverageCost: Record<string, number> = {};
