// ─── Account boundary guard ───────────────────────────────────────────────────
// HARD RULE: every figure on the site is reconstructed from the Robinhood Roth
// IRA and nothing else. No individual brokerage, joint, crypto, checking or
// savings activity may enter Performance, holding returns, Historical Positions,
// Decision Log weights, or initiation/re-entry detection.
//
// WHY A GUARD RATHER THAN A COMMENT
// The ledger's own descriptions reference several account numbers. They are
// COUNTERPARTIES on inbound contributions — capital moving from a brokerage or
// joint account INTO the Roth — not transactions belonging to those accounts.
// That distinction is easy to lose later: a future export that genuinely mixed
// accounts would look almost identical row-by-row. So the boundary is asserted
// mechanically and the pipeline fails rather than silently blending books.
//
// PRIVACY: the Roth account identifier is private. It may appear only in local
// inputs and in this module's runtime checks. It must never be written into a
// committed artifact, which tests/privacy.test.ts enforces.

export interface LedgerDoc {
  /** Private provenance recorded at ingestion. */
  sourceAccountType?: string;
  sourceAccountId?: string;
  sourceRowCount?: number;
  account?: string;
  transactions: Record<string, unknown>[];
}

/** Expected provenance, supplied by the gitignored local config. */
export interface ExpectedAccount {
  expectedAccountType: string;
  expectedAccountId: string;
  expectedRowCount: number;
}

/** The one account type this project may reconstruct from. */
const REQUIRED_TYPE = /^roth$/i;

/**
 * Account descriptors that would indicate a foreign owning account.
 * Counterparty numbers inside contribution descriptions are NOT owners and are
 * deliberately not matched here.
 */
const FOREIGN_ACCOUNT = /\b(individual brokerage|joint|crypto|checking|savings)\b/i;

export interface AccountAudit {
  declaredAccount: string;
  accountType: string;
  rowCount: number;
  /** Distinct OWNING account ids across all rows. Must be 1. */
  owningAccountIds: number;
  /** Rows whose owning account is not the expected Roth id. Must be 0. */
  foreignRows: number;
  /** Counterparty account numbers referenced in descriptions (funding sources). */
  counterpartyRefs: number;
}

/**
 * SOURCE-LEVEL assertion that the ledger is Roth-only.
 *
 * A top-level label alone is not evidence: relabelling a mixed export would pass
 * it. So this verifies the per-row owning `account_id` instead, which is
 * preserved during ingestion and stripped before any public artifact is written.
 *
 * Throws on any violation so a script aborts rather than publishing blended
 * figures.
 */
export function assertRothOnly(doc: LedgerDoc, expected: ExpectedAccount): AccountAudit {
  const rows = doc.transactions ?? [];
  if (rows.length === 0) throw new Error("[accountGuard] ledger has no transactions.");

  if (!REQUIRED_TYPE.test(doc.sourceAccountType ?? "")) {
    throw new Error(
      `[accountGuard] sourceAccountType is "${doc.sourceAccountType ?? "(missing)"}", ` +
        "expected \"roth\". Refusing to reconstruct from a non-Roth or unlabelled export."
    );
  }
  if (doc.sourceAccountType !== expected.expectedAccountType) {
    throw new Error("[accountGuard] account type does not match the expected Roth type.");
  }

  // Per-row owning ids are the real evidence.
  const owners = new Set<string>();
  let missing = 0;
  let foreign = 0;
  const counterparties = new Set<string>();
  for (const r of rows) {
    const id = String(r.account_id ?? r.accountId ?? "");
    if (!id) { missing++; continue; }
    owners.add(id);
    if (id !== expected.expectedAccountId) foreign++;
    const own = String(r.account ?? r.account_name ?? "");
    if (own && FOREIGN_ACCOUNT.test(own)) foreign++;
    for (const m of String(r.name ?? "").matchAll(/ending in (\d{4})/g)) {
      counterparties.add(m[1]);
    }
  }

  if (missing > 0) {
    throw new Error(
      `[accountGuard] ${missing} row(s) carry no owning account_id. The boundary ` +
        "cannot be proven, so reconstruction is refused."
    );
  }
  if (owners.size !== 1) {
    throw new Error(
      `[accountGuard] found ${owners.size} distinct owning account ids; exactly 1 ` +
        "is allowed. The export appears to blend accounts."
    );
  }
  if (foreign > 0) {
    throw new Error(
      `[accountGuard] ${foreign} row(s) belong to an account other than the ` +
        "expected Roth. Reconstruction aborted."
    );
  }
  if (doc.sourceRowCount !== undefined && doc.sourceRowCount !== rows.length) {
    throw new Error(
      `[accountGuard] sourceRowCount ${doc.sourceRowCount} does not match ${rows.length} rows.`
    );
  }
  if (rows.length !== expected.expectedRowCount) {
    throw new Error(
      `[accountGuard] expected ${expected.expectedRowCount} Roth rows, found ${rows.length}.`
    );
  }

  return {
    declaredAccount: doc.account ?? "",
    accountType: doc.sourceAccountType!,
    rowCount: rows.length,
    owningAccountIds: owners.size,
    foreignRows: 0,
    counterpartyRefs: counterparties.size,
  };
}

/** Strip private provenance so it can never reach a public artifact. */
export function stripAccountProvenance<T extends Record<string, unknown>>(row: T): T {
  const { account_id: _a, accountId: _b, account: _c, account_name: _d, ...rest } = row;
  return rest as T;
}
