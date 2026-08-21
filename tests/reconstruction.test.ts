// Reconstruction-engine tests.
//
// These run entirely on SYNTHETIC fixtures — no private data required — so the
// cash conventions, date semantics, NAV invariant and TWR flow-neutrality are
// verified independently of whether the Robinhood ledger is present.

import { test } from "node:test";
import assert from "node:assert/strict";

import { cashEffect, isExternalFlow, HANDLED_KINDS } from "../lib/reconstruction/cashDelta";
import { effectiveDate, easternCalendarDate } from "../lib/reconstruction/dates";
import { classify } from "../lib/reconstruction/classify";
import { reconstruct, weightsAtClose, dailyReturns, linkReturns } from "../lib/reconstruction/engine";
import { asTradedClose, splitFactorAfter } from "../lib/reconstruction/prices";
import type { Transaction, TxKind } from "../lib/reconstruction/types";

const tx = (over: Partial<Transaction> & { kind: TxKind }): Transaction => ({
  postedDate: "2025-07-03",
  effectiveDate: "2025-07-03",
  rawAmount: 0,
  ...over,
});

// ── Cash convention ─────────────────────────────────────────────────────────

test("buy: positive provider amount becomes a cash OUTflow, internal", () => {
  const e = cashEffect(tx({ kind: "buy", rawAmount: 250, quantity: 10, ticker: "OSCR" }));
  assert.equal(e.cashDelta, -250, "cash must decrease on a purchase");
  assert.equal(e.externalFlow, 0, "a buy is internal — never an external flow");
  assert.equal(e.shareDelta, 10);
});

test("sell: negative provider amount becomes a cash INflow, internal", () => {
  const e = cashEffect(tx({ kind: "sell", rawAmount: -400, quantity: 5, ticker: "AMD" }));
  assert.equal(e.cashDelta, 400, "cash must increase on a sale");
  assert.equal(e.externalFlow, 0);
  assert.equal(e.shareDelta, -5);
});

test("contribution: negative provider amount is still capital ENTERING", () => {
  const e = cashEffect(tx({ kind: "contribution", rawAmount: -515 }));
  assert.equal(e.cashDelta, 515, "contribution must increase cash");
  assert.equal(e.externalFlow, 515, "contribution is an external flow");
  assert.equal(e.income, 0, "a contribution is not investment income");
});

test("withdrawal is a negative external flow", () => {
  const e = cashEffect(tx({ kind: "withdrawal", rawAmount: 300 }));
  assert.equal(e.cashDelta, -300);
  assert.equal(e.externalFlow, -300);
});

test("dividend is investment return, not an external flow", () => {
  const e = cashEffect(tx({ kind: "dividend", rawAmount: -12.5, ticker: "VOO" }));
  assert.equal(e.cashDelta, 12.5, "dividend increases cash");
  assert.equal(e.externalFlow, 0, "dividend must NOT be an external flow");
  assert.equal(e.income, 12.5);
});

test("fee reduces cash and is recorded as a drag, not a flow", () => {
  const e = cashEffect(tx({ kind: "fee", rawAmount: 0.03 }));
  assert.ok(Math.abs(e.cashDelta - -0.03) < 1e-9);
  assert.equal(e.externalFlow, 0);
  assert.ok(Math.abs(e.fees - 0.03) < 1e-9);
});

test("in-kind transfer moves shares with no cash movement", () => {
  const e = cashEffect(tx({ kind: "transfer_in_kind", rawAmount: 0, quantity: 7, ticker: "VOO" }));
  assert.ok(Math.abs(e.cashDelta) < 1e-12, "in-kind arrival moves no cash");
  assert.equal(e.shareDelta, 7);
});

test("a split never moves cash and is never an external flow", () => {
  const e = cashEffect(tx({ kind: "split", rawAmount: 0, ticker: "CRWD", splitRatio: 4 }));
  assert.deepEqual(e, { cashDelta: 0, externalFlow: 0, income: 0, fees: 0, shareDelta: 0 });
});

test("every handled kind has a defined effect", () => {
  for (const kind of HANDLED_KINDS) {
    const e = cashEffect(tx({ kind, rawAmount: 100, quantity: 1, ticker: "X", splitRatio: 2 }));
    for (const v of Object.values(e)) assert.ok(Number.isFinite(v), `${kind} produced a non-finite value`);
  }
});

test("external-flow classification covers exactly the external kinds", () => {
  for (const k of ["contribution", "withdrawal", "transfer_in_cash", "transfer_out_cash", "transfer_in_kind", "transfer_out_kind"] as TxKind[]) {
    assert.equal(isExternalFlow(k), true, `${k} should be external`);
  }
  for (const k of ["buy", "sell", "dividend", "interest", "fee", "tax", "split"] as TxKind[]) {
    assert.equal(isExternalFlow(k), false, `${k} must NOT be external`);
  }
});

// ── Date semantics ──────────────────────────────────────────────────────────

test("trade uses execution date, not settlement date", () => {
  // The specified OSCR case: executed July 3, settled July 7.
  const d = effectiveDate({
    postedDate: "2025-07-07",
    transactionDatetime: "2025-07-03T14:32:00-04:00",
    isTrade: true,
  });
  assert.equal(d, "2025-07-03", "a July 3 execution must be dated July 3");
});

test("late-afternoon Eastern execution does not roll to the next day", () => {
  // 16:05 ET is 20:05 UTC — naive UTC parsing keeps it on the 3rd, but a
  // 21:00 ET timestamp would be the 4th in UTC. Verify ET is respected.
  assert.equal(easternCalendarDate("2025-07-03T21:30:00Z"), "2025-07-03");
});

test("external cash flow uses posted date", () => {
  const d = effectiveDate({
    postedDate: "2025-07-15",
    transactionDatetime: "2025-07-11T09:00:00-04:00",
    isTrade: false,
  });
  assert.equal(d, "2025-07-15", "cash flows are dated when they post");
});

test("opening in-kind transfer is pinned to inception", () => {
  const d = effectiveDate({
    postedDate: "2025-07-01",
    transactionDatetime: "2025-06-27T10:00:00-04:00",
    isTrade: false,
    isOpeningInKind: true,
    inceptionDate: "2025-07-03",
  });
  assert.equal(d, "2025-07-03");
});

test("classifier dispatches on the provider type column", () => {
  assert.equal(classify("buy", "market buy of Example Corp", "buy"), "buy");
  assert.equal(classify("sell", "market sell of Example Corp", "sell"), "sell");
  assert.equal(classify("cash", "Cash dividend from a holding", "dividend"), "dividend");
  assert.equal(classify("transfer", "Contribution from a linked brokerage account", "transfer", false, 0), "contribution");
  assert.equal(classify("transfer", "ACH deposit into the retirement account", "transfer", false, 0), "contribution");
  assert.equal(classify("transfer", "Completed incoming residual transfer", "transfer", false, 0), "transfer_in_cash");
  assert.equal(classify("transfer", "Completed incoming transfer of long shares", "transfer", true, 5), "transfer_in_kind");
});

test("a dividend-reinvestment purchase is a BUY, not income", () => {
  // Both the subtype and the fund name contain "dividend"; the type decides.
  assert.equal(
    classify("buy", "Dividend reinvestment purchase of a fractional share", "dividend reinvestment"),
    "buy"
  );
  assert.equal(
    classify("buy", "buy a fractional share of an Example Dividend Equity ETF", "dividend reinvestment"),
    "buy"
  );
});

test("an incoming balance transfer that is NEGATIVE is a debit, not a credit", () => {
  // A positive `amount` on an "incoming transfer" row describes an arriving
  // NEGATIVE balance. A magnitude-based rule would credit it instead of
  // debiting — an error of twice the balance, at inception.
  const e = cashEffect(tx({ kind: "transfer_in_cash", rawAmount: 50 }));
  assert.equal(e.cashDelta, -50, "must DEBIT the account");
  assert.equal(e.externalFlow, -50, "the external flow is also negative");
});

test("fees are charged on top of the amount", () => {
  const e = cashEffect(tx({ kind: "buy", rawAmount: 110, fees: 0.04, quantity: 1, ticker: "AEVA" }));
  assert.ok(Math.abs(e.cashDelta - -110.04) < 1e-9, `got ${e.cashDelta}`);
  assert.equal(e.fees, 0.04);
});

test("unrecognised rows are surfaced as unknown, never guessed", () => {
  assert.equal(classify("wibble", "something entirely novel", "wibble"), "unknown");
  assert.equal(classify("", "", ""), "unknown");
});

// ── Daily reconstruction ────────────────────────────────────────────────────

const CAL = ["2025-07-03", "2025-07-07", "2025-07-08"];
const PX: Record<string, Record<string, number>> = {
  VOO:  { "2025-07-03": 100, "2025-07-07": 101, "2025-07-08": 102 },
  OSCR: { "2025-07-03": 10,  "2025-07-07": 11,  "2025-07-08": 12  },
};
const lookup = (t: string, d: string) => PX[t]?.[d];

test("opening in-kind state plus debit cash establishes opening NAV", () => {
  const r = reconstruct(
    [tx({ kind: "transfer_in_kind", ticker: "VOO", quantity: 7, effectiveDate: "2025-07-03" })],
    { from: "2025-07-03", to: "2025-07-03", opening: { date: "2025-07-03", shares: {}, cash: -50 }, calendar: ["2025-07-03"], priceLookup: lookup }
  );
  const d0 = r.days[0];
  assert.equal(d0.shares.VOO, 7);
  assert.equal(d0.cash, -50, "opening debit cash must be carried, not clamped to zero");
  assert.equal(d0.securitiesValue, 700);
  assert.ok(Math.abs(d0.nav - (700 - 50)) < 1e-9, "NAV = securities + (negative) cash");
  // The transfer is external, so it cannot show up as return.
  assert.ok(Math.abs(d0.externalFlow - 700) < 1e-9);
});

test("NAV invariant: a buy moves value between cash and securities only", () => {
  const r = reconstruct(
    [
      tx({ kind: "transfer_in_cash", rawAmount: -1000, effectiveDate: "2025-07-03" }),
      tx({ kind: "buy", ticker: "OSCR", quantity: 10, rawAmount: 100, effectiveDate: "2025-07-07" }),
    ],
    { from: "2025-07-03", to: "2025-07-07", calendar: ["2025-07-03", "2025-07-07"], priceLookup: lookup }
  );
  const [d0, d1] = r.days;
  assert.equal(d0.nav, 1000, "cash only on day 0");
  // Day 1: 10 OSCR @ 11 = 110, cash 900 → NAV 1010. The +10 is market movement
  // (bought at 10, marked at 11), not the buy itself.
  assert.equal(d1.cash, 900);
  assert.equal(d1.securitiesValue, 110);
  assert.equal(d1.nav, 1010);
  assert.equal(d1.externalFlow, 0, "the buy is internal");
});

test("split scales the position without touching cash or NAV basis", () => {
  const r = reconstruct(
    [
      tx({ kind: "transfer_in_kind", ticker: "OSCR", quantity: 10, effectiveDate: "2025-07-03" }),
      tx({ kind: "split", ticker: "OSCR", splitRatio: 2, effectiveDate: "2025-07-07" }),
    ],
    { from: "2025-07-03", to: "2025-07-07", calendar: ["2025-07-03", "2025-07-07"], priceLookup: lookup }
  );
  assert.equal(r.days[1].shares.OSCR, 20, "2-for-1 must double the share count");
  assert.equal(r.days[1].cash, 0, "a split moves no cash");
  assert.equal(r.unresolved.length, 0);
});

test("a split with no ratio is reported unresolved rather than ignored", () => {
  const r = reconstruct(
    [tx({ kind: "split", ticker: "OSCR", effectiveDate: "2025-07-03" })],
    { from: "2025-07-03", to: "2025-07-03", calendar: ["2025-07-03"], priceLookup: lookup }
  );
  assert.equal(r.unresolved.length, 1);
});

test("unknown transactions are collected so the pipeline can refuse to publish", () => {
  const r = reconstruct(
    [tx({ kind: "unknown", rawAmount: 42, effectiveDate: "2025-07-03" })],
    { from: "2025-07-03", to: "2025-07-03", calendar: ["2025-07-03"], priceLookup: lookup }
  );
  assert.equal(r.unresolved.length, 1);
});

test("missing prices are reported, not silently treated as zero value", () => {
  const r = reconstruct(
    [tx({ kind: "transfer_in_kind", ticker: "NOPRICE", quantity: 5, effectiveDate: "2025-07-03" })],
    { from: "2025-07-03", to: "2025-07-03", calendar: ["2025-07-03"], priceLookup: lookup }
  );
  assert.deepEqual(r.days[0].missingPrices, ["NOPRICE"]);
});

// ── TWR ─────────────────────────────────────────────────────────────────────

test("TWR is neutral to a pure contribution", () => {
  // Day 1: NAV 1000, no market move, then 500 contributed. Return must be 0%.
  const r = reconstruct(
    [
      tx({ kind: "transfer_in_cash", rawAmount: -1000, effectiveDate: "2025-07-03" }),
      tx({ kind: "contribution", rawAmount: -500, effectiveDate: "2025-07-07" }),
    ],
    { from: "2025-07-03", to: "2025-07-07", calendar: ["2025-07-03", "2025-07-07"], priceLookup: lookup }
  );
  const rets = dailyReturns(r.days);
  assert.equal(rets.length, 1);
  assert.ok(Math.abs(rets[0].returnPct) < 1e-9, `contribution leaked into return: ${rets[0].returnPct}`);
});

test("TWR captures market movement and dividends as return", () => {
  const r = reconstruct(
    [
      tx({ kind: "transfer_in_kind", ticker: "VOO", quantity: 10, effectiveDate: "2025-07-03" }),
      tx({ kind: "dividend", ticker: "VOO", rawAmount: -5, effectiveDate: "2025-07-07" }),
    ],
    { from: "2025-07-03", to: "2025-07-07", calendar: ["2025-07-03", "2025-07-07"], priceLookup: lookup }
  );
  // Day0 NAV = 1000. Day1: 10 × 101 = 1010 + 5 cash = 1015 → +1.5%.
  const rets = dailyReturns(r.days);
  assert.ok(Math.abs(rets[0].returnPct - 1.5) < 1e-9, `expected 1.5%, got ${rets[0].returnPct}`);
});

test("linked daily returns compound correctly", () => {
  const linked = linkReturns([{ returnPct: 10 }, { returnPct: -10 }]);
  assert.ok(Math.abs(linked - (-1)) < 1e-9, `expected -1%, got ${linked}`);
});

// ── Weights include cash ────────────────────────────────────────────────────

test("weights are computed against total NAV including cash", () => {
  const r = reconstruct(
    [
      tx({ kind: "transfer_in_cash", rawAmount: -1000, effectiveDate: "2025-07-03" }),
      tx({ kind: "buy", ticker: "OSCR", quantity: 10, rawAmount: 100, effectiveDate: "2025-07-03" }),
    ],
    { from: "2025-07-03", to: "2025-07-03", calendar: ["2025-07-03"], priceLookup: lookup }
  );
  const { weights, cashPct } = weightsAtClose(r.days[0]);
  // 10 OSCR @ 10 = 100; cash 900; NAV 1000.
  assert.ok(Math.abs(weights.OSCR - 10) < 1e-9, `OSCR weight ${weights.OSCR}`);
  assert.ok(Math.abs(cashPct - 90) < 1e-9, `cash weight ${cashPct}`);
});

test("position weights plus cash sum to 100%", () => {
  const r = reconstruct(
    [
      tx({ kind: "transfer_in_cash", rawAmount: -500, effectiveDate: "2025-07-03" }),
      tx({ kind: "buy", ticker: "OSCR", quantity: 10, rawAmount: 100, effectiveDate: "2025-07-03" }),
      tx({ kind: "buy", ticker: "VOO", quantity: 1, rawAmount: 100, effectiveDate: "2025-07-03" }),
    ],
    { from: "2025-07-03", to: "2025-07-03", calendar: ["2025-07-03"], priceLookup: lookup }
  );
  const { weights, cashPct } = weightsAtClose(r.days[0]);
  const total = Object.values(weights).reduce((a, b) => a + b, 0) + cashPct;
  assert.ok(Math.abs(total - 100) < 1e-9, `weights summed to ${total}`);
});

test("a negative-NAV day is flagged rather than producing nonsense weights", () => {
  const r = reconstruct([], {
    from: "2025-07-03", to: "2025-07-03",
    opening: { date: "2025-07-03", shares: {}, cash: -50 },
    calendar: ["2025-07-03"], priceLookup: lookup,
  });
  const { navPositive, weights } = weightsAtClose(r.days[0]);
  assert.equal(navPositive, false);
  assert.deepEqual(weights, {});
});

// ── Corporate-action and calendar regressions ───────────────────────────────
// Both of these were real defects found while reconciling July 2025.

test("as-traded close reverses a LATER split", () => {
  // A split-adjusted close must be scaled back up by later split ratios to
  // recover the as-traded price. Synthetic values; only the ratio matters.
  const cache = {
    fetchedAt: "2026-08-20",
    series: { VGT: { "2025-07-31": 86.30874633789062 } },
    splits: { VGT: [{ date: "2026-04-21", ratio: 8 }] },
    tradingDays: ["2025-07-31"],
  };
  const px = asTradedClose("VGT", "2025-07-31", cache)!;
  assert.ok(Math.abs(px - 690.47) < 0.01, `expected ~690.47, got ${px}`);
  assert.equal(splitFactorAfter("VGT", "2025-07-31", cache), 8);
  // A date AFTER the split needs no adjustment.
  assert.equal(splitFactorAfter("VGT", "2026-05-01", cache), 1);
});

test("a transaction on a non-trading date rolls forward, never vanishes", () => {
  // A sale stamped on a Saturday was silently dropped, losing its cash proceeds
  // and leaving phantom shares on the book.
  const r = reconstruct(
    [tx({ kind: "sell", ticker: "VOO", quantity: 2, rawAmount: -1150, effectiveDate: "2025-07-12" })],
    {
      from: "2025-07-11", to: "2025-07-14",
      opening: { date: "2025-07-11", shares: { VOO: 10 }, cash: 0 },
      calendar: ["2025-07-11", "2025-07-14"],
      priceLookup: () => 575,
    }
  );
  const monday = r.days[1];
  assert.equal(monday.shares.VOO, 8, "the sale must be applied");
  assert.ok(Math.abs(monday.cash - 1150) < 1e-9, `cash ${monday.cash}`);
  assert.equal(r.unresolved.length, 0, "rolling forward is not an error");
});

test("transactions past the window end are reported, not dropped", () => {
  const r = reconstruct(
    [tx({ kind: "buy", ticker: "VOO", quantity: 1, rawAmount: 575, effectiveDate: "2025-08-15" })],
    { from: "2025-07-11", to: "2025-07-14", calendar: ["2025-07-11", "2025-07-14"], priceLookup: () => 575 }
  );
  assert.equal(r.unresolved.length, 1, "must surface an out-of-window row");
});
