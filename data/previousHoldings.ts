
// ── Types ─────────────────────────────────────────────────────────────────────

export type PreviousSleeve = "roth-ira" | "retail";

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
  /** One-line reason shown in the Investments section summary card */
  summaryReason: string;
  // ── Research record ────────────────────────────────────────────────────────
  originalThesis: string;
  whatChanged: string;
  whyExited: string;
  lesson: string;
  // PRIVACY: estimatedEntryPrice, purchaseLots and averageCostPerShare were
  // removed. They held real entry prices, per-lot share counts and per-share
  // cost in a public repo. Nothing consumed them once the archive chart stopped
  // receiving price-bearing props. Do not re-add them.
}

// ── Data ─────────────────────────────────────────────────────────────────────

export const previousHoldings: PreviousHolding[] = [
  {
    ticker: "AVEX",
    company: "AEVEX Corp.",
    sleeve: "roth-ira",
    subcategory: "Defense Technology",
    country: "US",
    marketCap: "Small Cap",
    assetType: "Equity",
    ownedFrom: "2026-01-26",
    ownedTo: "2026-06-01",
    exitType: "Reallocation to higher-conviction holdings",
    summaryReason:
      "Small speculative defense-tech position exited as portfolio focus shifted to higher-conviction names.",
    originalThesis:
      "Defense technology and unmanned systems exposure tied to DoD modernization demand and the structural shift toward autonomous ISR.",
    whatChanged:
      "Position size remained small relative to overall portfolio exposure, and the ongoing monitoring requirement for an early-stage holding became less attractive than reallocating capital toward higher-conviction names.",
    whyExited: "Reallocated capital toward higher-conviction positions with clearer near-term catalysts.",
    lesson:
      "Small speculative positions require ongoing conviction reviews. Continued sleeve presence has to be justified, not assumed.",
  },
  {
    ticker: "NU",
    company: "Nu Holdings",
    sleeve: "roth-ira",
    subcategory: "Fintech",
    country: "Latin America",
    marketCap: "Large Cap",
    assetType: "Equity",
    ownedFrom: "2025-08-18",
    ownedTo: "2026-06-01",
    exitType: "Reallocation",
    summaryReason:
      "Digital banking position exited at a small loss. Capital reallocated toward higher-conviction Latin America and growth holdings.",
    originalThesis:
      "Digital banking and consumer fintech exposure in Latin America with a long runway for unit growth.",
    whatChanged:
      "The pace of margin expansion and the share-price re-rate combined to make the risk/reward less attractive than other Latin America platform names.",
    whyExited: "Reallocated to higher-conviction holdings.",
    lesson:
      "Concentration matters more than diversification within a single regional theme. Capital is better used in one expression than spread thin across overlapping ones.",
  },
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
    summaryReason: "Exited on role clarity grounds. Insufficient alignment with current return objectives and overlap with broader defensive exposure.",
    originalThesis:
      "SCHD was added as the portfolio's income and stability allocation. The position designed to perform when high-beta growth names struggle. The ETF's methodology filters for dividend sustainability rather than raw yield, holding high-quality businesses with durable free cash flow. It was intended to function as a partial hedge to the AI infrastructure and growth technology exposure that dominated the rest of the book.",
    whatChanged:
      "Portfolio composition and return objectives evolved. As conviction in the growth and AI-oriented positions deepened, SCHD's role as a defensive anchor became less clearly defined. The position created overlap with broader defensive and value exposure already present in the book, without providing sufficient differentiated return potential to justify a standalone allocation. The role it was meant to fill. Income, stability, and ballast. Was increasingly addressed by the portfolio's structure, leaving SCHD without a clear, non-redundant mandate.",
    whyExited:
      "Exited SCHD fully on April 30. SCHD no longer fit the intended role of the portfolio. While the fund provides quality dividend exposure, it created overlap with broader defensive/value exposure and did not offer enough alignment with current long-term return objectives. This was a portfolio role clarity decision rather than a negative view on SCHD itself.",
    lesson:
      "Every position needs a clear, non-redundant role in the portfolio. A quality fund can be correct on its own merits while still being the wrong fit for a specific book at a specific time. Portfolio construction means asking whether a holding is good on its own and whether it is good in relation to everything else already owned, then whether its presence sharpens or dilutes the portfolio's overall mandate.",
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
      "The Artificial Intelligence Platform represented the unlock moment. A repeatable way to " +
      "deploy AI on private enterprise data with genuine switching costs and network-effect moats. " +
      "The combination of durable government revenue and accelerating commercial ARR at an early " +
      "inflection made a speculative position compelling.",
    whatChanged:
      "The commercial thesis played out faster and at greater scale than the entry setup anticipated. " +
      "Within 14 months PLTR more than tripled. At those levels the stock was discounting " +
      "10–15 years of uninterrupted hypergrowth. EV/NTM Revenue expanded north of 70×, " +
      "pricing near-perfection into the multiple. The business was executing; the valuation had " +
      "run far ahead of even an optimistic base case.",
    whyExited:
      "Valuation discipline. When the implied growth hurdle becomes implausible to clear, " +
      "maintaining the position is not conviction. It is hope. Capital was reallocated toward " +
      "positions with genuinely asymmetric setups and lower embedded expectations. " +
      "Exiting a stock still in an uptrend is uncomfortable; exiting when the math stops " +
      "working is sound portfolio management.",
    lesson:
      "High-conviction names are not exempt from valuation risk. The entry thesis can be correct " +
      "and the exit can still be correct. Tracking implied expectations against realized results " +
      "is the right discipline. When the stock price prices in best-case outcomes years out, " +
      "the margin of safety disappears regardless of business quality.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPreviousHolding(ticker: string): PreviousHolding | undefined {
  return previousHoldings.find((h) => h.ticker === ticker);
}

export function getPreviousHoldingsBySleeve(sleeve: PreviousSleeve): PreviousHolding[] {
  return previousHoldings.filter((h) => h.sleeve === sleeve);
}
