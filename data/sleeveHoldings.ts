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
  /**
   * Manually-maintained fallback weight % within this sleeve.
   * Treated as a fallback when live derivation (shares × price) is unavailable
   * for this holding. The derived layer (lib/portfolioCalculations.ts) is the
   * source of truth for displayed weights when live data is present.
   */
  portfolioWeightPct: number;
  /**
   * Manually-maintained current share count. Source of truth for live-derived
   * weights (shares × livePrice / Σ shares × livePrice). Internal only — never
   * displayed publicly. Update when shares change due to buys/sells/splits.
   */
  shares?: number;
  /** Manually-maintained fallback return %. Live computed when avgCost + quote available. */
  returnPct?: number;
  /** Decimal target weight (0.10 = 10%). Drives weight-status banding when set. */
  targetWeight?: number;
  /** Decimal max-band weight (0.115 = 11.5%). Defaults to targetWeight × 1.15 if omitted. */
  maxWeight?: number;
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
    shares: 16.83,
    returnPct: 8.05,
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
    shares: 8.46,
    returnPct: 95.08,
    targetWeight: 0.10,
    maxWeight: 0.115,
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
    shares: 3.82,
    returnPct: 25.57,
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
    shares: 7.47,
    returnPct: 276.84,
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
    shares: 77.09,
    returnPct: 20.22,
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
    shares: 4.33,
    returnPct: 110.54,
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
    shares: 34.09,
    returnPct: -8.40,
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
    shares: 1.00,
    returnPct: -6.16,
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
    shares: 37.62,
    returnPct: 8.95,
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
    shares: 1.99,
    returnPct: -6.38,
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
    shares: 12.75,
    returnPct: 5.43,
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
    shares: 3.25,
    returnPct: 37.91,
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
    shares: 8.00,
    returnPct: -28.00,
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
    shares: 13.74,
    returnPct: -28.24,
    country: "US",
    marketCap: "Small Cap",
    assetType: "Equity",
    theme: "Space / Defense",
    subcategory: "Defense Technology / Unmanned Systems",
    thesis: "Defense technology contractor and unmanned systems exposure tied to UAS, ISR, and defense modernization demand.",
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
  return result;
}
