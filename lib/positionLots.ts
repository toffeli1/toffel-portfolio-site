// FIFO-resolved surviving purchase lots for positions with full transaction history.
// Only includes lots that still contribute to the current position after applying FIFO
// to all known sells.

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

// Full historical transactions (buys + sells) for chart marker rendering.
// Kept separate from `positionLots` because chart markers must show all
// historical events — including sells — independent of FIFO accounting.
// When a ticker has a `positionEvents` entry, the chart uses it instead of
// `positionLots` for buy dots, and uses `.sells` for the open square markers.
// Tickers without `positionEvents` keep falling back to `positionLots`.

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

// ── FIFO audit summary ───────────────────────────────────────────────────────
//
// AMD: 7 buys, 6 sells. Total bought 10.15206 sh, total sold 6.15206 sh,
//   surviving 4 sh @ $225.20 avg ($900.79 total cost).
//   FIFO consumption chain (buy lots in chronological order A-G):
//     A: 1.0     @ $136.54  (Jul 8 2025)
//     B: 1.60525 @ $155.74  (Jul 15 2025)
//     C: 1.04681 @ $156.67  (Jul 15 2025)
//     D: 1.5     @ $254.24  (Jan 26 2026)
//     E: 3.0     @ $238.90  (Feb 3 2026)
//     F: 1.0     @ $220.00  (Feb 4 2026)
//     G: 1.0     @ $202.99  (Feb 4 2026)
//   Aug 21 sell (0.306495)  → A partially consumed → A: 0.693505 left
//   Apr 30 sell (1.38873)   → A fully + B partially → B: 0.910025 left
//   May 11 sell (0.456835)  → B further consumed → B: 0.453190 left
//   May 14 sell (1.0)       → B fully + C partially → C: 0.500000 left
//   May 18 sell (1.0)       → C fully + D partially → D: 1.000000 left
//   May 31 sell (2.0)       → D fully + E partially → E: 2.000000 left
//   Surviving lots: E (2.0), F (1.0), G (1.0) = 4 sh
//   Full event history is stored in `positionEvents.AMD` for chart markers.
//
// VOO: 4 known buys + 23 recurring + 6 sells
//   Pre-history sells (Jul 7/12/29, Aug 21 ×2) consumed pre-dataset lots
//   Aug 20 lot consumed by Jan 26 sell (FIFO: 0.57021 sh)
//   Jan 26 sell (5.5 sh) FIFO: Aug 20 fully, Jan 26 buy partial → 0.67021 sh survive
//   Surviving: Jan 26 partial + Feb 5 + Feb 24 + 23 recurring = 26 lots
//
// UNH: 6 buys, 1 sell (0.75 sh @ $355.28 on Jan 23, 2026)
//   FIFO: Jul 8 lot (1 sh @ $304.57) partially consumed → 0.25 sh survive
//   Surviving: 6 lots
//
// NBIS: 2 buys, 1 sell (2.260523 sh @ $88.48 on Nov 13, 2025)
//   FIFO: Jul 14 lot fully consumed (2.0012 sh), Jul 15 lot partially consumed
//   Jul 15 surviving: 7.72648 - (2.260523 - 2.0012) = 7.467157 sh
//   Surviving: 1 lot
//
// DLO: 3 buys, 0 sells → all lots survive
//
// CRWD: 5 buys (4 May statement + 1 Jun 2 add), 0 sells → all lots survive
//   Reconciles to 2.06 sh @ $671.55 avg ($1,383.40 total cost).
//
// NOW: 11 buys (9 May statement + 2 same-date Jun 2 adds), 0 sells → all lots survive
//   Reconciles to 11.385656 sh @ $102.89 avg ($1,171.50 total cost).
//
// PENG: 6 buys (3 May statement + 2 same-date Jun 2 fills + 1 Jun 4 bridge),
//   0 sells → all lots survive. The 0.6-sh Jun 2 and 0.249-sh Jun 4 lots are
//   estimated bridges (per user instruction) at provided prices that
//   reconcile the activity log to the broker aggregate.
//   Reconciles to 13.849 sh @ $50.75 avg ($702.88 total cost).

export const positionLots: Record<string, PurchaseLot[]> = {
  // Post-6-sells FIFO survivors. Full history (incl. buys consumed by sells)
  // lives in positionEvents.AMD and drives chart markers.
  AMD: [
    {
      date: "2026-02-03",
      shares: 2,
      pricePerShare: 238.90,
      amountUsd: 477.80,
      isPartial: true,
    },
    {
      date: "2026-02-04",
      shares: 1,
      pricePerShare: 220.00,
      amountUsd: 220.00,
    },
    {
      date: "2026-02-04",
      shares: 1,
      pricePerShare: 202.99,
      amountUsd: 202.99,
    },
  ],

  VOO: [
    // Aug 20, 2025 lot (0.57021 sh) was fully consumed by the Jan 26, 2026 FIFO sell.
    // Jan 26 buy (5.6 sh): FIFO consumed 0.57021 (Aug 20) + 4.92979 (Jan 26) = 5.5 total sold.
    // Jan 26 buy surviving: 5.6 - 4.92979 = 0.67021 sh
    {
      date: "2026-01-26",
      shares: 0.67021,
      pricePerShare: 636.16,
      amountUsd: 426.35,
      isPartial: true,
    },
    {
      date: "2026-02-05",
      shares: 1.99999,
      pricePerShare: 623.04,
      amountUsd: 1246.07,
    },
    {
      date: "2026-02-24",
      shares: 0.787575,
      pricePerShare: 634.86,
      amountUsd: 500.00,
    },
    // Recurring $50 buys — exact share qty/price computed at render from chart history
    { date: "2026-03-17", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-18", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-19", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-20", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-23", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-26", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-27", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-30", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-03-31", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-01", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-02", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-06", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-07", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-08", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-09", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-10", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-13", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-14", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-15", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-16", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-17", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-20", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-04-21", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    { date: "2026-05-01", shares: 0, pricePerShare: 0, amountUsd: 50.00, isRecurring: true },
    {
      date: "2026-05-01",
      shares: 2.707845,
      pricePerShare: 664.74,
      amountUsd: 1799.84,
    },
  ],

  UNH: [
    {
      date: "2025-07-08",
      shares: 0.25,
      pricePerShare: 304.57,
      amountUsd: 76.14,
      isPartial: true,
    },
    {
      date: "2025-07-23",
      shares: 0.0675,
      pricePerShare: 287.40,
      amountUsd: 19.40,
    },
    {
      date: "2025-07-24",
      shares: 1,
      pricePerShare: 291.51,
      amountUsd: 291.51,
    },
    {
      date: "2025-07-25",
      shares: 1,
      pricePerShare: 283.49,
      amountUsd: 283.49,
    },
    {
      date: "2025-07-25",
      shares: 0.5,
      pricePerShare: 282.85,
      amountUsd: 141.42,
    },
    {
      date: "2025-08-15",
      shares: 1,
      pricePerShare: 304.59,
      amountUsd: 304.59,
    },
  ],

  NBIS: [
    // Jul 14 lot (2.0012 sh) fully consumed. Jul 15 lot partially consumed.
    // Jul 15 surviving: 7.72648 - 0.259323 = 7.467157 sh
    {
      date: "2025-07-15",
      shares: 7.467157,
      pricePerShare: 51.77,
      amountUsd: 386.47,
      isPartial: true,
    },
  ],

  // DLO removed — position fully exited Jun 1, 2026; archived to previousHoldings.

  // ── GOOGL ─────────────────────────────────────────────────────────────────
  // 6 original buys, 1 sell (1 sh @ $330.12 on Jan 23, 2026)
  // FIFO: Jul 15 lot (0.54961 sh @ $182.06) partially consumed → 0.37319 sh survive
  // Surviving: 5 lots
  GOOGL: [
    {
      date: "2025-07-15",
      shares: 0.37319,
      pricePerShare: 182.06,
      amountUsd: 67.94,
      isPartial: true,
    },
    {
      date: "2025-07-15",
      shares: 1.36612,
      pricePerShare: 183.00,
      amountUsd: 250.00,
    },
    {
      date: "2025-07-24",
      shares: 1,
      pricePerShare: 194.86,
      amountUsd: 194.86,
    },
    {
      date: "2025-07-24",
      shares: 0.52077,
      pricePerShare: 192.02,
      amountUsd: 100.00,
    },
    {
      date: "2025-07-25",
      shares: 1.06592,
      pricePerShare: 193.26,
      amountUsd: 206.00,
    },
  ],

  // ── FBTC ──────────────────────────────────────────────────────────────────
  // 5 standalone buys + 23 recurring $8 buys (Mar 17 – Apr 21 2026), 0 sells
  FBTC: [
    {
      date: "2025-07-25",
      shares: 1,
      pricePerShare: 101.33,
      amountUsd: 101.33,
    },
    {
      date: "2026-01-20",
      shares: 2.148091,
      pricePerShare: 79.14,
      amountUsd: 170.00,
    },
    {
      date: "2026-01-31",
      shares: 5,
      pricePerShare: 68.02,
      amountUsd: 340.10,
    },
    {
      date: "2026-02-24",
      shares: 3.44887,
      pricePerShare: 57.99,
      amountUsd: 200.00,
    },
    {
      date: "2026-03-16",
      shares: 0.934142,
      pricePerShare: 64.23,
      amountUsd: 60.00,
    },
    { date: "2026-03-17", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-18", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-19", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-20", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-23", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-26", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-27", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-30", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-03-31", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-01", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-02", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-06", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-07", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-08", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-09", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-10", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-13", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-14", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-15", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-16", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-17", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-20", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
    { date: "2026-04-21", shares: 0, pricePerShare: 0, amountUsd: 8.00, isRecurring: true },
  ],

  // ── MELI ──────────────────────────────────────────────────────────────────
  // 8 buys, 0 sells — Apr 1 has 3 same-date lots (will cluster)
  MELI: [
    {
      date: "2025-08-12",
      shares: 0.21823,
      pricePerShare: 2359.89,
      amountUsd: 515.00,
    },
    {
      date: "2026-01-23",
      shares: 0.232577,
      pricePerShare: 2149.82,
      amountUsd: 500.00,
    },
    {
      date: "2026-02-23",
      shares: 0.053279,
      pricePerShare: 1876.90,
      amountUsd: 100.00,
    },
    {
      date: "2026-03-12",
      shares: 0.030315,
      pricePerShare: 1649.32,
      amountUsd: 50.00,
    },
    {
      date: "2026-03-30",
      shares: 0.06136,
      pricePerShare: 1629.71,
      amountUsd: 100.00,
    },
    {
      date: "2026-04-01",
      shares: 0.001,
      pricePerShare: 1725.59,
      amountUsd: 1.73,
    },
    {
      date: "2026-04-01",
      shares: 0.203239,
      pricePerShare: 1724.35,
      amountUsd: 350.46,
    },
    {
      date: "2026-04-01",
      shares: 0.2,
      pricePerShare: 1724.33,
      amountUsd: 344.87,
    },
  ],

  // ── NU ────────────────────────────────────────────────────────────────────
  // NU removed — position fully exited Jun 1, 2026; archived to previousHoldings.

  // ── META ──────────────────────────────────────────────────────────────────
  // 2 buys, 0 sells → all lots survive
  META: [
    {
      date: "2026-01-23",
      shares: 0.778573,
      pricePerShare: 642.20,
      amountUsd: 500.00,
    },
    {
      date: "2026-01-26",
      shares: 1.2,
      pricePerShare: 662.78,
      amountUsd: 795.34,
    },
  ],

  // ── ASTS ──────────────────────────────────────────────────────────────────
  // 1 buy, 0 sells → lot survives
  ASTS: [
    {
      date: "2026-01-26",
      shares: 6,
      pricePerShare: 108.92,
      amountUsd: 653.53,
    },
  ],

  // ── SMH (Roth IRA position) ───────────────────────────────────────────────
  // 1 buy, 0 sells → lot survives
  // Note: SMH also appears in the ETFs sleeve with an earlier, untracked cost basis.
  // This lot represents the Roth IRA purchase only.
  SMH: [
    {
      date: "2026-01-26",
      shares: 1.78,
      pricePerShare: 398.63,
      amountUsd: 709.55,
    },
    {
      date: "2026-05-01",
      shares: 1,
      pricePerShare: 509.50,
      amountUsd: 509.50,
    },
  ],

  // ── CRWD ──────────────────────────────────────────────────────────────────
  // 5 buys, 0 sells → all lots survive
  // Weighted avg cost = $671.55 across 2.06 sh
  CRWD: [
    {
      date: "2026-05-14",
      shares: 0.52602,
      pricePerShare: 570.32,
      amountUsd: 300.00,
    },
    {
      date: "2026-05-15",
      shares: 0.4,
      pricePerShare: 582.19,
      amountUsd: 232.88,
    },
    {
      date: "2026-05-21",
      shares: 0.07398,
      pricePerShare: 651.03,
      amountUsd: 48.16,
    },
    {
      date: "2026-05-27",
      shares: 0.06,
      pricePerShare: 645.32,
      amountUsd: 38.72,
    },
    {
      date: "2026-06-02",
      shares: 1,
      pricePerShare: 763.64,
      amountUsd: 763.64,
    },
  ],

  // ── NOW ───────────────────────────────────────────────────────────────────
  // 11 buys, 0 sells → all lots survive. Two same-date Jun 2 fills will cluster.
  // Weighted avg cost = $102.89 across 11.385656 sh
  NOW: [
    {
      date: "2026-05-14",
      shares: 5,
      pricePerShare: 88.835,
      amountUsd: 444.18,
    },
    {
      date: "2026-05-15",
      shares: 0.20763,
      pricePerShare: 96.325,
      amountUsd: 20.00,
    },
    {
      date: "2026-05-18",
      shares: 0.192326,
      pricePerShare: 103.99,
      amountUsd: 20.00,
    },
    {
      date: "2026-05-19",
      shares: 0.195723,
      pricePerShare: 102.185,
      amountUsd: 20.00,
    },
    {
      date: "2026-05-20",
      shares: 0.195755,
      pricePerShare: 102.1681,
      amountUsd: 20.00,
    },
    {
      date: "2026-05-20",
      shares: 2,
      pricePerShare: 101.84,
      amountUsd: 203.68,
    },
    {
      date: "2026-05-21",
      shares: 0.19958,
      pricePerShare: 100.21,
      amountUsd: 20.00,
    },
    {
      date: "2026-05-22",
      shares: 0.197482,
      pricePerShare: 101.275,
      amountUsd: 20.00,
    },
    {
      date: "2026-05-26",
      shares: 0.19716,
      pricePerShare: 101.44,
      amountUsd: 20.00,
    },
    {
      date: "2026-06-02",
      shares: 1,
      pricePerShare: 127.86,
      amountUsd: 127.86,
    },
    {
      date: "2026-06-02",
      shares: 2,
      pricePerShare: 127.89,
      amountUsd: 255.78,
    },
  ],

  // ── PENG ──────────────────────────────────────────────────────────────────
  // 6 buys, 0 sells → all lots survive. Two same-date Jun 2 fills will cluster.
  // The 0.6-sh Jun 2 lot and the 0.249-sh Jun 4 lot are estimated bridges
  // (per user instruction) used to reconcile activity-log totals to the
  // broker aggregate. The Jun 4 lot price ($73.69) was provided by the user.
  // Reconciles to 13.849 sh @ $50.75 avg.
  PENG: [
    {
      date: "2026-05-18",
      shares: 3,
      pricePerShare: 47.59,
      amountUsd: 142.77,
    },
    {
      date: "2026-05-19",
      shares: 5,
      pricePerShare: 43.10,
      amountUsd: 215.50,
    },
    {
      date: "2026-05-20",
      shares: 3,
      pricePerShare: 48.40,
      amountUsd: 145.20,
    },
    {
      date: "2026-06-02",
      shares: 2,
      pricePerShare: 69.64,
      amountUsd: 139.28,
    },
    {
      date: "2026-06-02",
      shares: 0.6,
      pricePerShare: 69.64,
      amountUsd: 41.78,
    },
    {
      date: "2026-06-04",
      shares: 0.249,
      pricePerShare: 73.69,
      amountUsd: 18.35,
    },
  ],

  // ── RKLB ──────────────────────────────────────────────────────────────────
  // 3 buys, 0 sells → all lots survive
  RKLB: [
    {
      date: "2026-01-23",
      shares: 2.246055,
      pricePerShare: 89.05,
      amountUsd: 200.00,
    },
    {
      date: "2026-01-26",
      shares: 5.5,
      pricePerShare: 86.04,
      amountUsd: 473.22,
    },
    {
      date: "2026-02-04",
      shares: 5,
      pricePerShare: 70.04,
      amountUsd: 350.20,
    },
  ],
};

// ── Weighted average cost per share for each fully-tracked position ───────────
// Computed from surviving lots only (post-FIFO).
export const positionAverageCost: Record<string, number> = {
  VOO:   624.40,
  AMD:   225.20,
  UNH:   292.48,
  NBIS:   51.77,
  GOOGL: 221.85,
  FBTC:   77.34,
  MELI: 1962.06,
  // DLO, NU, AVEX removed — positions fully exited Jun 1, 2026; archived to previousHoldings.
  // IREN, SCHD, PLTR, SATL removed earlier; archived to previousHoldings.
  META:  635.48,
  ASTS:   98.16,
  RKLB:   80.29,
  MU:    330.00,     // Brokerage avg cost — drives chart cost-basis line + return %
  // SMH (Brokerage) intentionally excluded: Brokerage SMH cost basis differs from
  // the Roth lot. Roth-specific cost basis is tracked under SMH_ROTH below.
  SMH_ROTH: 464.76,  // Roth IRA SMH cost basis
  // New Roth positions (May 2026 initiate + Jun 2 add):
  NOW:   102.89,
  PENG:   50.75,    // Lot-derived ($702.88 / 13.849 sh) — matches broker aggregate
  CRWD:  671.55,
};

// ── Full historical event log (buys + sells) ─────────────────────────────────
// Source of truth for chart markers. When a ticker is present here, the chart
// renders dots from `.buys` and open square markers from `.sells`, regardless
// of FIFO consumption. Tickers absent from this map fall back to positionLots
// for buy dots (no sell markers).
export const positionEvents: Record<string, PositionEvents> = {
  AMD: {
    buys: [
      { date: "2025-07-08", shares: 1,       pricePerShare: 136.54, amountUsd: 136.54 },
      { date: "2025-07-15", shares: 1.60525, pricePerShare: 155.74, amountUsd: 250.00 },
      { date: "2025-07-15", shares: 1.04681, pricePerShare: 156.67, amountUsd: 164.00 },
      { date: "2026-01-26", shares: 1.5,     pricePerShare: 254.24, amountUsd: 381.35 },
      { date: "2026-02-03", shares: 3,       pricePerShare: 238.90, amountUsd: 716.70 },
      { date: "2026-02-04", shares: 1,       pricePerShare: 220.00, amountUsd: 220.00 },
      { date: "2026-02-04", shares: 1,       pricePerShare: 202.99, amountUsd: 202.99 },
    ],
    sells: [
      { date: "2025-08-21", shares: 0.306495, pricePerShare: 163.13, amountUsd:   50.00 },
      { date: "2026-04-30", shares: 1.38873,  pricePerShare: 354.59, amountUsd:  492.43 },
      { date: "2026-05-11", shares: 0.456835, pricePerShare: 458.40, amountUsd:  209.41 },
      { date: "2026-05-14", shares: 1,        pricePerShare: 447.91, amountUsd:  447.91 },
      { date: "2026-05-18", shares: 1,        pricePerShare: 423.17, amountUsd:  423.17 },
      { date: "2026-05-31", shares: 2,        pricePerShare: 513.00, amountUsd: 1025.97 },
    ],
  },
};
