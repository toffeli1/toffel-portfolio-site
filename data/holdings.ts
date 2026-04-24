// ─── Edit this file to update holdings, weights, or thesis notes ────────────

export type Category = 'AI' | 'Defense / Drone' | 'Energy';

export type Subcategory =
  | 'Hardware / Compute'
  | 'Photonics / Optical Networking'
  | 'Lasers / Components'
  | 'AI Infrastructure / Supporting Systems'
  | 'Drone / UAV Systems'
  | 'Traditional Energy'
  | 'Nuclear'
  | 'Uranium'
  | 'Grid / Power Infrastructure'
  | 'Nuclear / Power Infrastructure';

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
  // ── Entry date / price ────────────────────────────────────────────────────
  /** Confirmed purchase date "YYYY-MM-DD" — shows as solid "Entry" marker */
  confirmedPurchaseDate?: string;
  /** ISO date override for estimated entry when auto-detection is wrong */
  estimatedPurchaseDate?: string;
  /** Implied entry price; chart finds closest historical date when set */
  estimatedEntryPrice?: number;
  purchaseDateSource?: "confirmed" | "estimated" | "unknown";
}

export const holdings: Holding[] = [
  // ─── AI (60%) ────────────────────────────────────────────────────────────────
  {
    ticker: 'MRVL',
    company: 'Marvell Technology',
    portfolioPct: 10.0,
    category: 'AI',
    subcategory: 'Hardware / Compute',
    entryPrice: 127.3,
    thesis:
      'Custom silicon and networking ASICs driving AI data center buildout; strong hyperscaler design-win pipeline.',
  },
  {
    ticker: 'POET',
    company: 'POET Technologies',
    portfolioPct: 8.0,
    category: 'AI',
    subcategory: 'Photonics / Optical Networking',
    entryPrice: 12.0,
    thesis:
      'Optical interposer platform enabling co-packaged photonics for AI cluster connectivity; asset-light licensing model with Tier 1 design-in momentum at 800G/1.6T.',
  },
  {
    ticker: 'MU',
    company: 'Micron Technology',
    portfolioPct: 7.5,
    category: 'AI',
    subcategory: 'Hardware / Compute',
    entryPrice: 326.2,
    thesis:
      'High-bandwidth memory (HBM3E) supplying AI accelerator demand; only U.S.-headquartered HBM supplier.',
  },
  {
    ticker: 'LITE',
    company: 'Lumentum Holdings',
    portfolioPct: 6.5,
    category: 'AI',
    subcategory: 'Lasers / Components',
    entryPrice: 848.7,
    thesis:
      'Laser components for optical networking and 3D sensing; beneficiary of AI-driven photonics demand cycle.',
  },
  {
    ticker: 'ALAB',
    company: 'Astera Labs',
    portfolioPct: 6.5,
    category: 'AI',
    subcategory: 'AI Infrastructure / Supporting Systems',
    entryPrice: 200.0,
    thesis:
      'PCIe and CXL connectivity fabric enabling low-latency communication within AI training clusters.',
  },
  {
    ticker: 'AMKR',
    company: 'Amkor Technology',
    portfolioPct: 6.5,
    category: 'AI',
    subcategory: 'Hardware / Compute',
    entryPrice: 75.5,
    thesis:
      'Advanced packaging (CoWoS, SoIC) enabling chiplet-based AI silicon; key position in TSMC supply chain.',
  },
  {
    ticker: 'VRT',
    company: 'Vertiv Holdings',
    portfolioPct: 5.0,
    category: 'AI',
    subcategory: 'AI Infrastructure / Supporting Systems',
    entryPrice: 320.7,
    thesis:
      'Power and thermal management infrastructure for hyperscale AI data centers; multi-year backlog visibility.',
  },
  {
    ticker: 'CRWV',
    company: 'CoreWeave',
    portfolioPct: 5.0,
    category: 'AI',
    subcategory: 'AI Infrastructure / Supporting Systems',
    entryPrice: 115.6,
    thesis:
      'Purpose-built GPU cloud for AI training and inference; strong hyperscaler and enterprise contract pipeline.',
  },
  {
    ticker: 'PLAB',
    company: 'Photronics',
    portfolioPct: 5.0,
    category: 'AI',
    subcategory: 'AI Infrastructure / Supporting Systems',
    entryPrice: 51.4,
    thesis:
      'Photomask manufacturing underpinning advanced-node semiconductor production; oligopolistic market structure.',
  },

  // ─── Defense / Drone (20%) ───────────────────────────────────────────────────
  {
    ticker: 'AVEX',
    company: 'AEVEX Corp',
    portfolioPct: 20.0,
    category: 'Defense / Drone',
    subcategory: 'Drone / UAV Systems',
    thesis:
      'Concentrated position in autonomous unmanned aerial systems for defense applications.',
    purchase: {
      costBasis: 37.56,
      shares: 10.65,
      totalInvested: 400,
    },
    entryPrice: 37.0,
  },

  // ─── Energy (20%) ────────────────────────────────────────────────────────────
  {
    ticker: 'COP',
    company: 'ConocoPhillips',
    portfolioPct: 5.0,
    category: 'Energy',
    subcategory: 'Traditional Energy',
    entryPrice: 122.6,
    thesis:
      'Large-cap E&P with strong free cash flow generation and disciplined capital allocation through the cycle.',
  },
  {
    ticker: 'BWXT',
    company: 'BWX Technologies',
    portfolioPct: 5.0,
    category: 'Energy',
    subcategory: 'Nuclear',
    entryPrice: 267.7,
    thesis:
      'Nuclear components and propulsion systems for U.S. government; long-cycle contract visibility.',
  },
  {
    ticker: 'CCJ',
    company: 'Cameco Corporation',
    portfolioPct: 5.0,
    category: 'Energy',
    subcategory: 'Uranium',
    entryPrice: 123.9,
    thesis:
      'Leading uranium miner positioned for the nuclear renaissance; multi-decade supply agreements in place.',
  },
  {
    ticker: 'CEG',
    company: 'Constellation Energy',
    portfolioPct: 5.0,
    category: 'Energy',
    subcategory: 'Nuclear / Power Infrastructure',
    entryPrice: 294.3,
    thesis:
      'Largest US nuclear operator capturing premium pricing from AI data center clean power demand; long-term PPAs with hyperscalers underpin durable earnings growth.',
  },
];

// ─── Category-level summary (update pct if you add/remove holdings) ───────────
export const categoryAllocations: {
  category: Category;
  pct: number;
  color: string;
  description: string;
}[] = [
  {
    category: 'AI',
    pct: 60,
    color: '#1a3a5c',
    description:
      'Hardware, photonics, and infrastructure enabling the AI buildout across the full stack.',
  },
  {
    category: 'Defense / Drone',
    pct: 20,
    color: '#8b2530',
    description:
      'Autonomous unmanned systems at the intersection of defense modernization and advanced robotics.',
  },
  {
    category: 'Energy',
    pct: 20,
    color: '#1a4a2e',
    description:
      'Traditional and nuclear energy positioned for long-cycle demand driven by AI power requirements.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getHoldingsByCategory(category: Category): Holding[] {
  return holdings.filter((h) => h.category === category);
}
