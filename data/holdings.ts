// ─── 2027 Roth Fund (Individual Brokerage funding sleeve) ─────────────────────
// All entries are held in the taxable brokerage account, earmarked for a
// future Roth IRA funding cycle. Privacy: dollar values may be stored here
// for internal calculation but never rendered publicly.

export type Category = 'ETFs' | 'Equities';

export type Subcategory =
  | 'Large-Cap Growth ETF'
  | 'Broad Market ETF'
  | 'Semiconductors ETF'
  | 'Bitcoin ETF'
  | 'Quantum / Emerging Tech ETF'
  | 'Semiconductor Equity';

export interface Purchase {
  costBasis: number;
  shares: number;
  totalInvested: number;
  date?: number;
}

export interface Holding {
  /** Stable sleeve-scoped key for cross-sleeve disambiguation (e.g. VOO_2027_ROTH_FUND). */
  sourceKey: string;
  ticker: string;
  company: string;
  /** Funding sleeve label rendered in the box header / position-page sleeve row. */
  sleeve: string;
  /** Public-safe weight % within this sleeve. */
  portfolioPct: number;
  shares: number;
  /** Internal only. Used for derivation; never rendered publicly. */
  averageCost: number;
  returnPct: number;
  /** YYYY-MM-DD — shown publicly in the holdings box. */
  purchaseDate: string;
  category: Category;
  subcategory: Subcategory;
  thesis: string;
  // ── Legacy optional fields kept for compatibility with unrelated consumers ──
  entryPrice?: number;
  livePricing?: boolean;
  purchase?: Purchase;
  confirmedPurchaseDate?: string;
  estimatedPurchaseDate?: string;
  estimatedEntryPrice?: number;
  purchaseDateSource?: "confirmed" | "estimated" | "unknown";
}

export const holdings: Holding[] = [
  {
    sourceKey: 'QQQM_2027_ROTH_FUND',
    ticker: 'QQQM',
    company: 'Invesco NASDAQ 100 ETF',
    sleeve: '2027 Roth Fund',
    portfolioPct: 12.28,
    shares: 3,
    averageCost: 229.17,
    returnPct: 31.51,
    purchaseDate: '2025-08-01',
    category: 'ETFs',
    subcategory: 'Large-Cap Growth ETF',
    thesis: 'Nasdaq / large-cap growth exposure.',
  },
  {
    sourceKey: 'SMH_2027_ROTH_FUND',
    ticker: 'SMH',
    company: 'VanEck Semiconductor ETF',
    sleeve: '2027 Roth Fund',
    portfolioPct: 29.52,
    shares: 3.56071,
    averageCost: 286.74,
    returnPct: 113.08,
    purchaseDate: '2025-08-01',
    category: 'ETFs',
    subcategory: 'Semiconductors ETF',
    thesis: 'Broad semiconductor cycle / AI infrastructure exposure.',
  },
  {
    sourceKey: 'VOO_2027_ROTH_FUND',
    ticker: 'VOO',
    company: 'Vanguard S&P 500 ETF',
    sleeve: '2027 Roth Fund',
    portfolioPct: 47.01,
    shares: 5,
    averageCost: 573.84,
    returnPct: 20.75,
    purchaseDate: '2025-08-01',
    category: 'ETFs',
    subcategory: 'Broad Market ETF',
    thesis: 'Core U.S. equity market exposure.',
  },
  {
    sourceKey: 'FBTC_2027_ROTH_FUND',
    ticker: 'FBTC',
    company: 'Fidelity Wise Origin Bitcoin Fund',
    sleeve: '2027 Roth Fund',
    portfolioPct: 6.83,
    shares: 9.27927,
    averageCost: 89.75,
    returnPct: -39.58,
    purchaseDate: '2025-08-01',
    category: 'ETFs',
    subcategory: 'Bitcoin ETF',
    thesis: 'Bitcoin exposure through ETF structure.',
  },
  {
    sourceKey: 'QTUM_2027_ROTH_FUND',
    ticker: 'QTUM',
    company: 'Defiance Quantum ETF',
    sleeve: '2027 Roth Fund',
    portfolioPct: 4.35,
    shares: 1.967597,
    averageCost: 141.80,
    returnPct: 15.01,
    purchaseDate: '2025-05-07',
    category: 'ETFs',
    subcategory: 'Quantum / Emerging Tech ETF',
    thesis: 'Quantum computing and emerging compute exposure.',
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
    pct: 100,
    color: '#1a3a5c',
    description: 'Broad-market, thematic, and digital asset ETF exposure.',
  },
  {
    category: 'Equities',
    pct: 0,
    color: '#1a4a2e',
    description: 'High-conviction individual equity positions.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getHoldingsByCategory(category: Category): Holding[] {
  return holdings.filter((h) => h.category === category);
}
