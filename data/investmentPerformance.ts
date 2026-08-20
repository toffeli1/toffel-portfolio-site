// ─── Public-safe Investments account holdings snapshot ────────────────────────
// Percentages only — weights and unrealized returns. No dollar amounts,
// balances, or contribution figures, ever. Update by replacing
// data/toffel_investments_public.json and redeploying.
//
// Money-weighted IRR previously lived here; performance KPIs now live on
// /performance, computed from a time-weighted (Modified Dietz) methodology —
// see lib/perf.ts and data/performanceDerived.json.

import raw from "./toffel_investments_public.json";

export interface InvestmentPublicHolding {
  ticker: string;
  weight_pct: number;
  /** Omitted when unrealized return can't be verified against current cost
   *  basis (e.g. right after a rebalance) — render the column only when at
   *  least one holding has this set, rather than showing stale or invented
   *  figures. */
  unrealized_return_pct?: number;
}

export interface InvestmentPublicData {
  account: string;
  as_of: string;
  note: string;
  holdings: InvestmentPublicHolding[];
}

const data = raw as InvestmentPublicData;

export const investmentPublicData: InvestmentPublicData = {
  ...data,
  holdings: [...data.holdings].sort((a, b) => b.weight_pct - a.weight_pct),
};
