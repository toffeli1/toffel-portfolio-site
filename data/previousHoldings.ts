import type { PurchaseLot } from "@/lib/positionLots";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PreviousSleeve = "roth-ira" | "retail" | "etfs";

export interface PreviousHolding {
  ticker: string;
  company: string;
  sleeve: PreviousSleeve;
  subcategory?: string;
  country?: string;
  marketCap?: string;
  assetType?: string;
  /** ISO date of first purchase */
  ownedFrom: string;
  /** ISO date of final sale */
  ownedTo: string;
  /** Human-readable exit classification */
  exitType: string;
  /** One-line reason shown in the Roth IRA section summary card */
  summaryReason: string;
  // ── Research record ────────────────────────────────────────────────────────
  originalThesis: string;
  whatChanged: string;
  whyExited: string;
  lesson: string;
  // ── Chart data ─────────────────────────────────────────────────────────────
  /** Confirmed or estimated purchase price used as chart entry marker */
  estimatedEntryPrice?: number;
  purchaseLots?: PurchaseLot[];
  averageCostPerShare?: number;
}

// ── Data ─────────────────────────────────────────────────────────────────────

export const previousHoldings: PreviousHolding[] = [
  {
    ticker: "PLTR",
    company: "Palantir Technologies",
    sleeve: "roth-ira",
    subcategory: "AI / Defense Tech",
    country: "US",
    marketCap: "Large Cap",
    assetType: "Equity",
    ownedFrom: "2024-06-14",
    ownedTo: "2025-08-01",
    exitType: "Reallocated / Valuation discipline",
    summaryReason: "Position tripled on AIP commercial expansion; exited on valuation stretch.",
    originalThesis:
      "Palantir is the rare government-defense software platform with a credible commercial wedge. " +
      "The Artificial Intelligence Platform represented the unlock moment — a repeatable way to " +
      "deploy AI on private enterprise data with genuine switching costs and network-effect moats. " +
      "The combination of durable government revenue and accelerating commercial ARR at an early " +
      "inflection made a speculative position in the Roth IRA compelling.",
    whatChanged:
      "The commercial thesis played out faster and at greater scale than the entry setup anticipated. " +
      "Within 14 months PLTR more than tripled. At those levels the stock was discounting " +
      "10–15 years of uninterrupted hypergrowth. EV/NTM Revenue expanded north of 70×, " +
      "pricing near-perfection into the multiple. The business was executing; the valuation had " +
      "run far ahead of even an optimistic base case.",
    whyExited:
      "Valuation discipline. When the implied growth hurdle becomes implausible to clear, " +
      "maintaining the position is not conviction — it is hope. Capital was reallocated toward " +
      "positions with genuinely asymmetric setups and lower embedded expectations. " +
      "Exiting a stock still in an uptrend is uncomfortable; exiting when the math stops " +
      "working is sound portfolio management.",
    lesson:
      "High-conviction names are not exempt from valuation risk. The entry thesis can be correct " +
      "and the exit can still be correct. Tracking implied expectations against realized results " +
      "is the right discipline — when the stock price prices in best-case outcomes years out, " +
      "the margin of safety disappears regardless of business quality.",
    estimatedEntryPrice: 25.0,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPreviousHolding(ticker: string): PreviousHolding | undefined {
  return previousHoldings.find((h) => h.ticker === ticker);
}

export function getPreviousHoldingsBySleeve(sleeve: PreviousSleeve): PreviousHolding[] {
  return previousHoldings.filter((h) => h.sleeve === sleeve);
}
