import test from "node:test";
import assert from "node:assert/strict";
import { assertRothOnly, stripAccountProvenance } from "../lib/reconstruction/accountGuard";
import { normalizeToSession } from "../lib/reconstruction/dates";

// ─── Roth-only source boundary ────────────────────────────────────────────────
// SYNTHETIC IDS ONLY. The real Roth account identifier is private and must never
// appear in a tracked file, this one included.

const ROTH = "TEST-ROTH-0001";
const OTHER = "TEST-BROKERAGE-0002";

const expected = {
  expectedAccountType: "roth",
  expectedAccountId: ROTH,
  expectedRowCount: 3,
};

const row = (over: Record<string, unknown> = {}) => ({
  date: "2026-01-05",
  type: "buy",
  ticker_symbol: "TEST",
  quantity: 1,
  price: 10,
  amount: 10,
  fees: 0,
  account_id: ROTH,
  ...over,
});

const doc = (over: Record<string, unknown> = {}) => ({
  sourceAccountType: "roth",
  sourceAccountId: ROTH,
  sourceRowCount: 3,
  account: "Synthetic Roth IRA",
  transactions: [row(), row(), row()],
  ...over,
});

test("a clean single-account ledger passes and reports one owning account", () => {
  const audit = assertRothOnly(doc(), expected);
  assert.equal(audit.owningAccountIds, 1);
  assert.equal(audit.foreignRows, 0);
  assert.equal(audit.rowCount, 3);
  assert.equal(audit.accountType, "roth");
});

test("a SECOND owning account id makes reconstruction fail", () => {
  const mixed = doc({ transactions: [row(), row(), row({ account_id: OTHER })] });
  assert.throws(() => assertRothOnly(mixed, expected), /distinct owning account ids/);
});

test("relabelling the top level cannot bypass the guard", () => {
  // Every row belongs to a foreign account; only the label says Roth. This is
  // exactly the case a label-only check would wave through.
  const relabelled = doc({
    account: "Robinhood Roth IRA",
    sourceAccountType: "roth",
    transactions: [row({ account_id: OTHER }), row({ account_id: OTHER }), row({ account_id: OTHER })],
  });
  assert.throws(() => assertRothOnly(relabelled, expected), /belong to an account other than/);
});

test("a non-Roth source type is refused outright", () => {
  assert.throws(
    () => assertRothOnly(doc({ sourceAccountType: "individual" }), expected),
    /expected "roth"/
  );
});

test("rows with no owning account id are refused rather than assumed", () => {
  const anon = doc({ transactions: [row(), row(), row({ account_id: undefined })] });
  assert.throws(() => assertRothOnly(anon, expected), /no owning account_id/);
});

test("counterparty account numbers in contribution descriptions are not owners", () => {
  // Capital moving INTO the Roth names the funding account in prose. That is a
  // counterparty, not a second owner, and must not trip the guard.
  const withContributions = doc({
    transactions: [
      row(),
      row({
        type: "transfer",
        ticker_symbol: null,
        name: "Contribution from Individual Brokerage ending in 7788",
        amount: -500,
      }),
      row({
        type: "transfer",
        ticker_symbol: null,
        name: "Contribution from Joint Checking ending in 4412",
        amount: -250,
      }),
    ],
  });
  const audit = assertRothOnly(withContributions, expected);
  assert.equal(audit.owningAccountIds, 1, "counterparties must not count as owners");
  assert.equal(audit.foreignRows, 0);
  assert.equal(audit.counterpartyRefs, 2, "both funding sources should be observed, not owned");
});

test("a row count that disagrees with the source header fails", () => {
  assert.throws(
    () => assertRothOnly(doc({ sourceRowCount: 4 }), expected),
    /does not match 3 rows/
  );
});

test("stripAccountProvenance removes every account field", () => {
  const stripped = stripAccountProvenance(row({ account: "Synthetic Roth IRA" }));
  for (const k of ["account_id", "accountId", "account", "account_name"]) {
    assert.ok(!(k in stripped), `${k} must not survive into a public artifact`);
  }
  assert.equal(stripped.ticker_symbol, "TEST", "non-account fields survive");
});

// ─── Session normalization ────────────────────────────────────────────────────
// A weekend or holiday timestamp must resolve to the NEXT exchange session
// before anything consumes it, so every surface agrees on one start date.

const SESSIONS = [
  "2026-08-13", // Thu
  "2026-08-14", // Fri
  "2026-08-17", // Mon
  "2026-08-18", // Tue
];

test("a Saturday timestamp rolls forward to Monday", () => {
  assert.equal(normalizeToSession("2026-08-15", SESSIONS), "2026-08-17");
});

test("a Sunday timestamp rolls forward to the same Monday", () => {
  assert.equal(normalizeToSession("2026-08-16", SESSIONS), "2026-08-17");
});

test("a real session is left untouched", () => {
  assert.equal(normalizeToSession("2026-08-14", SESSIONS), "2026-08-14");
  assert.equal(normalizeToSession("2026-08-17", SESSIONS), "2026-08-17");
});

test("normalization never rolls backwards", () => {
  for (const d of ["2026-08-13", "2026-08-15", "2026-08-16", "2026-08-17"]) {
    assert.ok(normalizeToSession(d, SESSIONS) >= d);
  }
});
