import test from "node:test";
import assert from "node:assert/strict";
import { ownershipEpisodes, episodeRealizedReturnPct } from "../lib/reconstruction/fifo";
import type { Transaction } from "../lib/reconstruction/types";

// ─── Distribution attribution by EX-DATE, not by a time window ────────────────
// A distribution lands in the cash ledger on its PAY date, which is routinely
// after a sale. What decides whose return it belongs to is the EX-DATE: you had
// to own the shares then to be paid at all.
//
// The prior rule — "any distribution within 90 days after an exit belongs to the
// episode that just closed" — happened to give the right answer on the ledger it
// was written against, but it is not evidence. It would credit a distribution to
// an episode that had already ended before the ex-date, and its 90-day span was
// arbitrary.

const tx = (o: Partial<Transaction>): Transaction => ({
  postedDate: o.effectiveDate ?? "2026-01-01",
  effectiveDate: o.effectiveDate ?? "2026-01-01",
  kind: "buy",
  rawAmount: 0,
  fees: 0,
  ...o,
} as Transaction);

const buy = (ticker: string, date: string, qty: number, cash: number) =>
  tx({ kind: "buy", ticker, effectiveDate: date, quantity: qty, rawAmount: cash });
const sell = (ticker: string, date: string, qty: number, cash: number) =>
  tx({ kind: "sell", ticker, effectiveDate: date, quantity: qty, rawAmount: -cash });
const dividend = (ticker: string, payDate: string, cash: number) =>
  tx({
    kind: "dividend", effectiveDate: payDate, rawAmount: -cash,
    rawDescription: `Cash dividend of $${cash.toFixed(2)} from ${ticker}`,
  });

const dividendFor = (t: Transaction) => {
  const m = /dividend of \$[\d.,]+ from ([A-Z.]{1,6})/i.exec(t.rawDescription ?? "");
  return m ? m[1].toUpperCase() : undefined;
};

/** Build an ex-date lookup from an explicit pay-date → ex-date table. */
const exDates = (table: Record<string, string>) => (_t: string, payDate: string) =>
  table[payDate];

test("a distribution PAID after the exit but EARNED before it is attributed to that episode", () => {
  const txs = [
    buy("TSTA", "2025-07-15", 100, 1000),
    sell("TSTA", "2026-06-01", 100, 1030),
    dividend("TSTA", "2026-06-10", 15), // pay date, after the sale
  ];
  const unattributed: { ticker: string; date: string; amount: number }[] = [];
  const eps = ownershipEpisodes(txs, {
    dividendFor,
    exDateFor: exDates({ "2026-06-10": "2026-05-27" }), // ex-date INSIDE the episode
    unattributedOut: unattributed,
  });

  assert.equal(eps.length, 1);
  assert.equal(eps[0].dividends, 15, "the distribution was earned while held");
  assert.equal(eps[0].inferredDividends, undefined, "attributed on evidence, not inference");
  assert.equal(unattributed.length, 0);

  // (1030 + 15 - 1000) / 1000
  assert.ok(Math.abs(episodeRealizedReturnPct(eps[0])! - 4.5) < 1e-9);
});

test("a distribution earned AFTER a re-entry does not leak into the earlier episode", () => {
  const txs = [
    buy("TSTB", "2025-07-15", 100, 1000),
    sell("TSTB", "2026-06-01", 100, 1030),   // episode 0 closes
    buy("TSTB", "2026-06-05", 100, 1040),    // episode 1 opens
    dividend("TSTB", "2026-06-20", 12),      // paid during episode 1
  ];
  const eps = ownershipEpisodes(txs, {
    dividendFor,
    exDateFor: exDates({ "2026-06-20": "2026-06-12" }), // ex-date is inside episode 1
  });

  assert.equal(eps.length, 2);
  assert.equal(eps[0].dividends, 0, "the closed episode must not be credited");
  assert.equal(eps[1].dividends, 12, "the open episode earned it");
  // Episode 0's return is the trade alone: (1030 - 1000) / 1000
  assert.ok(Math.abs(episodeRealizedReturnPct(eps[0])! - 3.0) < 1e-9);
});

test("a distribution after an exit CANNOT cross into a later episode via the fallback", () => {
  // No ex-date evidence at all, and a later episode already exists. The
  // constrained fallback must refuse rather than guess.
  const txs = [
    buy("TSTC", "2025-07-15", 100, 1000),
    sell("TSTC", "2026-06-01", 100, 1030),
    buy("TSTC", "2026-06-05", 100, 1040),
    sell("TSTC", "2026-07-01", 100, 1100),
    dividend("TSTC", "2026-07-10", 9),
  ];
  const unattributed: { ticker: string; date: string; amount: number }[] = [];
  const eps = ownershipEpisodes(txs, { dividendFor, unattributedOut: unattributed });

  assert.equal(eps.length, 2);
  assert.equal(eps[0].dividends, 0, "must not reach back past a later episode");
});

test("an AMBIGUOUS distribution is reported, never silently assigned", () => {
  // Owned twice, exited both times, no ex-date available. Which episode earned
  // it is genuinely unknown, so it must be surfaced rather than absorbed.
  const txs = [
    buy("TSTD", "2025-07-15", 100, 1000),
    sell("TSTD", "2025-09-01", 100, 1030),
    buy("TSTD", "2026-01-05", 100, 1040),
    sell("TSTD", "2026-02-01", 100, 1100),
    dividend("TSTD", "2025-10-01", 7), // falls between two closed episodes
  ];
  const unattributed: { ticker: string; date: string; amount: number }[] = [];
  const eps = ownershipEpisodes(txs, {
    dividendFor,
    exDateFor: () => undefined, // no evidence
    unattributedOut: unattributed,
  });

  const total = eps.reduce((s, e) => s + e.dividends, 0);
  if (unattributed.length > 0) {
    assert.equal(total, 0, "nothing may be credited when attribution is unresolved");
    assert.equal(unattributed[0].ticker, "TSTD");
  } else {
    // The only alternative the fallback permits is the immediately preceding
    // episode, and it must be flagged as an inference rather than passed off as
    // ledger evidence.
    const credited = eps.filter((e) => e.dividends > 0);
    assert.equal(credited.length, 1);
    assert.ok(credited[0].inferredDividends! > 0, "must be marked as inferred");
    assert.equal(credited[0].end, "2025-09-01", "only the immediately preceding episode");
  }
});

test("a distribution whose ex-date predates every episode is never attributed", () => {
  const txs = [
    buy("TSTE", "2026-01-05", 100, 1000),
    sell("TSTE", "2026-02-01", 100, 1050),
    dividend("TSTE", "2026-01-10", 4),
  ];
  const unattributed: { ticker: string; date: string; amount: number }[] = [];
  ownershipEpisodes(txs, {
    dividendFor,
    exDateFor: exDates({ "2026-01-10": "2025-12-20" }), // before the buy
    unattributedOut: unattributed,
  });
  assert.equal(unattributed.length, 1, "unowned-period distributions are reported");
});

test("no arbitrary day-window constant survives in the attribution code", async () => {
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync("lib/reconstruction/fifo.ts", "utf8")
  );
  assert.ok(!/DIVIDEND_LAG_DAYS/.test(src), "the 90-day heuristic must be gone");
  assert.ok(/exDate/.test(src), "attribution must be ex-date driven");
});
