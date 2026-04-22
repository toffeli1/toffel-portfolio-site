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
}

// ── FIFO audit summary ───────────────────────────────────────────────────────
//
// AMD: 7 buys, 1 sell (0.306495 sh @ $163.13 on Aug 21, 2025)
//   FIFO: Jul 8 lot (1 sh @ $136.54) partially consumed → 0.693505 sh survive
//   Surviving: 7 lots (Jul 8 partial, Jul 15 ×2, Jan 26, Feb 3, Feb 4 ×2)
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

export const positionLots: Record<string, PurchaseLot[]> = {
  AMD: [
    {
      date: "2025-07-08",
      shares: 0.693505,
      pricePerShare: 136.54,
      amountUsd: 94.71,
      isPartial: true,
    },
    {
      date: "2025-07-15",
      shares: 1.60525,
      pricePerShare: 155.74,
      amountUsd: 250.00,
    },
    {
      date: "2025-07-15",
      shares: 1.04681,
      pricePerShare: 156.67,
      amountUsd: 164.00,
    },
    {
      date: "2026-01-26",
      shares: 1.5,
      pricePerShare: 254.24,
      amountUsd: 381.35,
    },
    {
      date: "2026-02-03",
      shares: 3,
      pricePerShare: 238.90,
      amountUsd: 716.70,
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

  DLO: [
    {
      date: "2025-07-15",
      shares: 22.60847,
      pricePerShare: 11.06,
      amountUsd: 250.00,
    },
    {
      date: "2025-07-15",
      shares: 22.5858,
      pricePerShare: 11.07,
      amountUsd: 250.00,
    },
    {
      date: "2026-02-18",
      shares: 31.897926,
      pricePerShare: 12.54,
      amountUsd: 400.00,
    },
  ],

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
  // Single lot, no sells
  NU: [
    {
      date: "2025-08-18",
      shares: 37.618796,
      pricePerShare: 13.29,
      amountUsd: 500.00,
    },
  ],

  // ── IREN ──────────────────────────────────────────────────────────────────
  // 3 buys, 1 sell (5 sh @ $47.92 on Apr 17, 2026)
  // FIFO: Aug 22 lot (10 sh) partially consumed → 5 sh survive
  // Surviving: 2 lots
  IREN: [
    {
      date: "2025-08-22",
      shares: 5,
      pricePerShare: 21.11,
      amountUsd: 105.55,
      isPartial: true,
    },
    {
      date: "2026-02-05",
      shares: 5,
      pricePerShare: 41.81,
      amountUsd: 209.05,
    },
  ],

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

  // ── SCHD ──────────────────────────────────────────────────────────────────
  // 1 buy, 0 sells → lot survives
  SCHD: [
    {
      date: "2026-04-01",
      shares: 65.147614,
      pricePerShare: 30.70,
      amountUsd: 2000.00,
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
// Computed from surviving lots only (post-FIFO). Not available for VOO
// (recurring lots lack per-share data until resolved from chart history).
export const positionAverageCost: Record<string, number> = {
  AMD:   206.16,
  UNH:   292.46,
  NBIS:   51.77,
  DLO:    11.67,
  GOOGL: 189.06,
  FBTC:   77.59,
  MELI: 1962.06,
  NU:     13.29,
  IREN:   31.46,
  // ── added batch ───────────────────────────────────────────────────────────
  AVEX:   37.56,  // from holdings.ts purchase.costBasis; no dated lot available
  META:  654.69,  // 2 lots: Jan 23 (0.778573 sh @$642.20) + Jan 26 (1.2 sh @$662.78)
  SCHD:   30.70,  // 1 lot:  Apr 1  (65.147614 sh @$30.70)
  ASTS:  108.92,  // 1 lot:  Jan 26 (6 sh @$108.92)
  // SMH intentionally excluded: the Roth IRA lot (Jan 26, @$398.63) would produce
  // incorrect live returns on the ETF sleeve, which has a much older, lower cost basis.
  // Both sleeves fall back to their static returnPct until sleeve-specific cost bases
  // are tracked separately.
  RKLB:   80.29,  // 3 lots: Jan 23 (2.246055 sh @$89.05) + Jan 26 (5.5 sh @$86.04) + Feb 4 (5 sh @$70.04)
};
