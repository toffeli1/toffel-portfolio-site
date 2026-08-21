// ─── Decision Log weight population ───────────────────────────────────────────
//   npx tsx scripts/computeDecisionWeights.ts
//
// Replays the private ledger, then resolves every Decision Log event to a
// DAILY-CLOSE weight transition. Writes data/decisionWeights.json — PUBLIC and
// committed, because it contains only tickers, dates and percentages.
//
// METHODOLOGY (the public one, and deliberately not intraday):
//   oldWeightPct = weight at the close of the trading day BEFORE the first
//                  execution, i.e. before that day's activity
//   newWeightPct = weight at the close of the final execution day
//   new position → 0.00%   |   full exit → 0.00%
// Claiming intraday precision would mean pretending we know every other
// holding's value at each execution timestamp. We don't.
//
// Denominator is SECURITIES ONLY — see lib/reconstruction/cashPolicy.ts.

import { ingestLedger } from "../lib/reconstruction/ingest";
import { readFileSync, writeFileSync } from "node:fs";
import { reconstruct } from "../lib/reconstruction/engine";
import { asTradedClose, type PriceCache } from "../lib/reconstruction/prices";
import { securitiesOnlyWeightPct } from "../lib/reconstruction/cashPolicy";
import type { DailyState } from "../lib/reconstruction/types";
import { decisionsByCompany } from "../data/decisions";
import { isPubliclyExcluded } from "../lib/reconstruction/exclusions";

const INCEPTION = "2025-07-03";

export interface WeightRecord {
  ticker: string;
  startDate: string;
  endDate?: string;
  /** % of securities book before the first execution. */
  oldWeightPct?: number;
  /** % of securities book after the final execution. */
  newWeightPct?: number;
  /** Close used for the opening weight — provenance, publicly safe. */
  priorCloseDate?: string;
  /** Close used for the ending weight. */
  endCloseDate?: string;
  status: "computed" | "pending";
  pendingReason?: string;
}

function main() {
  const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;
  const calendar = px.tradingDays.filter((d) => d >= INCEPTION);
  const { transactions: ledgerTxs, audit } = ingestLedger(px.tradingDays, INCEPTION);
  console.log(`source audit: rows=${audit.rowCount} owningAccountIds=${audit.owningAccountIds} foreignRows=${audit.foreignRows}`);
  const res = reconstruct(ledgerTxs, {
    from: INCEPTION, to: calendar[calendar.length - 1],
    opening: { date: INCEPTION, shares: {}, cash: 0 },
    calendar, splits: px.splits,
    priceLookup: (t, d) => asTradedClose(t, d, px),
  });

  const byDate = new Map<string, DailyState>(res.days.map((d) => [d.date, d]));
  const sessions = res.days.map((d) => d.date);

  const priorSession = (date: string) => {
    let prev: string | undefined;
    for (const s of sessions) { if (s >= date) break; prev = s; }
    return prev;
  };
  const sessionOnOrAfter = (date: string) => sessions.find((s) => s >= date);

  const weightAt = (date: string | undefined, ticker: string): number | undefined => {
    if (!date) return undefined;
    const day = byDate.get(date);
    if (!day) return undefined;
    // Absent from the book at that close is a real 0%, not missing data.
    const value = day.positionValues[ticker] ?? 0;
    return securitiesOnlyWeightPct(value, day.securitiesValue);
  };

  const out: WeightRecord[] = [];
  for (const block of decisionsByCompany()) {
    // Defensive: a hand-written row must not be able to reintroduce a name the
    // owner has excluded from public surfaces.
    if (isPubliclyExcluded(block.ticker)) continue;
    for (const e of block.events) {
      const rec: WeightRecord = {
        ticker: block.ticker, startDate: e.startDate, endDate: e.endDate,
        status: "pending",
      };

      // Month-resolution entries have no determinable execution day.
      if (e.startDate.length === 7) {
        rec.pendingReason =
          "Source records only the month, not the execution day; a daily-close weight cannot be pinned.";
        out.push(rec); continue;
      }
      // Anything before tracked inception has no reconstructed book behind it.
      if (e.startDate < INCEPTION) {
        rec.pendingReason =
          `Predates tracked Roth inception (${INCEPTION}); no portfolio history exists to weigh against.`;
        out.push(rec); continue;
      }

      // Valuation closes. The ending close rolls FORWARD to the first session on
      // or after the event: an order placed outside market hours (CBRS executed
      // 22:25 ET on a Saturday) fills at the next open, so that session's close
      // is the correct "after" mark. The opening close is the last session
      // strictly before the event, so it never includes the event's own trades.
      const priorClose = priorSession(e.startDate);
      const endClose = sessionOnOrAfter(e.endDate ?? e.startDate);
      const oldW = weightAt(priorClose, block.ticker);
      const newW = weightAt(endClose, block.ticker);

      if (oldW === undefined || newW === undefined) {
        rec.pendingReason = !priorClose
          ? "No prior trading session inside the reconstructed window."
          : "Securities value unavailable at one of the valuation closes.";
        out.push(rec); continue;
      }

      // A 0% → 0% transition is not a decision — it means the recorded date
      // sits after the position had already gone to zero, i.e. the log captured
      // a SETTLEMENT date while the exposure changed on an earlier execution
      // date. Publishing it would assert the position never moved. Flag instead.
      if (oldW === 0 && newW === 0) {
        rec.pendingReason =
          "Both valuation closes show a zero position: the logged date appears to be a " +
          "settlement date falling after the actual execution. Needs the execution date.";
        out.push(rec); continue;
      }

      // Clamp: a fully-exited position can leave a sub-share rounding residual
      // (a closed position can retain sub-thousandth dust from the source
      // which renders as "-0.00%". A closed position is exactly zero.
      const clamp = (w: number) => (Math.abs(w) < 0.005 ? 0 : Number(w.toFixed(4)));
      // An Initiate or Re-enter crosses from zero by definition. The prior
      // close can show a nonzero weight only if the event date is wrong, so
      // asserting 0 here would hide a data error: instead trust the computed
      // prior close and let the validation catch a mismatch.
      rec.oldWeightPct = clamp(oldW);
      rec.newWeightPct = clamp(newW);
      rec.priorCloseDate = priorClose;
      rec.endCloseDate = endClose;
      rec.status = "computed";
      out.push(rec);
    }
  }

  const computed = out.filter((r) => r.status === "computed").length;
  writeFileSync("data/decisionWeights.json", JSON.stringify({
    _note: "Generated by scripts/computeDecisionWeights.ts. Percentages and dates only — no prices, share counts or dollar values. Denominator is securities-only market value.",
    generatedAt: new Date().toISOString().slice(0, 10),
    methodology: "Daily-close weights. old = close before first execution; new = close of final execution day. Denominator excludes residual cash.",
    inceptionDate: INCEPTION,
    events: out,
  }, null, 2) + "\n");

  console.log(`events=${out.length}  computed=${computed}  pending=${out.length - computed}`);
  for (const r of out.filter((r) => r.status === "pending")) {
    console.log(`  PENDING ${r.ticker.padEnd(6)} ${r.startDate}  ${r.pendingReason}`);
  }
}

main();
