// ─── Decision log — public-safe portfolio activity entries ────────────────────
// Privacy: no share counts, quantities, total dollar amounts, or market values.

export interface DecisionEntry {
  /** Optional stable identifier (kebab-case) for cross-linking from transaction events. */
  id?: string;
  /**
   * Groups trades across MULTIPLE DAYS that were driven by one thesis into a
   * single decision event. Same-day trades in one ticker merge automatically and
   * do not need this. See the grouping rules in data/decisions.ts.
   */
  groupId?: string;
  /** "YYYY-MM-DD" or "YYYY-MM" for month-resolution entries */
  date: string;
  /**
   * Required (checked at build time, see the guard in data/decisions.ts) on
   * any month-resolution Trim or Add: an explicit, positive statement that a
   * real transaction is confirmed to have happened, even though the exact
   * day is not preserved. The absence of this flag is NOT itself evidence of
   * anything; it exists because a weight change between two tracker
   * snapshots is not evidence of a trade on its own; a partial-trim weight
   * decrease can be dilution from capital added elsewhere or price
   * depreciation, and a partial-add weight increase can be other holdings'
   * prices falling. Five entries were published in Aug 2026 inferring a
   * Trim/Add from a weight delta alone with no other evidence; none could be
   * confirmed and all were removed. Set this only when you have actually
   * confirmed the transaction happened, e.g. against Robinhood history, not
   * because the weight moved.
   */
  dateApproximateButConfirmed?: boolean;
  ticker: string;
  company: string;
  account: string;
  /** Short action label: "Add", "Trim", "Exit", "Rebalance". */
  action: string;
  /** Decision category */
  type: string;
  /** Public-safe rationale */
  note: string;
  /** /positions/TICKER for active, /archive/TICKER for exited. Omit when
   *  neither page exists (e.g. a closed position with no archive write-up). */
  href?: string;
  /** Return % since entry — positive or negative; omit if unavailable */
  returnPct?: number;
  /** Current status for this ticker as of the most recent data refresh. */
  status?: "Held" | "Fully Exited" | "Partially Trimmed";
  /** This entry's share of total realized P&L across all closed/trimmed
   *  positions, as a percentage. Never the dollar figure. */
  realizedSharePct?: number;
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
//
// Entries dated "2026-07" below are sourced from IRA_Roth_Tracker.xlsx, which
// records final holdings/realized state but not per-transaction dates. Rather
// than invent a specific day, these are dated to the tracker's July 2026
// snapshot and say so in the note. This is the one systematic gap in this
// rebuild — precise dates for these events aren't preserved in source records.
export const decisionLog: DecisionEntry[] = [
  // ── Aug 2026 rebalance: first recorded Roth purchases for these six ──────
  // Dates are EXECUTION dates in US Eastern, derived from the ledger's
  // transaction_datetime. The dates originally supplied were settlement dates,
  // one to two sessions later; using them made a position's "prior close" fall
  // AFTER its own purchase, so AMZN's opening weight computed as 9.98% instead
  // of 0%. Weights are now reconstructed (data/decisionWeights.json), so no
  // weight is hardcoded here.
  //
  // CEG spans Aug 7–18 as one thesis-driven add (groupCeg). GLDM and AMZN each
  // had two fills on a single day, which the grouping layer in data/decisions.ts
  // merges into one event automatically.
  //
  // The other side of the same rebalance: VOO, CRWD, and FBTC were each fully
  // sold in a single transaction, funding the adds above. Dates and full-exit
  // quantities are exact, confirmed against the transaction ledger.
  {
    date: "2026-08-18",
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    account: "Investments",
    action: "Exit",
    type: "Full exit",
    note: "Fully exited VOO as part of the August 2026 portfolio restructuring.",
    status: "Fully Exited",
  },
  {
    date: "2026-08-12",
    ticker: "FBTC",
    company: "Fidelity Wise Origin Bitcoin Fund",
    account: "Investments",
    action: "Exit",
    type: "Full exit",
    note: "Fully exited FBTC as part of the August 2026 portfolio restructuring.",
    status: "Fully Exited",
  },
  {
    date: "2026-08-07",
    ticker: "CRWD",
    company: "CrowdStrike Holdings",
    account: "Investments",
    action: "Exit",
    type: "Full exit",
    note: "Fully exited CRWD as part of the August 2026 portfolio restructuring.",
    status: "Fully Exited",
  },
  {
    date: "2026-08-06",
    ticker: "CEG",
    company: "Constellation Energy",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add, multi-day build",
    groupId: "ceg-aug-2026-build",
    note: "Preferred Constellation because it had pulled back, is more established, provides relatively pure exposure to the nuclear thesis, and has stronger underlying metrics than more speculative alternatives. Nuclear currently looks more attractive than wind and solar given the policy and economic environment. Built across several days rather than in a single fill.",
    status: "Held",
  },
  {
    date: "2026-08-17",
    ticker: "CEG",
    company: "Constellation Energy",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add, multi-day build",
    groupId: "ceg-aug-2026-build",
    note: "Final tranche of the Constellation build begun Aug 7.",
    status: "Held",
  },
  {
    date: "2026-08-10",
    ticker: "GLDM",
    company: "SPDR Gold MiniShares Trust",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add",
    groupId: "gldm-aug-2026-build",
    note: "Added gold exposure for a period expected to remain uncertain. The market is still working through AI capital spending, monetization expectations, macroeconomic conditions, and geopolitical risk including conflict in the Middle East. Intended as stabilising exposure against a growth-heavy portfolio, and a source of funds if equity weakness creates better opportunities.",
    status: "Held",
  },
  {
    date: "2026-08-11",
    ticker: "GLDM",
    company: "SPDR Gold MiniShares Trust",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add",
    groupId: "gldm-aug-2026-build",
    note: "Second fill of the gold initiation begun the prior session.",
    status: "Held",
  },
  {
    date: "2026-08-17",
    ticker: "AMZN",
    company: "Amazon.com",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add",
    note: "The central thesis is AWS: cloud and compute demand should continue compounding, and AWS is one of the largest and highest-quality infrastructure businesses in the world. Amazon also brings dominant e-commerce, logistics scale, robotics optionality and potential long-term automation exposure. The pullback created an attractive entry point.",
    status: "Held",
  },
  {
    date: "2026-08-17",
    ticker: "SGOV",
    company: "iShares 0-3 Month Treasury Bond ETF",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add",
    note: "Effectively the cash allocation. Keeps capital liquid and productive while waiting for attractive opportunities during a choppy market, and can be redeployed when individual holdings or the broader market create better entry points.",
    status: "Held",
  },
  {
    date: "2026-08-17",
    ticker: "MA",
    company: "Mastercard",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add",
    note: "Mastercard gives the portfolio exposure away from the AI and compute theme. The appeal is margins, network economics, and the long-term ability to compound alongside increasing total payment volume.",
    status: "Held",
  },
  {
    date: "2026-08-17",
    ticker: "CBRS",
    company: "Cerebras Systems",
    account: "Investments",
    action: "Add",
    type: "New position",
    decisionAction: "Add",
    note: "A higher-risk direct expression of the agentic-AI thesis. Widespread deployment of AI agents should materially increase inference and compute demand, and Cerebras gives direct exposure to that possibility.",
    status: "Held",
  },
  {
    date: "2026-07-27",
    ticker: "GEV",
    company: "GE Vernova",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source.",
    returnPct: 1.4,
    status: "Fully Exited",
    realizedSharePct: 0.20,
  },
  {
    date: "2026-07-27",
    ticker: "GOOGL",
    company: "Alphabet Class A",
    account: "Investments",
    action: "Add",
    type: "Position add",
    note: "Added to GOOGL, extending the platform-tech allocation within the account.",
    href: "/positions/GOOGL",
    status: "Held",
  },
  {
    date: "2026-07-27",
    ticker: "NBIS",
    company: "Nebius Group",
    account: "Investments",
    action: "Add",
    type: "Position add",
    note: "Added to Nebius Group, extending AI-infrastructure exposure within the account.",
    href: "/positions/NBIS",
    status: "Held",
  },
  {
    date: "2026-07-23",
    ticker: "AMD",
    company: "Advanced Micro Devices",
    account: "Investments",
    action: "Exit",
    type: "Full exit",
    note: "Closed the remaining AMD position after the May trims. The freed capital was reallocated the same day to ServiceNow and VanEck Semiconductor ETF. AMD was the single largest contributor to realized results across the account's history.",
    returnPct: 134.8,
    status: "Fully Exited",
    realizedSharePct: 60.66,
  },
  {
    date: "2026-07-23",
    ticker: "NOW",
    company: "ServiceNow",
    account: "Investments",
    action: "Add",
    type: "Reallocation from AMD proceeds",
    note: "Increased the ServiceNow allocation with capital freed by the same-day AMD exit, concentrating the enterprise-software exposure into one name.",
    href: "/positions/NOW",
    status: "Held",
  },
  {
    date: "2026-07-23",
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    account: "Investments",
    action: "Add",
    type: "Reallocation from AMD proceeds",
    note: "Increased the VanEck Semiconductor allocation with capital freed by the same-day AMD exit, moving that semiconductor exposure from a single company to the basket.",
    href: "/positions/SMH",
    status: "Held",
  },
  {
    date: "2026-07-21",
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    account: "Investments",
    action: "Add",
    type: "Core allocation increase",
    note: "Added to VOO, increasing core U.S. equity market exposure within the account.",
    href: "/positions/VOO",
    status: "Held",
  },
  {
    date: "2026-07-21",
    ticker: "RKLB",
    company: "Rocket Lab",
    account: "Investments",
    action: "Add",
    type: "Position add",
    note: "Added to Rocket Lab, extending the space/defense allocation within the account.",
    href: "/positions/RKLB",
    status: "Held",
  },
  {
    date: "2026-07",
    ticker: "PENG",
    company: "Penguin Solutions",
    account: "Investments",
    action: "Exit",
    type: "Full exit",
    note: "Fully exited Penguin Solutions after the May build-out. Exact exit date not preserved in source records; recorded as of the account's July 2026 tracker snapshot.",
    returnPct: 26.1,
    status: "Fully Exited",
    realizedSharePct: 4.09,
  },
  {
    date: "2026-07",
    dateApproximateButConfirmed: true,
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    account: "Investments",
    action: "Trim",
    type: "Partial trim, position remains held",
    note: "Trimmed part of the VOO position; the remainder continues to be held. Exact trim date not preserved in source records; recorded as of the account's July 2026 tracker snapshot.",
    href: "/positions/VOO",
    returnPct: 12.5,
    status: "Partially Trimmed",
    realizedSharePct: 17.67,
  },
  {
    date: "2026-07",
    ticker: "CRWD",
    company: "CrowdStrike Holdings",
    account: "Investments",
    action: "Rebalance",
    type: "Corporate action",
    note: "CRWD underwent a stock split; the historical position records were adjusted for the split. No change to the position or thesis. This is a bookkeeping adjustment, not a trade.",
    href: "/positions/CRWD",
    status: "Held",
  },
  {
    date: "2026-07",
    ticker: "NOW",
    company: "ServiceNow",
    account: "Investments",
    action: "Rebalance",
    type: "Corporate action",
    note: "Historical NOW buy lots include post-split fills; the position records were adjusted for the split. No change to the position or thesis. This is a bookkeeping adjustment, not a trade.",
    href: "/positions/NOW",
    status: "Held",
  },
  {
    date: "2026-07",
    ticker: "ASML",
    company: "ASML Holding N.V.",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 77.1,
    status: "Fully Exited",
    realizedSharePct: 1.81,
  },
  {
    date: "2026-07",
    ticker: "AEVA",
    company: "Aeva Technologies",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 68.1,
    status: "Fully Exited",
    realizedSharePct: 1.63,
  },
  {
    date: "2026-07",
    ticker: "LMND",
    company: "Lemonade",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 63.7,
    status: "Fully Exited",
    realizedSharePct: 1.63,
  },
  {
    date: "2026-07",
    ticker: "QBTS",
    company: "D-Wave Quantum",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 60.6,
    status: "Fully Exited",
    realizedSharePct: 1.33,
  },
  {
    date: "2026-07",
    ticker: "VGT",
    company: "Vanguard Information Technology ETF",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 7.6,
    status: "Fully Exited",
    realizedSharePct: 4.47,
  },
  {
    date: "2026-07",
    ticker: "SOFI",
    company: "SoFi Technologies",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 26.0,
    status: "Fully Exited",
    realizedSharePct: 2.82,
  },
  {
    date: "2026-07",
    ticker: "QQQ",
    company: "Invesco QQQ Trust",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 8.2,
    status: "Fully Exited",
    realizedSharePct: 3.63,
  },
  {
    date: "2026-07",
    ticker: "HOOD",
    company: "Robinhood Markets",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 8.5,
    status: "Fully Exited",
    realizedSharePct: 0.92,
  },
  {
    date: "2026-07",
    ticker: "NVDA",
    company: "NVIDIA",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: 4.5,
    status: "Fully Exited",
    realizedSharePct: 0.17,
  },
  {
    date: "2026-07",
    ticker: "OSCR",
    company: "Oscar Health",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: -11.1,
    status: "Fully Exited",
    realizedSharePct: -0.39,
  },
  {
    date: "2026-07",
    ticker: "CAVA",
    company: "CAVA Group",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: -19.5,
    status: "Fully Exited",
    realizedSharePct: -0.42,
  },
  {
    date: "2026-07",
    ticker: "SPOT",
    company: "Spotify Technology",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: -11.2,
    status: "Fully Exited",
    realizedSharePct: -0.61,
  },
  {
    date: "2026-07",
    ticker: "SOAR",
    company: "Volato Group",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: -38.8,
    status: "Fully Exited",
    realizedSharePct: -0.83,
  },
  {
    date: "2026-07",
    ticker: "HIMS",
    company: "Hims & Hers Health",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: -43.5,
    status: "Fully Exited",
    realizedSharePct: -6.65,
  },
  {
    date: "2026-07",
    ticker: "DUOL",
    company: "Duolingo",
    account: "Investments",
    action: "Exit",
    type: "Closed position",
    note: "Closed position. No further rationale recorded in source; realized outcome captured in the account's July 2026 tracker snapshot.",
    returnPct: -46.1,
    status: "Fully Exited",
    realizedSharePct: -5.01,
  },
  {
    date: "2026-06-02",
    ticker: "NOW",
    company: "ServiceNow",
    account: "Investments",
    action: "Add",
    type: "Position build-out",
    note: "Completed the initial ServiceNow build with a final allocation, bringing the enterprise-software position to its intended size.",
    href: "/positions/NOW",
    returnPct: 26.37,
    status: "Held",
  },
  {
    date: "2026-06-02",
    ticker: "CRWD",
    company: "CrowdStrike Holdings",
    account: "Investments",
    action: "Add",
    type: "Position build-out",
    note: "Added to the CrowdStrike position to complete the cybersecurity buildout within the account.",
    href: "/positions/CRWD",
    returnPct: 19.48,
  },
  {
    date: "2026-06-02",
    ticker: "PENG",
    company: "Penguin Solutions",
    account: "Investments",
    action: "Add",
    type: "Position build-out",
    note: "Added to Penguin Solutions to finalize the AI infrastructure position size in the account.",
    returnPct: 43.17,
  },
  {
    date: "2026-06-02",
    ticker: "META",
    company: "Meta Platforms",
    account: "Investments",
    action: "Add",
    type: "Rebalance into weakness",
    note: "Added to META, restoring sizing into recent price weakness.",
    href: "/positions/META",
    returnPct: -5.35,
  },
  {
    date: "2026-06-02",
    ticker: "GOOGL",
    company: "Alphabet Class A",
    account: "Investments",
    action: "Add",
    type: "Position add",
    note: "Added to GOOGL, extending the platform-tech allocation within the account.",
    href: "/positions/GOOGL",
    returnPct: 63.27,
  },
  {
    date: "2026-06-01",
    ticker: "AVEX",
    company: "AEVEX Corp.",
    account: "Investments",
    action: "Exit",
    type: "Reallocation to higher-conviction holdings",
    note: "Exited AEVEX. The small speculative defense-tech allocation was recycled into higher-conviction names with clearer near-term catalysts.",
    href: "/archive/AVEX",
    returnPct: 5.38,
    status: "Fully Exited",
    realizedSharePct: 0.59,
  },
  {
    date: "2026-06-01",
    ticker: "NU",
    company: "Nu Holdings",
    account: "Investments",
    action: "Exit",
    type: "Reallocation",
    note: "Exited Nu Holdings. Capital reallocated toward higher-conviction Latin America and platform-tech expressions in the account.",
    href: "/archive/NU",
    returnPct: -2.33,
    status: "Fully Exited",
    realizedSharePct: -0.26,
  },
  {
    date: "2026-05-31",
    ticker: "AMD",
    company: "Advanced Micro Devices",
    account: "Investments",
    action: "Trim",
    type: "Position sizing / risk management",
    note: "Continued trimming AMD through May as the position appreciated above the target sizing band. Multiple sessions of small trims recycled gains while preserving core exposure to the AI compute thesis.",
    returnPct: 127.80,
  },
  {
    date: "2026-05",
    dateApproximateButConfirmed: true,
    ticker: "CRWD",
    company: "CrowdStrike Holdings",
    account: "Investments",
    action: "Add",
    type: "New position",
    note: "Initiated the CrowdStrike position via a series of buys through mid-to-late May, establishing cloud-native cybersecurity platform exposure in the account.",
    href: "/positions/CRWD",
  },
  {
    date: "2026-05",
    dateApproximateButConfirmed: true,
    ticker: "NOW",
    company: "ServiceNow",
    account: "Investments",
    action: "Add",
    type: "New position",
    note: "Initiated the ServiceNow position with multiple buys in mid-May, adding enterprise workflow automation and AI-agent expansion exposure to the account.",
    href: "/positions/NOW",
  },
  {
    date: "2026-05",
    dateApproximateButConfirmed: true,
    ticker: "PENG",
    company: "Penguin Solutions",
    account: "Investments",
    action: "Add",
    type: "New position",
    note: "Initiated the Penguin Solutions position with multiple buys through May, adding AI infrastructure and high-performance memory exposure to the account.",
  },
  {
    date: "2026-05-05",
    ticker: "ASTS",
    company: "AST SpaceMobile",
    account: "Investments",
    action: "Add",
    type: "Position add",
    note: "Added to AST SpaceMobile on price weakness, maintaining the small speculative satellite-to-cell exposure.",
    href: "/positions/ASTS",
    returnPct: 19.96,
    status: "Held",
  },
  {
    date: "2026-05-01",
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    account: "Investments",
    action: "Add",
    type: "Thematic exposure increase",
    note: "Added to SMH on May 1, 2026 to increase broad semiconductor and AI infrastructure exposure within the account.",
    href: "/positions/SMH",
    returnPct: 27.12,
    status: "Held",
  },
  {
    date: "2026-05-01",
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    account: "Investments",
    action: "Add",
    type: "Core allocation increase",
    note: "Added to VOO on May 1, 2026 to increase core U.S. equity market exposure within the account.",
    href: "/positions/VOO",
  },
  {
    date: "2026-05-01",
    ticker: "AMD",
    company: "Advanced Micro Devices",
    account: "Investments",
    action: "Trim",
    type: "Position sizing / risk management",
    note: "Trimmed AMD in the account on May 1, 2026 after a significant run to bring the position back toward my 10% max position-size discipline. This was not a thesis reversal. The core AMD thesis remains intact, but the trim reflected concentration control, risk management, and a preference to preserve gains after the position had outgrown its intended role.",
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
    account: "Investments",
    action: "Exit",
    type: "Portfolio role clarity / capital reallocation",
    note: "Fully exited SCHD from the account on May 1, 2026. SCHD remains a quality dividend ETF, but it no longer fit the intended role of this account. The account is being used for long-term compounding, broad-market exposure, durable growth, and select high-conviction themes, while SCHD's dividend/value profile created lower-conviction exposure that did not align with that objective.",
    href: "/archive/SCHD",
    returnPct: 2.0,
    status: "Fully Exited",
    realizedSharePct: 1.84,
  },
  {
    date: "2026-04",
    ticker: "IREN",
    company: "IREN",
    account: "Investments",
    action: "Exit",
    type: "Reallocation after thesis upside",
    note: "Exited after the AI/cloud pivot became a less attractive risk/reward at the new price. The position had already captured a large part of the original upside, so I preferred to recycle gains into higher-conviction opportunities.",
    href: "/archive/IREN",
    returnPct: 133.3,
    status: "Fully Exited",
    realizedSharePct: 5.90,
  },
  {
    date: "2026-04",
    ticker: "SATL",
    company: "Satellogic",
    account: "Investments",
    action: "Exit",
    type: "Reallocation, execution-dependent thesis",
    note: "Exited after the position appreciated and the thesis remained too execution-dependent relative to better alternatives in the portfolio.",
    href: "/archive/SATL",
    returnPct: 30.0,
    status: "Fully Exited",
    realizedSharePct: 0.87,
  },
  {
    date: "2025-08",
    ticker: "PLTR",
    company: "Palantir Technologies",
    account: "Investments",
    action: "Exit",
    type: "Valuation discipline",
    note: "Exited PLTR in August 2025 as a valuation-discipline and reallocation decision. The exit reflected portfolio construction and risk/reward discipline rather than a negative view on the business.",
    href: "/archive/PLTR",
    returnPct: 520.0,
  },
  {
    date: "2023-06",
    dateApproximateButConfirmed: true,
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    account: "Investments",
    action: "Add",
    type: "Position transfer",
    note: "An in-kind transfer from an external Vanguard account established the initial VOO position. Later purchases were made directly in this account. Exact transfer date not preserved in source records. Placed here at the account's earliest known activity as an approximate marker.",
    href: "/positions/VOO",
  },
];
