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
// portfolioWeightPct values are pre-computed % of stocks-only equity from the
// internal account snapshot; they exist only as a static fallback when the
// derived layer cannot compute live weight from shares × price.
export const rothIraHoldings: SleeveHolding[] = [
  {
    ticker: "VOO",
    company: "Vanguard S&P 500 ETF",
    portfolioWeightPct: 35.42,
    shares: 16.828,
    returnPct: 11.91,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "ETF",
    theme: "Core Market",
    subcategory: "Broad Market ETF",
    thesis: "Core U.S. large-cap market exposure.",
  },
  {
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    portfolioWeightPct: 6.84,
    shares: 3.591,
    returnPct: 36.05,
    country: "US",
    marketCap: "Large Cap",
    assetType: "ETF",
    theme: "AI / Semiconductors",
    subcategory: "Semiconductors ETF",
    thesis: "Concentrated semiconductor basket.",
  },
  {
    ticker: "AMD",
    company: "Advanced Micro Devices",
    portfolioWeightPct: 6.27,
    shares: 4,
    returnPct: 131.13,
    targetWeight: 0.10,
    maxWeight: 0.115,
    country: "US",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "AI / Semiconductors",
    subcategory: "Semiconductors / AI",
    thesis: "AI compute and semiconductor exposure.",
  },
  {
    ticker: "FBTC",
    company: "Fidelity Wise Origin Bitcoin Fund",
    portfolioWeightPct: 6.03,
    shares: 34.437,
    returnPct: -24.83,
    country: "US",
    // marketCap intentionally omitted — crypto-linked ETF
    assetType: "Crypto-linked ETF",
    theme: "Digital Assets",
    subcategory: "Bitcoin",
    thesis: "Bitcoin exposure through ETF wrapper.",
  },
  {
    ticker: "NBIS",
    company: "Nebius Group",
    portfolioWeightPct: 5.84,
    shares: 7.467,
    returnPct: 401.66,
    country: "International",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "AI / Semiconductors",
    subcategory: "AI / Infrastructure",
    thesis: "Higher-beta AI infrastructure and compute exposure.",
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Class A",
    portfolioWeightPct: 5.81,
    shares: 5.326,
    returnPct: 63.27,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Internet / AI",
    thesis: "Durable large-cap platform with AI optionality.",
  },
  {
    ticker: "MELI",
    company: "MercadoLibre",
    portfolioWeightPct: 5.04,
    shares: 1,
    returnPct: -14.64,
    country: "Latin America",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "E-commerce / Fintech",
    thesis: "Latin American platform and payments compounder.",
  },
  {
    ticker: "CRWD",
    company: "CrowdStrike Holdings",
    portfolioWeightPct: 4.98,
    shares: 2.06,
    returnPct: 6.11,
    country: "US",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Cybersecurity",
    thesis: "Cloud-native endpoint security with consolidating cybersecurity platform exposure.",
  },
  {
    ticker: "RKLB",
    company: "Rocket Lab",
    portfolioWeightPct: 4.74,
    shares: 12.746,
    returnPct: 53.84,
    country: "US",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "Space / Defense",
    subcategory: "Space",
    thesis: "Space launch and infrastructure exposure.",
  },
  {
    ticker: "META",
    company: "Meta Platforms",
    portfolioWeightPct: 4.53,
    shares: 2.5,
    returnPct: -5.35,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Internet / AI",
    thesis: "Large-cap platform with AI monetization upside.",
  },
  {
    ticker: "NOW",
    company: "ServiceNow",
    portfolioWeightPct: 4.46,
    shares: 11.386,
    returnPct: 17.27,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Enterprise SaaS",
    thesis: "Enterprise workflow automation platform with durable expansion in AI and agent use cases.",
  },
  {
    ticker: "UNH",
    company: "UnitedHealth",
    portfolioWeightPct: 4.34,
    shares: 3.818,
    returnPct: 29.10,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Healthcare",
    subcategory: "Healthcare",
    thesis: "Defensive large-cap healthcare compounder.",
  },
  {
    ticker: "PENG",
    company: "Penguin Solutions",
    portfolioWeightPct: 2.86,
    shares: 13.849,
    returnPct: 36.71,
    country: "US",
    marketCap: "Small Cap",
    assetType: "Equity",
    theme: "AI / Semiconductors",
    subcategory: "AI Infrastructure",
    thesis: "Memory and AI infrastructure exposure with high-performance computing demand.",
  },
  {
    ticker: "ASTS",
    company: "AST SpaceMobile",
    portfolioWeightPct: 2.84,
    shares: 8,
    returnPct: 19.96,
    country: "US",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "Space / Defense",
    subcategory: "Satellite Communications",
    thesis: "Satellite-to-cellular connectivity platform.",
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
