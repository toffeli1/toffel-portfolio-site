// ─── Public-safe holdings for Robinhood sleeves ───────────────────────────────
// Edit this file to update Roth IRA or ETFs sleeve holdings.
//
// PRIVACY: No dollar values, share counts, cost basis, or equity values here.
// Public-safe fields only — see interface below.
//
// ENTRY DATES: To add a purchase-date marker to a holding's chart:
//   - If you know the exact date, set confirmedPurchaseDate: "YYYY-MM-DD"
//     and purchaseDateSource: "confirmed"
//   - If you only know the approximate entry price, set estimatedEntryPrice
//     and purchaseDateSource: "estimated" — the chart will find the historical
//     date where the market price was closest to that entry price
//   - Leave all entry fields undefined to show no marker

export type AssetType = "Equity" | "ETF" | "Crypto-linked ETF";
export type MarketCapBucket = "Mega Cap" | "Large Cap" | "Mid Cap" | "Small Cap";
export type CountryBucket = "US" | "Latin America" | "International";

export interface SleeveHolding {
  ticker: string;
  company: string;
  /** Portfolio weight % within this sleeve */
  portfolioWeightPct: number;
  /** Total return % since purchase — public-safe, no dollar amounts */
  returnPct?: number;
  country?: CountryBucket;
  /** Omit for ETFs / crypto-linked ETFs with no clear market cap bucket */
  marketCap?: MarketCapBucket;
  assetType: AssetType;
  /** Broad theme/sleeve grouping — used by the interactive composition chart */
  theme?: string;
  subcategory?: string;
  thesis?: string;
  notes?: string;
  // ── Entry date / price (optional, manually editable) ──────────────────────
  confirmedPurchaseDate?: string;  // "YYYY-MM-DD" — use when date is known
  estimatedPurchaseDate?: string;  // "YYYY-MM-DD" — manual override for estimate
  /** Implied entry price per share; chart finds closest historical date */
  estimatedEntryPrice?: number;
  purchaseDateSource?: "confirmed" | "estimated" | "unknown";
}

// ─── Roth IRA ─────────────────────────────────────────────────────────────────
export const rothIraHoldings: SleeveHolding[] = [
  {
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    portfolioWeightPct: 31.60,
    returnPct: 5.18,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "ETF",
    theme: "Core Market",
    subcategory: "Broad Market ETF",
    thesis: "Core U.S. large-cap market exposure.",
  },
  {
    ticker: "AMD",
    company: "AMD",
    portfolioWeightPct: 9.55,
    returnPct: 45.86,
    country: "US",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "AI / Semiconductors",
    subcategory: "Semiconductors / AI",
    thesis: "AI compute and semiconductor exposure.",
    notes: "Position trimmed 2% on Apr 30, 2026 to maintain ≤10% max position size.",
  },
  {
    ticker: "UNH",
    company: "UnitedHealth",
    portfolioWeightPct: 4.71,
    returnPct: 20.14,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Healthcare",
    subcategory: "Healthcare",
    thesis: "Defensive large-cap healthcare compounder.",
  },
  {
    ticker: "NBIS",
    company: "Nebius Group",
    portfolioWeightPct: 4.16,
    returnPct: 206.55,
    country: "International",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "AI / Semiconductors",
    subcategory: "AI / Infrastructure",
    thesis: "Higher-beta AI infrastructure and compute exposure.",
  },
  {
    ticker: "DLO",
    company: "dLocal",
    portfolioWeightPct: 3.61,
    returnPct: 14.14,
    country: "Latin America",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "Fintech",
    subcategory: "Fintech / Payments",
    thesis: "Cross-border payments exposure in emerging markets.",
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Class A",
    portfolioWeightPct: 5.06,
    returnPct: 76.23,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Internet / AI",
    thesis: "Durable large-cap platform with AI optionality.",
  },
  {
    ticker: "FBTC",
    company: "Fidelity Wise Origin Bitcoin Fund",
    portfolioWeightPct: 7.69,
    returnPct: -15.46,
    country: "US",
    // marketCap intentionally omitted — crypto-linked ETF
    assetType: "Crypto-linked ETF",
    theme: "Digital Assets",
    subcategory: "Bitcoin",
    thesis: "Bitcoin exposure through ETF wrapper.",
  },
  {
    ticker: "MELI",
    company: "MercadoLibre",
    portfolioWeightPct: 6.54,
    returnPct: -5.13,
    country: "Latin America",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "E-commerce / Fintech",
    thesis: "Latin American platform and payments compounder.",
  },
  {
    ticker: "NU",
    company: "Nu Holdings",
    portfolioWeightPct: 1.98,
    returnPct: 13.04,
    country: "Latin America",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "Fintech",
    subcategory: "Fintech",
    thesis: "Digital banking exposure in Latin America.",
  },
  {
    ticker: "META",
    company: "Meta Platforms",
    portfolioWeightPct: 4.67,
    returnPct: 2.28,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Internet / AI",
    thesis: "Large-cap platform with AI monetization upside.",
  },
  {
    ticker: "RKLB",
    company: "Rocket Lab",
    portfolioWeightPct: 3.90,
    returnPct: 8.40,
    country: "US",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "Space / Defense",
    subcategory: "Space",
    thesis: "Space launch and infrastructure exposure.",
  },
  {
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    portfolioWeightPct: 2.90,
    returnPct: 16.37,
    country: "US",
    marketCap: "Large Cap",
    assetType: "ETF",
    theme: "AI / Semiconductors",
    subcategory: "Semiconductors ETF",
    thesis: "Concentrated semiconductor basket.",
  },
  {
    ticker: "ASTS",
    company: "AST SpaceMobile",
    portfolioWeightPct: 1.67,
    returnPct: -27.22,
    country: "US",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "Space / Defense",
    subcategory: "Space / Communications",
    thesis: "Speculative direct-to-cell satellite connectivity exposure.",
  },
  {
    ticker: "AVEX",
    company: "AEVEX Corp.",
    portfolioWeightPct: 1.33,
    returnPct: -23.35,
    country: "US",
    marketCap: "Small Cap",
    assetType: "Equity",
    theme: "Space / Defense",
    subcategory: "Defense Technology / Unmanned Systems",
    thesis: "Defense technology contractor and unmanned systems exposure tied to UAS, ISR, and defense modernization demand.",
  },
  {
    ticker: "SOAR",
    company: "Volato Group",
    portfolioWeightPct: 0,
    country: "US",
    assetType: "Equity",
    theme: "Aviation / Mobility",
    subcategory: "Aviation / Mobility",
    thesis: "Speculative aviation and mobility position.",
    notes: "Stop-loss sell order placed Apr 28, 2026. Position pending exit.",
  },
];

// ─── ETFs sleeve ──────────────────────────────────────────────────────────────
export const etfsSleeveHoldings: SleeveHolding[] = [
  {
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    portfolioWeightPct: 23.97,
    returnPct: 61.68,
    country: "US",
    marketCap: "Large Cap",
    assetType: "ETF",
    subcategory: "Semiconductors ETF",
    thesis: "Concentrated semiconductor exposure.",
  },
  {
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    portfolioWeightPct: 47.03,
    returnPct: 12.89,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "ETF",
    subcategory: "Broad Market ETF",
    thesis: "Core S&P 500 exposure.",
  },
  {
    ticker: "QQQM",
    company: "Invesco NASDAQ 100 ETF",
    portfolioWeightPct: 28.99,
    returnPct: 21.29,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "ETF",
    subcategory: "Large Cap Growth ETF",
    thesis: "Nasdaq 100 growth exposure.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns all sleeve holdings that contain the given ticker. */
export function findCrossSleeveOwnerships(ticker: string): {
  slug: string;
  title: string;
}[] {
  const result: { slug: string; title: string }[] = [];
  if (rothIraHoldings.some((h) => h.ticker === ticker)) {
    result.push({ slug: "roth-ira", title: "Roth IRA" });
  }
  if (etfsSleeveHoldings.some((h) => h.ticker === ticker)) {
    result.push({ slug: "etfs", title: "ETFs" });
  }
  return result;
}
