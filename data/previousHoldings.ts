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
    ticker: "IREN",
    company: "IREN",
    sleeve: "roth-ira",
    subcategory: "AI / Infrastructure / Energy",
    country: "International",
    marketCap: "Small Cap",
    assetType: "Equity",
    ownedFrom: "2025-08-22",
    ownedTo: "2026-04-30",
    exitType: "Capital-Allocation Upgrade",
    summaryReason: "Exited after the position had run up; capital reallocated toward better risk/reward.",
    originalThesis:
      "IREN was held as power-linked digital infrastructure exposure, combining Bitcoin mining economics with an emerging AI cloud pivot. The thesis was that IREN's low-cost power base positioned it well to transition GPU capacity toward AI workloads as mining margins compressed.",
    whatChanged:
      "The position appreciated significantly from the August 2025 entry. After a partial trim in April following a 127%+ gain, the remaining position was evaluated against other opportunities. The risk/reward at elevated prices relative to the AI pivot execution stage made reallocation the better portfolio construction decision.",
    whyExited:
      "Exited IREN fully on April 30 after the position had run up. The exit was a capital-allocation upgrade, reallocating away from a less attractive risk/reward setup toward better opportunities.",
    lesson:
      "Significant appreciation from a speculative entry creates a natural reassessment point. When a position has already captured most of the near-term thesis, holding requires a new and distinct reason to remain sized. Reallocating gains into higher-conviction setups is sound portfolio management.",
    purchaseLots: [
      { date: "2025-08-22", shares: 5, pricePerShare: 21.11, amountUsd: 105.55, isPartial: true },
      { date: "2026-02-05", shares: 5, pricePerShare: 41.81, amountUsd: 209.05 },
    ],
    averageCostPerShare: 31.46,
    estimatedEntryPrice: 21.11,
  },
  {
    ticker: "SATL",
    company: "Satellogic",
    sleeve: "roth-ira",
    subcategory: "Space / Earth Observation",
    country: "Latin America",
    marketCap: "Small Cap",
    assetType: "Equity",
    ownedFrom: "2026-01-01",
    ownedTo: "2026-04-30",
    exitType: "Capital-Allocation Upgrade",
    summaryReason: "Exited after the position had run up; capital reallocated toward better risk/reward.",
    originalThesis:
      "SATL was held as small-cap satellite and imagery exposure, providing access to the emerging commercial Earth observation market through a Latin American operator with a large satellite constellation.",
    whatChanged:
      "The position appreciated from entry. Evaluated against the broader portfolio and available opportunities, the risk/reward setup at elevated prices no longer competed favorably with higher-conviction alternatives.",
    whyExited:
      "Exited SATL fully on April 30 after the position had run up. The exit was a capital-allocation upgrade, reallocating away from a less attractive risk/reward setup toward better opportunities.",
    lesson:
      "Small-cap speculative positions require ongoing re-underwriting as the price moves. When a position runs and the margin of safety compresses, the bar for continued ownership rises. If a better use of that capital exists, reallocation is the disciplined move.",
    estimatedEntryPrice: 7.10,
  },
  {
    ticker: "SCHD",
    company: "Schwab U.S. Dividend Equity ETF",
    sleeve: "roth-ira",
    subcategory: "Dividend ETF",
    country: "US",
    marketCap: "Large Cap",
    assetType: "ETF",
    ownedFrom: "2026-04-01",
    ownedTo: "2026-04-30",
    exitType: "Portfolio Role Clarity / Capital Reallocation",
    summaryReason: "Exited on role clarity grounds — insufficient alignment with current return objectives and overlap with broader defensive exposure.",
    originalThesis:
      "SCHD was added as the portfolio's income and stability allocation — the position designed to perform when high-beta growth names struggle. The ETF's methodology filters for dividend sustainability rather than raw yield, holding high-quality businesses with durable free cash flow. It was intended to function as a partial hedge to the AI infrastructure and growth technology exposure that dominated the rest of the book.",
    whatChanged:
      "Portfolio composition and return objectives evolved. As conviction in the growth and AI-oriented positions deepened, SCHD's role as a defensive anchor became less clearly defined. The position created overlap with broader defensive and value exposure already present in the book, without providing sufficient differentiated return potential to justify a standalone allocation. The role it was meant to fill — income, stability, and ballast — was increasingly addressed by the portfolio's structure, leaving SCHD without a clear, non-redundant mandate.",
    whyExited:
      "Exited SCHD fully at $31.95 on April 30. SCHD no longer fit the intended role of the portfolio. While the fund provides quality dividend exposure, it created overlap with broader defensive/value exposure and did not offer enough alignment with current long-term return objectives. This was a portfolio role clarity decision rather than a negative view on SCHD itself.",
    lesson:
      "Every position needs a clear, non-redundant role in the portfolio. A quality fund can be correct on its own merits while still being the wrong fit for a specific book at a specific time. Portfolio construction requires asking not just whether a holding is good, but whether it is good in relation to everything else already owned — and whether its presence sharpens or dilutes the portfolio's overall mandate.",
    purchaseLots: [
      {
        date: "2026-04-01",
        shares: 65.147614,
        pricePerShare: 30.70,
        amountUsd: 2000.00,
      },
    ],
    averageCostPerShare: 30.70,
    estimatedEntryPrice: 30.70,
  },
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
