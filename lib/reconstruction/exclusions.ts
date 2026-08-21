// ─── Public presentation exclusions ───────────────────────────────────────────
// Tickers the owner has directed be excluded from every PUBLIC surface:
// Investments, thesis routes, the Decision Log, Historical Positions, lifecycle
// events and holding analytics.
//
// IMPORTANT — this is a presentation exclusion, not a ledger edit. The
// underlying transactions still flow through the cash and NAV reconstruction,
// because they really did move cash in the account. Dropping them from the
// arithmetic would break the account reconciliation and misstate portfolio-level
// TWR, which is derived from total NAV. So: the money is still counted, the
// name is simply never named.
//
// Enforced on the way out by tests/privacy.test.ts, so a regenerated artifact
// cannot quietly reintroduce one.

export const PUBLIC_EXCLUDED_TICKERS: ReadonlySet<string> = new Set(["DLO"]);

export function isPubliclyExcluded(ticker: string | undefined): boolean {
  return ticker ? PUBLIC_EXCLUDED_TICKERS.has(ticker.toUpperCase()) : false;
}
