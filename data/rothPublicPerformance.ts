// ─── Public-safe Roth IRA performance snapshot ────────────────────────────────
// Percentages only — weights, unrealized returns, and money-weighted IRR vs a
// VOO benchmark. No dollar amounts, balances, or contribution figures, ever.
// Update by replacing data/toffel_roth_public.json and redeploying.

import raw from "./toffel_roth_public.json";

export interface RothPublicHolding {
  ticker: string;
  weight_pct: number;
  unrealized_return_pct: number;
}

export interface RothPublicPerformance {
  irr_since_inception_pct: number;
  voo_benchmark_irr_pct: number;
  annualized_alpha_pts: number;
}

export interface RothPublicData {
  account: string;
  as_of: string;
  note: string;
  performance: RothPublicPerformance;
  holdings: RothPublicHolding[];
}

const data = raw as RothPublicData;

export const rothPublicData: RothPublicData = {
  ...data,
  holdings: [...data.holdings].sort((a, b) => b.weight_pct - a.weight_pct),
};
