// ─── Decision log — public-safe portfolio activity entries ────────────────────
// Privacy: no share counts, quantities, total dollar amounts, or market values.

export interface DecisionEntry {
  /** Optional stable identifier (kebab-case) for cross-linking from transaction events. */
  id?: string;
  /** "YYYY-MM-DD" or "YYYY-MM" for month-resolution entries */
  date: string;
  ticker: string;
  company: string;
  account: string;
  /** Short action label: "Add", "Trim", "Exit", "Rebalance". */
  action: string;
  /** Decision category */
  type: string;
  /** Public-safe rationale */
  note: string;
  /** /positions/TICKER for active, /archive/TICKER for exited */
  href: string;
  /** Return % since entry — positive or negative; omit if unavailable */
  returnPct?: number;
  // ── Optional structured metadata (rendered in the decision card grid) ─────
  /** Decision type label, e.g. "Trim / Review", "Add", "Full exit". */
  decisionAction?: string;
  /** Specific holding name when distinct from ticker, e.g. "AMD". */
  holding?: string;
  /** What triggered the review/decision. */
  trigger?: string;
  /** Pre-decision weight as a string ("12.5%"). */
  oldWeight?: string;
  /** Post-decision weight as a string ("10.0%"). */
  newWeight?: string;
  /** Target weight as a string ("10.0%"). */
  targetWeight?: string;
  /** Max review-band weight as a string ("11.5%"). */
  maxWeight?: string;
  /** Whether the thesis itself changed. */
  thesisChange?: string;
  /** Decision summary, e.g. "Review for trim or re-underwrite". */
  decision?: string;
  /** Where freed capital went. */
  capitalDestination?: string;
  /** One-line process lesson. */
  lesson?: string;
}

// Reverse-chronological order — newest first.
export const decisionLog: DecisionEntry[] = [
  {
    date: "2026-06-02",
    ticker: "NOW",
    company: "ServiceNow",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Position build-out",
    note: "Completed the initial ServiceNow buildout with additional shares, finalizing the enterprise SaaS allocation within the Roth.",
    href: "/positions/NOW",
    returnPct: 26.37,
  },
  {
    date: "2026-06-02",
    ticker: "CRWD",
    company: "CrowdStrike Holdings",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Position build-out",
    note: "Added to the CrowdStrike position to complete the cybersecurity buildout within the Roth.",
    href: "/positions/CRWD",
    returnPct: 19.48,
  },
  {
    date: "2026-06-02",
    ticker: "PENG",
    company: "Penguin Solutions",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Position build-out",
    note: "Added to Penguin Solutions to finalize the AI infrastructure position size in the Roth.",
    href: "/positions/PENG",
    returnPct: 43.17,
  },
  {
    date: "2026-06-02",
    ticker: "META",
    company: "Meta Platforms",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Rebalance into weakness",
    note: "Re-added to META after a small mid-May trim, restoring sizing into recent price weakness.",
    href: "/positions/META",
    returnPct: -5.35,
  },
  {
    date: "2026-06-02",
    ticker: "GOOGL",
    company: "Alphabet Class A",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Position add",
    note: "Added to GOOGL, extending the platform-tech allocation within the Roth.",
    href: "/positions/GOOGL",
    returnPct: 63.27,
  },
  {
    date: "2026-06-01",
    ticker: "AVEX",
    company: "AEVEX Corp.",
    account: "Roth Retirement Account",
    action: "Exit",
    type: "Reallocation to higher-conviction holdings",
    note: "Exited AEVEX. The small speculative defense-tech allocation was recycled into higher-conviction names with clearer near-term catalysts.",
    href: "/archive/AVEX",
    returnPct: 5.38,
  },
  {
    date: "2026-06-01",
    ticker: "DLO",
    company: "dLocal",
    account: "Roth Retirement Account",
    action: "Exit",
    type: "Reallocation",
    note: "Exited dLocal at a modest gain. Capital reallocated toward higher-conviction Roth holdings.",
    href: "/archive/DLO",
    returnPct: 3.26,
  },
  {
    date: "2026-06-01",
    ticker: "NU",
    company: "Nu Holdings",
    account: "Roth Retirement Account",
    action: "Exit",
    type: "Reallocation",
    note: "Exited Nu Holdings. Capital reallocated toward higher-conviction Latin America and platform-tech expressions in the Roth.",
    href: "/archive/NU",
    returnPct: -2.33,
  },
  {
    date: "2026-05-31",
    ticker: "AMD",
    company: "Advanced Micro Devices",
    account: "Roth Retirement Account",
    action: "Trim",
    type: "Position sizing / risk management",
    note: "Continued trimming AMD through May as the position appreciated above the target sizing band. Multiple sessions of small trims recycled gains while preserving core exposure to the AI compute thesis.",
    href: "/positions/AMD",
    returnPct: 127.80,
  },
  {
    date: "2026-05",
    ticker: "CRWD",
    company: "CrowdStrike Holdings",
    account: "Roth Retirement Account",
    action: "Add",
    type: "New position",
    note: "Initiated the CrowdStrike position via a series of buys through mid-to-late May, establishing cloud-native cybersecurity platform exposure in the Roth.",
    href: "/positions/CRWD",
  },
  {
    date: "2026-05",
    ticker: "NOW",
    company: "ServiceNow",
    account: "Roth Retirement Account",
    action: "Add",
    type: "New position",
    note: "Initiated the ServiceNow position with multiple buys in mid-May, adding enterprise workflow automation and AI-agent expansion exposure to the Roth.",
    href: "/positions/NOW",
  },
  {
    date: "2026-05",
    ticker: "PENG",
    company: "Penguin Solutions",
    account: "Roth Retirement Account",
    action: "Add",
    type: "New position",
    note: "Initiated the Penguin Solutions position with multiple buys through May, adding AI infrastructure and high-performance memory exposure to the Roth.",
    href: "/positions/PENG",
  },
  {
    date: "2026-05-05",
    ticker: "ASTS",
    company: "AST SpaceMobile",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Position add",
    note: "Added to AST SpaceMobile on price weakness, maintaining the small speculative satellite-to-cell exposure.",
    href: "/positions/ASTS",
    returnPct: 19.96,
  },
  {
    date: "2026-05-01",
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Thematic exposure increase",
    note: "Added to SMH on May 1, 2026 to increase broad semiconductor and AI infrastructure exposure within the Roth Retirement Account.",
    href: "/positions/SMH",
    returnPct: 27.12,
  },
  {
    date: "2026-05-01",
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    account: "Roth Retirement Account",
    action: "Add",
    type: "Core allocation increase",
    note: "Added to VOO on May 1, 2026 to increase core U.S. equity market exposure within the Roth Retirement Account.",
    href: "/positions/VOO",
  },
  {
    date: "2026-05-01",
    ticker: "AMD",
    company: "Advanced Micro Devices",
    account: "Roth Retirement Account",
    action: "Trim",
    type: "Position sizing / risk management",
    note: "Trimmed AMD in the Roth Retirement Account on May 1, 2026 after a significant run to bring the position back toward my 10% max position-size discipline. This was not a thesis reversal. The core AMD thesis remains intact, but the trim reflected concentration control, risk management, and a preference to preserve gains after the position had outgrown its intended role.",
    href: "/positions/AMD",
    returnPct: 71.53,
    decisionAction: "Trim",
    holding: "AMD",
    trigger: "Position moved above target sizing after rapid appreciation",
    oldWeight: "12.5%",
    targetWeight: "10.0%",
    maxWeight: "11.5%",
    thesisChange: "No thesis break; review driven by sizing discipline",
    decision: "Trim to restore target sizing",
    capitalDestination: "Diversified/core exposure or cash pending review",
    lesson: "A strong thesis does not eliminate sizing discipline. Position size must still match evidence, valuation, and portfolio risk.",
  },
  {
    date: "2026-05-01",
    ticker: "SCHD",
    company: "Schwab U.S. Dividend Equity ETF",
    account: "Roth Retirement Account",
    action: "Exit",
    type: "Portfolio role clarity / capital reallocation",
    note: "Fully exited SCHD from the Roth Retirement Account on May 1, 2026. SCHD remains a quality dividend ETF, but it no longer fit the intended role of this account. The Roth is being used for long-term compounding, broad-market exposure, durable growth, and select high-conviction themes, while SCHD's dividend/value profile created lower-conviction exposure that did not align with that objective.",
    href: "/archive/SCHD",
    returnPct: 2.0,
  },
  {
    date: "2026-04",
    ticker: "IREN",
    company: "IREN",
    account: "Roth Retirement Account",
    action: "Exit",
    type: "Reallocation after thesis upside",
    note: "Exited after the AI/cloud pivot became a less attractive risk/reward at the new price. The position had already captured a large part of the original upside, so I preferred to recycle gains into higher-conviction opportunities.",
    href: "/archive/IREN",
    returnPct: 133.3,
  },
  {
    date: "2026-04",
    ticker: "SATL",
    company: "Satellogic",
    account: "Roth Retirement Account",
    action: "Exit",
    type: "Reallocation, execution-dependent thesis",
    note: "Exited after the position appreciated and the thesis remained too execution-dependent relative to better alternatives in the portfolio.",
    href: "/archive/SATL",
    returnPct: 30.0,
  },
  {
    date: "2025-08",
    ticker: "PLTR",
    company: "Palantir Technologies",
    account: "Roth Retirement Account",
    action: "Exit",
    type: "Valuation discipline",
    note: "Exited PLTR in August 2025 as a valuation-discipline and reallocation decision. The exit reflected portfolio construction and risk/reward discipline rather than a negative view on the business.",
    href: "/archive/PLTR",
    returnPct: 520.0,
  },
];
