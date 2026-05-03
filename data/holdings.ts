// ─── Edit this file to update holdings, weights, or thesis notes ────────────

export type Category = 'ETFs' | 'Equities';

export type Subcategory =
  | 'Large-Cap Growth ETF'
  | 'Broad Market ETF'
  | 'Semiconductors ETF'
  | 'Bitcoin ETF'
  | 'Semiconductor Equity';

export interface Purchase {
  costBasis: number;    // per-share average cost
  shares: number;
  totalInvested: number;
  date?: number;        // unix timestamp (optional)
}

export interface Holding {
  ticker: string;
  company: string;
  portfolioPct: number;
  category: Category;
  subcategory: Subcategory;
  thesis: string;
  /** Explicit entry / average cost per share for this holding (numeric). */
  entryPrice?: number;
  /** Set to false to suppress live market data for this holding. Defaults to true. */
  livePricing?: boolean;
  purchase?: Purchase;
  confirmedPurchaseDate?: string;
  estimatedPurchaseDate?: string;
  estimatedEntryPrice?: number;
  purchaseDateSource?: "confirmed" | "estimated" | "unknown";
}

// Weights are placeholder equal-weight (20% each) pending exact account weights.
export const holdings: Holding[] = [
  // ─── ETFs (80%) ──────────────────────────────────────────────────────────────
  {
    ticker: 'QQQM',
    company: 'Invesco Nasdaq-100 ETF',
    portfolioPct: 22.68,
    category: 'ETFs',
    subcategory: 'Large-Cap Growth ETF',
    thesis: 'Nasdaq / large-cap growth exposure.',
  },
  {
    ticker: 'SMH',
    company: 'VanEck Semiconductor ETF',
    portfolioPct: 19.70,
    category: 'ETFs',
    subcategory: 'Semiconductors ETF',
    thesis: 'Broad semiconductor cycle / AI infrastructure exposure.',
  },
  {
    ticker: 'VOO',
    company: 'Vanguard S&P 500 ETF',
    portfolioPct: 35.96,
    category: 'ETFs',
    subcategory: 'Broad Market ETF',
    thesis: 'Core U.S. equity market exposure.',
  },
  {
    ticker: 'FBTC',
    company: 'Fidelity Wise Origin Bitcoin Fund',
    portfolioPct: 15.78,
    category: 'ETFs',
    subcategory: 'Bitcoin ETF',
    thesis: 'Bitcoin exposure through ETF structure.',
  },
  // ─── Equities (20%) ──────────────────────────────────────────────────────────
  {
    ticker: 'MU',
    company: 'Micron Technology',
    portfolioPct: 5.89,
    category: 'Equities',
    subcategory: 'Semiconductor Equity',
    entryPrice: 300,
    thesis: 'Memory cycle recovery and AI-related DRAM/HBM demand.',
  },
];

// ─── Category-level summary ───────────────────────────────────────────────────
export const categoryAllocations: {
  category: Category;
  pct: number;
  color: string;
  description: string;
}[] = [
  {
    category: 'ETFs',
    pct: 80,
    color: '#1a3a5c',
    description: 'Broad-market, thematic, and digital asset ETF exposure.',
  },
  {
    category: 'Equities',
    pct: 20,
    color: '#1a4a2e',
    description: 'High-conviction individual equity positions.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getHoldingsByCategory(category: Category): Holding[] {
  return holdings.filter((h) => h.category === category);
}
