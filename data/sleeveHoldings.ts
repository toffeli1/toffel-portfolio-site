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
  // NOTE: there is deliberately no share-count (or any other quantity/dollar)
  // field on this interface. This repo is public on GitHub — a share count
  // combined with a public live price lets anyone back into a dollar position
  // size, which is exactly what the "percentages only" rule exists to prevent.
  // A `shares` field lived here before and was populated with real values;
  // clearing the data wasn't enough on its own, since the type still allowed
  // it to be silently repopulated later. It's removed here structurally —
  // don't re-add a quantity/dollar field to this interface without a
  // deliberate decision to do so.
  /** Manually-maintained fallback return %. Live computed when avgCost + quote available.
   *  Also serves as the "Since Purchase" value for the portfolio heatmap. */
  returnPct?: number;
  // ── Period returns (%) for the portfolio heatmap ──────────────────────────
  // Trailing-period total returns. Refresh from historical closes when prices
  // move materially. `sincePurchaseReturn` falls back to `returnPct` when unset.
  sincePurchaseReturn?: number;
  return12M?: number;
  return6M?: number;
  return3M?: number;
  return1M?: number;
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
//
// Rebalanced Aug 18, 2026 — full replacement of the holding set; weights
// refreshed from the Aug 20, 2026 account snapshot (see
// data/toffel_investments_public.json, the single source of truth for what's
// held and at what weight). Dropped: VOO, FBTC, CRWD (per the rebalance) and
// AMD, PENG (already fully exited; this cleanup was overdue — see the
// decisionLog for their exit history). Holdings are kept in descending weight
// order to match that file. `shares` and cost-basis-dependent return fields
// (returnPct/sincePurchaseReturn) are intentionally omitted for every holding
// below: the Aug 20 snapshot does carry per-position share counts and dollar
// cost basis, but both are quantity/dollar figures this file's own privacy
// note says not to carry into a public repo — a share count next to a public
// price reconstructs the position size. Trailing period returns
// (return1M/3M/6M/12M) are ticker-level market data, not tied to cost basis or
// share count, so the pre-rebalance figures for still-held tickers are
// preserved unchanged.
export const rothIraHoldings: SleeveHolding[] = [
  {
    ticker: "AMZN",
    company: "Amazon.com",
    portfolioWeightPct: 10.31,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "E-commerce / Cloud",
    // No thesis yet — position added in the Aug 2026 rebalance, write-up not yet published.
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Class A",
    portfolioWeightPct: 10.11,
    return1M: -10.67,
    return3M: 18.99,
    return6M: 12.33,
    return12M: 105.92,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Internet / AI",
    thesis: "Durable large-cap platform with AI optionality.",
  },
  {
    ticker: "SMH",
    company: "VanEck Semiconductor ETF",
    portfolioWeightPct: 9.34,
    return1M: 8.3,
    return3M: 60.06,
    return6M: 65.72,
    return12M: 141.24,
    country: "US",
    marketCap: "Large Cap",
    assetType: "ETF",
    theme: "AI / Semiconductors",
    subcategory: "Semiconductors ETF",
    thesis: "Concentrated semiconductor basket.",
  },
  {
    ticker: "NOW",
    company: "ServiceNow",
    portfolioWeightPct: 9.08,
    return1M: 17.35,
    return3M: -10.1,
    return6M: -40.16,
    return12M: -48.34,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Enterprise SaaS",
    thesis: "Enterprise workflow automation platform with durable expansion in AI and agent use cases.",
  },
  {
    ticker: "META",
    company: "Meta Platforms",
    portfolioWeightPct: 8.97,
    return1M: -8.05,
    return3M: -7.61,
    return6M: -12.79,
    return12M: -16.97,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "Internet / AI",
    thesis: "Large-cap platform with AI monetization upside.",
  },
  {
    ticker: "SGOV",
    company: "iShares 0-3 Month Treasury Bond ETF",
    portfolioWeightPct: 8.95,
    country: "US",
    assetType: "ETF",
    theme: "Cash & Equivalents",
    subcategory: "Short-Term Treasury",
    // Cash sleeve — no thesis; role is capital preservation / dry powder, not conviction.
  },
  {
    ticker: "NBIS",
    company: "Nebius Group",
    portfolioWeightPct: 6.32,
    return1M: 12.1,
    return3M: 105.72,
    return6M: 148.27,
    return12M: 393.02,
    country: "International",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "AI / Semiconductors",
    subcategory: "AI / Infrastructure",
    thesis: "Higher-beta AI infrastructure and compute exposure.",
  },
  {
    ticker: "GLDM",
    company: "SPDR Gold MiniShares Trust",
    portfolioWeightPct: 5.86,
    country: "US",
    assetType: "ETF",
    theme: "Real Assets",
    subcategory: "Gold",
    // No thesis yet — position added in the Aug 2026 rebalance, write-up not yet published.
  },
  {
    ticker: "CEG",
    company: "Constellation Energy Corporation",
    portfolioWeightPct: 5.73,
    country: "US",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "Energy / Power",
    subcategory: "Nuclear / Power Generation",
    // No thesis yet for this holding. NOTE: data/positionDetails.ts already has
    // a CEG entry (whyIOwnIt/whyThisSleeve/bull-base-bear/risks) written when
    // CEG was a candidate for the dormant Individual Brokerage sleeve — that
    // content is framed for a different account and hasn't been reviewed for
    // this holding, so /positions/CEG is intentionally left unlinked from this
    // account's views for now (see components/InvestmentSection.tsx). Flagged
    // for a decision, not resolved here.
  },
  {
    ticker: "MELI",
    company: "MercadoLibre",
    portfolioWeightPct: 5.7,
    return1M: 1.77,
    return3M: -4.81,
    return6M: -19.34,
    return12M: -32.98,
    country: "Latin America",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "Platform Tech",
    subcategory: "E-commerce / Fintech",
    thesis: "Latin American platform and payments compounder.",
  },
  {
    ticker: "MA",
    company: "Mastercard Incorporated",
    portfolioWeightPct: 5.13,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Financials / Payments",
    subcategory: "Payment Networks",
    // No thesis yet — position added in the Aug 2026 rebalance, write-up not yet published.
  },
  {
    ticker: "UNH",
    company: "UnitedHealth",
    portfolioWeightPct: 4.64,
    return1M: 1.83,
    return3M: 44.82,
    return6M: 24.41,
    return12M: 30.3,
    country: "US",
    marketCap: "Mega Cap",
    assetType: "Equity",
    theme: "Healthcare",
    subcategory: "Healthcare",
    thesis: "Defensive large-cap healthcare compounder.",
  },
  {
    ticker: "RKLB",
    company: "Rocket Lab",
    portfolioWeightPct: 3.44,
    return1M: -17.53,
    return3M: 49.67,
    return6M: 78.01,
    return12M: 302.95,
    country: "US",
    marketCap: "Mid Cap",
    assetType: "Equity",
    theme: "Space / Defense",
    subcategory: "Space",
    thesis: "Space launch and infrastructure exposure.",
  },
  {
    ticker: "OSCR",
    company: "Oscar Health",
    portfolioWeightPct: 2.89,
    country: "US",
    marketCap: "Small Cap",
    assetType: "Equity",
    theme: "Healthcare",
    subcategory: "Health Insurance",
    // No thesis yet — position added in the Aug 2026 rebalance, write-up not yet published.
  },
  {
    ticker: "CBRS",
    company: "Cerebras Systems",
    portfolioWeightPct: 1.93,
    country: "US",
    marketCap: "Large Cap",
    assetType: "Equity",
    theme: "AI / Semiconductors",
    subcategory: "AI Compute / Chips",
    // No thesis yet — position added in the Aug 2026 rebalance, write-up not yet published.
  },
  {
    ticker: "ASTS",
    company: "AST SpaceMobile",
    portfolioWeightPct: 1.59,
    return1M: 10.16,
    return3M: -4.55,
    return6M: 4.25,
    return12M: 114.78,
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
