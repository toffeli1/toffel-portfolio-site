// ─── Performance page "current book" — derived, not duplicated ───────────────
// This module holds no position data of its own. Weight and "is currently
// held" come from data/investmentPerformance.ts (the same canonical holdings
// that drive the account page's table) — that file is the single source of
// truth for what's held and at what weight. Name/theme/asset-type are looked
// up from data/sleeveHoldings.ts, which already maintains that metadata for
// every ticker this account has held. Neither source carries a dollar figure;
// this module only ever maps ticker/name/weight%/theme/href through.
//
// Editing data/toffel_investments_public.json (add/remove/reweight a
// holding) is the one edit that updates both the account page and this
// "current book" — there is no second list to keep in sync.

import { investmentPublicData } from "./investmentPerformance";
import { rothIraHoldings } from "./sleeveHoldings";
import { etfProfiles } from "./etfConstituents";

export interface PerformanceHoldingPosition {
  ticker: string;
  name: string;
  weightPct: number;
  theme: string;
  /** "Equity" positions are subject to the single-name concentration cap;
   *  ETFs/funds and crypto-linked ETFs are baskets and are exempt. */
  assetType: string;
  href: string;
}

export interface PerformanceHoldingsData {
  asOf: string;
  asOfNote: string;
  positions: PerformanceHoldingPosition[];
}

function metadataFor(ticker: string): { name: string; theme: string; assetType: string } {
  const meta = rothIraHoldings.find((h) => h.ticker === ticker);
  return {
    name: meta?.company ?? ticker,
    theme: meta?.theme ?? "Other",
    assetType: meta?.assetType ?? "Equity",
  };
}

function hrefFor(ticker: string): string {
  return ticker in etfProfiles ? `/etfs/${ticker}` : `/positions/${ticker}`;
}

export const performanceHoldings: PerformanceHoldingsData = {
  asOf: investmentPublicData.as_of,
  asOfNote: "Matches the account page's reconciled holdings — see /portfolio/investments.",
  positions: investmentPublicData.holdings.map((h) => {
    const meta = metadataFor(h.ticker);
    return {
      ticker: h.ticker,
      name: meta.name,
      weightPct: h.weight_pct,
      theme: meta.theme,
      assetType: meta.assetType,
      href: hrefFor(h.ticker),
    };
  }),
};

/** Positions above this weight are flagged — matches the stated internal
 *  single-name cap. Applies to single-company ("Equity") positions only;
 *  broad funds/ETFs and crypto-linked ETFs are baskets, not single names,
 *  so single-name concentration risk doesn't apply to them. */
export const CONCENTRATION_CAP_PCT = 10.0;

export function isFlaggedConcentration(p: PerformanceHoldingPosition): boolean {
  if (p.assetType !== "Equity") return false;
  return p.weightPct > CONCENTRATION_CAP_PCT;
}
