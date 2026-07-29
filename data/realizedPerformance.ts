// ─── Public-safe realized-performance summary ─────────────────────────────────
// Percentages and ticker names only — no dollar amounts, share counts, or
// account values, ever. Update by replacing data/toffel_realized_public.json
// and redeploying.
//
// Unreferenced as of the Modified-Dietz performance rebuild: /performance now
// computes hit rate, drawdown, and risk stats from data/performanceDerived.json
// (lib/perf.ts) instead. Left in place, unused, in case this closed-position
// hit-rate/concentration view is wanted again later.

import raw from "./toffel_realized_public.json";

export interface RealizedPublicData {
  as_of: string;
  note: string;
  closed_positions_count: number;
  hit_rate_pct: number;
  top1_contributor_ticker: string;
  top1_share_pct: number;
  top3_tickers: string[];
  top3_share_pct: number;
}

export const realizedPublicData: RealizedPublicData = raw as RealizedPublicData;
