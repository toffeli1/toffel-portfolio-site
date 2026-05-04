// ─── Decision log — public-safe portfolio activity entries ────────────────────
// Privacy: no share counts, quantities, total dollar amounts, or market values.

export interface DecisionEntry {
  /** "YYYY-MM-DD" or "YYYY-MM" for month-resolution entries */
  date: string;
  ticker: string;
  company: string;
  account: string;
  /** Short action label: "Buy", "Market buy", "Trim", "Full exit" */
  action: string;
  /** Decision category */
  type: string;
  /** Public-safe rationale */
  note: string;
  /** /positions/TICKER for active, /archive/TICKER for exited */
  href: string;
  /** Return % since entry — positive or negative; omit if unavailable */
  returnPct?: number;
}

// Reverse-chronological order — newest first.
export const decisionLog: DecisionEntry[] = [
  {
    date: "2026-05-01",
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    account: "Roth Retirement Account",
    action: "Buy",
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
    action: "Market buy",
    type: "Core allocation increase",
    note: "Added to VOO on May 1, 2026 to increase core U.S. equity market exposure within the Roth Retirement Account.",
    href: "/positions/VOO",
  },
  {
    date: "2026-05-01",
    ticker: "AMD",
    company: "AMD",
    account: "Roth Retirement Account",
    action: "Trim",
    type: "Position sizing / risk management",
    note: "Trimmed AMD in the Roth Retirement Account on May 1, 2026 after a significant run to bring the position back toward my 10% max position-size discipline. This was not a thesis reversal. The core AMD thesis remains intact, but the trim reflected concentration control, risk management, and a preference to preserve gains after the position had outgrown its intended role.",
    href: "/positions/AMD",
    returnPct: 71.53,
  },
  {
    date: "2026-05-01",
    ticker: "SCHD",
    company: "Schwab U.S. Dividend Equity ETF",
    account: "Roth Retirement Account",
    action: "Full exit",
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
    action: "Full exit",
    type: "Capital-allocation upgrade",
    note: "Exited IREN in April 2026 after the position had run up. The cut was a capital-allocation upgrade, reallocating away from a less attractive risk/reward setup toward better opportunities.",
    href: "/archive/IREN",
    returnPct: 133.3,
  },
  {
    date: "2026-04",
    ticker: "SATL",
    company: "Satellogic",
    account: "Roth Retirement Account",
    action: "Full exit",
    type: "Capital-allocation upgrade",
    note: "Exited SATL in April 2026 after the position had run up. The cut was a capital-allocation upgrade, reallocating away from a less attractive risk/reward setup toward better opportunities.",
    href: "/archive/SATL",
    returnPct: 30.0,
  },
  {
    date: "2025-08",
    ticker: "PLTR",
    company: "Palantir Technologies",
    account: "Roth Retirement Account",
    action: "Full exit",
    type: "Reallocated / valuation discipline",
    note: "Exited PLTR in August 2025 as a valuation-discipline and reallocation decision. The exit reflected portfolio construction and risk/reward discipline rather than a negative view on the business.",
    href: "/archive/PLTR",
    returnPct: 520.0,
  },
];
