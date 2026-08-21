// PRIVACY: share counts, entry prices, estimated entry prices and the whole
// `purchase` block (cost basis + share quantities) were REMOVED from this file.
// They were real private position data in a public repo. This sleeve is dormant
// and unpublished, and nothing needed the figures — every live analytic comes
// from the private reconstruction pipeline via percentage-only artifacts.
// Do not re-add quantities, prices or cost basis here.

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

export interface Holding {
  /** Stable sleeve-scoped key for cross-sleeve disambiguation (e.g. VOO_2027_ROTH_FUND). */
  sourceKey: string;
  ticker: string;
  company: string;
  /** Funding sleeve label rendered in the box header / position-page sleeve row. */
  sleeve: string;
  /** Public-safe weight % within this sleeve. */
  portfolioPct: number;
  returnPct: number;
  /** YYYY-MM-DD — shown publicly in the holdings box. */
  purchaseDate: string;
  category: Category;
  subcategory: Subcategory;
  thesis: string;
  // ── Legacy optional fields kept for compatibility with unrelated consumers ──
  livePricing?: boolean;
  confirmedPurchaseDate?: string;
  estimatedPurchaseDate?: string;
  purchaseDateSource?: "confirmed" | "estimated" | "unknown";
}

// PRIVACY: averageCost was removed. It held real per-share cost basis for ten
// positions and this repository is public, so "internal only, never rendered"
// was not a boundary — a tracked file is readable whether or not a page renders
// it. Nothing consumed the field. Percentage returns (returnPct) and weights
// stay, because those are derived and publicly safe.

export const holdings: Holding[] = [
  {
    sourceKey: 'QQQM_2027_ROTH_FUND',
    ticker: 'QQQM',
    company: 'Invesco NASDAQ 100 ETF',
    sleeve: '2027 Roth Fund',
    portfolioPct: 12.28,
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
    returnPct: 15.01,
    purchaseDate: '2025-05-07',
    category: 'ETFs',
    subcategory: 'Quantum / Emerging Tech ETF',
    thesis: 'Quantum computing and emerging compute exposure.',
  },
  // ─── 2028 Roth Fund ────────────────────────────────────────────────────────
  {
    sourceKey: 'MU_2028_ROTH_FUND',
    ticker: 'MU',
    company: 'Micron Technology',
    sleeve: '2028 Roth Fund',
    portfolioPct: 29.73,
    returnPct: 124.55,
    purchaseDate: '2026-05-26',
    category: 'Equities',
    subcategory: 'Semiconductor Equity',
    thesis: 'Memory cycle and AI infrastructure exposure.',
  },
  {
    sourceKey: 'OUST_2028_ROTH_FUND',
    ticker: 'OUST',
    company: 'Ouster',
    sleeve: '2028 Roth Fund',
    portfolioPct: 21.10,
    returnPct: 41.09,
    purchaseDate: '2026-05-18',
    category: 'Equities',
    subcategory: 'Semiconductor Equity',
    thesis: 'Lidar and autonomy infrastructure exposure.',
  },
  {
    sourceKey: 'PENG_2028_ROTH_FUND',
    ticker: 'PENG',
    company: 'Penguin Solutions',
    sleeve: '2028 Roth Fund',
    portfolioPct: 10.78,
    returnPct: 49.51,
    purchaseDate: '2026-05-18',
    category: 'Equities',
    subcategory: 'Semiconductor Equity',
    thesis: 'AI infrastructure and compute deployment exposure.',
  },
  {
    sourceKey: 'NVTS_2028_ROTH_FUND',
    ticker: 'NVTS',
    company: 'Navitas Semiconductor',
    sleeve: '2028 Roth Fund',
    portfolioPct: 11.50,
    returnPct: -6.72,
    purchaseDate: '2026-05-25',
    category: 'Equities',
    subcategory: 'Semiconductor Equity',
    thesis: 'Power semiconductor and electrification exposure.',
  },
  {
    sourceKey: 'FLY_2028_ROTH_FUND',
    ticker: 'FLY',
    company: 'Firefly Aerospace Inc.',
    sleeve: '2028 Roth Fund',
    portfolioPct: 26.60,
    returnPct: -5.73,
    purchaseDate: '2026-06-04',
    category: 'Equities',
    subcategory: 'Semiconductor Equity',
    thesis: 'Space, launch, and defense-adjacent growth exposure.',
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
