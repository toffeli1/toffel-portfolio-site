// ─── Public-safe Investments account performance snapshot ────────────────────
// Percentages only — weights, unrealized returns, and money-weighted IRR vs a
// VOO benchmark. No dollar amounts, balances, or contribution figures, ever.
// Update by replacing data/toffel_investments_public.json and redeploying.

import raw from "./toffel_investments_public.json";

export interface InvestmentPublicHolding {
  ticker: string;
  weight_pct: number;
  unrealized_return_pct: number;
}

export interface InvestmentPublicPerformance {
  irr_since_inception_pct: number;
  voo_benchmark_irr_pct: number;
  /** Raw return spread (account IRR minus VOO IRR), in points. Not risk-adjusted — never call this "alpha". */
  excess_vs_benchmark_pts: number;
}

export interface InvestmentPublicData {
  account: string;
  as_of: string;
  note: string;
  performance: InvestmentPublicPerformance;
  holdings: InvestmentPublicHolding[];
}

const data = raw as InvestmentPublicData;

export const investmentPublicData: InvestmentPublicData = {
  ...data,
  holdings: [...data.holdings].sort((a, b) => b.weight_pct - a.weight_pct),
};
