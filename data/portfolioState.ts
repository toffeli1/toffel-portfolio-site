// ─── Canonical current portfolio state ────────────────────────────────────────
// THE source of truth for "what is held right now and at what weight".
//
// Read from data/toffel_investments_public.json so there is exactly one editable
// weight list in the repo. Update that JSON and every surface follows:
// Investments, thesis-page headers, Performance's current book, allocation views.
//
// Deliberately NOT derived from the Decision Log. The Decision Log is history;
// this is state. Rebuilding state by replaying history would let a missing or
// mis-dated log entry silently corrupt the live portfolio — see AGENTS/AUDIT
// notes on the drift that happened when two weight lists coexisted.
//
// PRIVACY: percentages only. Share counts and dollar cost basis for this
// snapshot live in the gitignored data/positionSnapshot.local.json and must
// never be imported into committed code — this repo is public, and a share
// count beside any public price reconstructs the position size.

import raw from "./toffel_investments_public.json";
import { activeCompanies, companyName, getCompany } from "./companies";

export interface PortfolioPosition {
  ticker: string;
  name: string;
  weightPct: number;
}

export interface PortfolioState {
  account: string;
  /** Snapshot date of these weights, "YYYY-MM-DD". */
  asOf: string;
  positions: PortfolioPosition[];
  /** Residual settled cash, as a % of book. Kept as a percentage, never a $. */
  residualCashPct: number;
}

interface RawHolding {
  ticker: string;
  weight_pct: number;
}

const rawDoc = raw as { account: string; as_of: string; holdings: RawHolding[] };

// Residual cash was $0.75 against a ~$30.8k book on the 2026-08-20 statement —
// under half a basis point. Recorded as a rounded percentage so the dollar
// figure stays out of the public repo.
const RESIDUAL_CASH_PCT = 0.0;

export const portfolioState: PortfolioState = {
  account: rawDoc.account,
  asOf: rawDoc.as_of,
  residualCashPct: RESIDUAL_CASH_PCT,
  positions: [...rawDoc.holdings]
    .sort((a, b) => b.weight_pct - a.weight_pct)
    .map((h) => ({
      ticker: h.ticker,
      name: companyName(h.ticker),
      weightPct: h.weight_pct,
    })),
};

// ── Integrity guards ─────────────────────────────────────────────────────────
// These run at module load, so a bad edit fails `next build` rather than
// silently shipping a wrong portfolio.

const stateTickers = new Set(portfolioState.positions.map((p) => p.ticker));
const registryActive = new Set(activeCompanies().map((c) => c.ticker));

const missingFromRegistry = [...stateTickers].filter((t) => !registryActive.has(t));
const missingFromState = [...registryActive].filter((t) => !stateTickers.has(t));

if (missingFromRegistry.length || missingFromState.length) {
  throw new Error(
    "[portfolioState] active-set mismatch between toffel_investments_public.json and " +
      "data/companies.ts. " +
      `In weights but not registered active: [${missingFromRegistry.join(", ")}]. ` +
      `Registered active but missing weights: [${missingFromState.join(", ")}].`
  );
}

for (const p of portfolioState.positions) {
  const c = getCompany(p.ticker);
  if (c && c.status !== "active") {
    throw new Error(
      `[portfolioState] ${p.ticker} carries a weight but is marked "${c.status}" in ` +
        "data/companies.ts — an exited position must not appear as a current holding."
    );
  }
}

// ── Derived helpers ──────────────────────────────────────────────────────────

export const activePositionCount = portfolioState.positions.length;

/** Sum of position weights. Expected ~100 (the snapshot rounds to 99.99). */
export function totalWeightPct(): number {
  return portfolioState.positions.reduce((s, p) => s + p.weightPct, 0);
}

export function weightFor(ticker: string): number | undefined {
  return portfolioState.positions.find((p) => p.ticker === ticker.toUpperCase())?.weightPct;
}

/** Positions grouped by theme, heaviest theme first — for allocation views. */
export function weightByTheme(): { theme: string; weightPct: number }[] {
  const totals = new Map<string, number>();
  for (const p of portfolioState.positions) {
    const theme = getCompany(p.ticker)?.theme ?? "Unclassified";
    totals.set(theme, (totals.get(theme) ?? 0) + p.weightPct);
  }
  return [...totals.entries()]
    .map(([theme, weightPct]) => ({ theme, weightPct }))
    .sort((a, b) => b.weightPct - a.weightPct);
}
