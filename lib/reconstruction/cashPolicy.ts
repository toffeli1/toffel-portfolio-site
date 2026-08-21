// ─── Cash policy ──────────────────────────────────────────────────────────────
// APPROVED DECISION. Cash is a RESIDUAL, not a reconstruction output.
//
//   cash = authoritative portfolio value − reconstructed securities value
//
// Rationale: the investment-transaction export does not completely represent
// cash/cash-equivalent account bookkeeping. Reconstructing cash from the ledger
// produced a persistent residual against authoritative statements at every checkpoint. Rather than invent transfers to
// explain it, the residual IS the cash figure.
//
// Consequences, deliberately:
//   - Security positions still come from the ledger + historical prices, and
//     they must still reconcile. A securities mismatch is a real error.
//   - A residual of either sign is accepted without investigation.
//   - Authoritative NAV is never overridden by transaction-derived cash.
//   - No transfer, deposit, withdrawal or balancing trade is ever fabricated.

/** Cash implied by an authoritative account value. */
export function residualCash(
  authoritativeNav: number,
  reconstructedSecurities: number
): number {
  return authoritativeNav - reconstructedSecurities;
}

/**
 * PUBLIC WEIGHT DENOMINATOR — securities only.
 *
 * Weights on the Investments page and in the Decision Log divide by the market
 * value of holdings, EXCLUDING residual cash, so bookkeeping noise can never
 * move a displayed security weight. This matches the basis of the published holdings
 * snapshot and keeps every public surface consistent with it.
 */
export function securitiesOnlyWeightPct(
  positionValue: number,
  securitiesValue: number
): number | undefined {
  if (!(securitiesValue > 0)) return undefined;
  return (positionValue / securitiesValue) * 100;
}
