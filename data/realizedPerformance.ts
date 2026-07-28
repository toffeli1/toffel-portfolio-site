// ─── Public-safe realized-performance summary ─────────────────────────────────
// Percentages and ticker names only — no dollar amounts, share counts, or
// account values, ever. Update by replacing data/toffel_realized_public.json
// and redeploying.

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
