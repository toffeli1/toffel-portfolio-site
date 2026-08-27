// ─── Company identity registry ────────────────────────────────────────────────
// ONE place that answers "what is this ticker called, what kind of asset is it,
// and is it currently held?" Investments, the Decision Log, thesis pages and
// Performance all read identity from here instead of keeping parallel copies.
//
// What does NOT live here:
//   - portfolio weights          → data/portfolioState.ts (canonical current state)
//   - decision history           → data/decisions.ts
//   - research/thesis content    → data/thesis/
//   - reported financials        → data/fundamentals/
//   - peer-similarity attributes → data/peerAttributes.ts
//
// PRIVACY: no share counts, dollar amounts, cost basis, or prices. Ever.

export type AssetKind = "Equity" | "ETF";

/** Where a ticker sits relative to the portfolio right now. */
export type HoldingStatus = "active" | "exited";

export interface Company {
  ticker: string;
  /** Full display name, e.g. "Alphabet Class A". */
  name: string;
  /** Short name for tight spaces (logo tiles, chart legends). Defaults to name. */
  shortName?: string;
  kind: AssetKind;
  status: HoldingStatus;
  /** Broad grouping used by allocation views. Not a sizing label — the thesis
   *  pages deliberately do NOT render Core/Satellite/Speculative tags. */
  theme?: string;
  /** For ETFs: what the fund actually holds, in one line. */
  fundMandate?: string;
}

// ── Active book — must stay exactly in sync with data/portfolioState.ts ───────
// (portfolioState asserts this at module load; a mismatch throws at build time.)

export const companies: Company[] = [
  // ── Active ────────────────────────────────────────────────────────────────
  { ticker: "AMZN",  name: "Amazon.com",              shortName: "Amazon",     kind: "Equity", status: "active", theme: "Cloud & Compute" },
  { ticker: "GOOGL", name: "Alphabet Class A",        shortName: "Alphabet",   kind: "Equity", status: "active", theme: "Cloud & Compute" },
  { ticker: "SMH",   name: "VanEck Semiconductor ETF", shortName: "VanEck SMH", kind: "ETF",   status: "active", theme: "Semiconductors",
    fundMandate: "Concentrated basket of the largest US-listed semiconductor makers and equipment suppliers." },
  { ticker: "NOW",   name: "ServiceNow",              shortName: "ServiceNow", kind: "Equity", status: "active", theme: "Enterprise Software" },
  { ticker: "META",  name: "Meta Platforms",          shortName: "Meta",       kind: "Equity", status: "active", theme: "Cloud & Compute" },
  { ticker: "SGOV",  name: "iShares 0-3 Month Treasury Bond ETF", shortName: "iShares SGOV", kind: "ETF", status: "active", theme: "Cash & Equivalents",
    fundMandate: "Treasury bills maturing in under three months, the portfolio's cash allocation." },
  { ticker: "NBIS",  name: "Nebius Group",            shortName: "Nebius",     kind: "Equity", status: "active", theme: "AI Infrastructure" },
  { ticker: "GLDM",  name: "SPDR Gold MiniShares Trust", shortName: "SPDR GLDM", kind: "ETF",  status: "active", theme: "Real Assets",
    fundMandate: "Physically-backed gold bullion held in trust." },
  { ticker: "CEG",   name: "Constellation Energy",    shortName: "Constellation", kind: "Equity", status: "active", theme: "Power Generation" },
  { ticker: "MELI",  name: "MercadoLibre",            shortName: "MercadoLibre", kind: "Equity", status: "active", theme: "Emerging Markets" },
  { ticker: "MA",    name: "Mastercard",              shortName: "Mastercard", kind: "Equity", status: "active", theme: "Payments" },
  { ticker: "UNH",   name: "UnitedHealth Group",      shortName: "UnitedHealth", kind: "Equity", status: "active", theme: "Healthcare" },
  { ticker: "RKLB",  name: "Rocket Lab",              shortName: "Rocket Lab", kind: "Equity", status: "active", theme: "Space" },
  { ticker: "OSCR",  name: "Oscar Health",            shortName: "Oscar",      kind: "Equity", status: "active", theme: "Healthcare" },
  { ticker: "CBRS",  name: "Cerebras Systems",        shortName: "Cerebras",   kind: "Equity", status: "active", theme: "AI Infrastructure" },
  { ticker: "ASTS",  name: "AST SpaceMobile",         shortName: "AST SpaceMobile", kind: "Equity", status: "active", theme: "Space" },

  // ── Exited — kept for the Decision Log and historical thesis pages ────────
  // These must never surface in active allocation, active thesis nav, or
  // current-portfolio analytics. lib/routes.ts enforces that split.
  { ticker: "VOO",  name: "Vanguard S&P 500 ETF", shortName: "Vanguard VOO", kind: "ETF", status: "exited", theme: "Broad Index",
    fundMandate: "Market-cap-weighted S&P 500 index fund." },
  { ticker: "AMD",  name: "Advanced Micro Devices", shortName: "AMD",   kind: "Equity", status: "exited", theme: "Semiconductors" },
  { ticker: "CRWD", name: "CrowdStrike",            shortName: "CrowdStrike", kind: "Equity", status: "exited", theme: "Enterprise Software" },
  { ticker: "PENG", name: "Penguin Solutions",      shortName: "Penguin", kind: "Equity", status: "exited", theme: "AI Infrastructure" },
  { ticker: "GEV",  name: "GE Vernova",             shortName: "GE Vernova", kind: "Equity", status: "exited", theme: "Power Generation" },
  { ticker: "FBTC", name: "Fidelity Wise Origin Bitcoin Fund", shortName: "Fidelity FBTC", kind: "ETF", status: "exited", theme: "Digital Assets",
    fundMandate: "Spot bitcoin held with a qualified custodian." },

  // ── Older exited names, registered so the Decision Log can link them ──────
  // These predate the positions above. They are registered ONLY so their
  // decision history resolves through the same canonical /thesis/[ticker]
  // route — they stay out of Investments, allocation and active thesis
  // navigation by virtue of status: "exited".
  //
  // No thesis content is invented for them. Where an archived write-up exists
  // in data/previousHoldings.ts (AVEX, NU, SCHD, IREN, SATL, PLTR) it is
  // migrated verbatim by data/thesis/index.ts. The rest render a restrained
  // historical shell that says a full thesis was not archived.
  { ticker: "ASML", name: "ASML Holding N.V.",       shortName: "ASML",       kind: "Equity", status: "exited", theme: "Semiconductors" },
  { ticker: "AEVA", name: "Aeva Technologies",       shortName: "Aeva",       kind: "Equity", status: "exited", theme: "Sensing & Lidar" },
  { ticker: "LMND", name: "Lemonade",                shortName: "Lemonade",   kind: "Equity", status: "exited", theme: "Insurance Tech" },
  { ticker: "QBTS", name: "D-Wave Quantum",          shortName: "D-Wave",     kind: "Equity", status: "exited", theme: "Quantum Computing" },
  { ticker: "VGT",  name: "Vanguard Information Technology ETF", shortName: "Vanguard VGT", kind: "ETF", status: "exited", theme: "Broad Index",
    fundMandate: "Market-cap-weighted US information-technology sector index fund." },
  { ticker: "SOFI", name: "SoFi Technologies",       shortName: "SoFi",       kind: "Equity", status: "exited", theme: "Fintech" },
  { ticker: "QQQ",  name: "Invesco QQQ Trust",       shortName: "Invesco QQQ", kind: "ETF",   status: "exited", theme: "Broad Index",
    fundMandate: "Tracks the Nasdaq-100 index." },
  { ticker: "HOOD", name: "Robinhood Markets",       shortName: "Robinhood",  kind: "Equity", status: "exited", theme: "Fintech" },
  { ticker: "NVDA", name: "NVIDIA",                  shortName: "NVIDIA",     kind: "Equity", status: "exited", theme: "Semiconductors" },
  { ticker: "CAVA", name: "CAVA Group",              shortName: "CAVA",       kind: "Equity", status: "exited", theme: "Consumer" },
  { ticker: "SPOT", name: "Spotify Technology",      shortName: "Spotify",    kind: "Equity", status: "exited", theme: "Consumer Internet" },
  { ticker: "SOAR", name: "Volato Group",            shortName: "Volato",     kind: "Equity", status: "exited", theme: "Aviation" },
  { ticker: "HIMS", name: "Hims & Hers Health",      shortName: "Hims & Hers", kind: "Equity", status: "exited", theme: "Healthcare" },
  { ticker: "DUOL", name: "Duolingo",                shortName: "Duolingo",   kind: "Equity", status: "exited", theme: "Consumer Internet" },
  { ticker: "AVEX", name: "AEVEX Corp.",             shortName: "AEVEX",      kind: "Equity", status: "exited", theme: "Defense" },
  { ticker: "NU",   name: "Nu Holdings",             shortName: "Nubank",     kind: "Equity", status: "exited", theme: "Emerging Markets" },
  { ticker: "SCHD", name: "Schwab U.S. Dividend Equity ETF", shortName: "Schwab SCHD", kind: "ETF", status: "exited", theme: "Dividend Income",
    fundMandate: "Screens US dividend payers on quality and yield." },
  { ticker: "IREN", name: "IREN Limited",            shortName: "IREN",       kind: "Equity", status: "exited", theme: "AI Infrastructure" },
  { ticker: "SATL", name: "Satellogic",              shortName: "Satellogic", kind: "Equity", status: "exited", theme: "Space" },
  { ticker: "PLTR", name: "Palantir Technologies",   shortName: "Palantir",   kind: "Equity", status: "exited", theme: "Enterprise Software" },
];

// ── Lookups ──────────────────────────────────────────────────────────────────

const BY_TICKER = new Map(companies.map((c) => [c.ticker, c]));

export function getCompany(ticker: string): Company | undefined {
  return BY_TICKER.get(ticker.toUpperCase());
}

/** Display name, falling back to the raw ticker so callers never render undefined. */
export function companyName(ticker: string): string {
  return BY_TICKER.get(ticker.toUpperCase())?.name ?? ticker;
}

export function shortName(ticker: string): string {
  const c = BY_TICKER.get(ticker.toUpperCase());
  return c?.shortName ?? c?.name ?? ticker;
}

export function activeCompanies(): Company[] {
  return companies.filter((c) => c.status === "active");
}

export function exitedCompanies(): Company[] {
  return companies.filter((c) => c.status === "exited");
}

export function isActiveTicker(ticker: string): boolean {
  return BY_TICKER.get(ticker.toUpperCase())?.status === "active";
}
