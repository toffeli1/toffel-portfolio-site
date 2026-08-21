// ─── Surviving-lot (FIFO) reconstruction ──────────────────────────────────────
// Answers a different question from lib/reconstruction/engine.ts.
//
//   engine.ts  → what was the WHOLE PORTFOLIO worth each day (for TWR)
//   this file  → what does the CURRENTLY HELD position show against the cost
//                basis of the lots that actually survive today
//
// WHY THIS EXISTS
// The active-holding table previously linked daily position returns from the
// first time a ticker was ever bought. That measures the ticker's price path
// through the account, not the current position. Where a name was trimmed and
// re-bought at a higher basis, the two diverge enormously: a holding entered
// cheaply, sold down, then rebuilt near the highs showed a path return of
// several hundred percent while the surviving lots were up a fraction of that.
//
// FIFO because that is the convention the broker reports cost basis on, so the
// reconstruction can be validated against the account's own figures.
//
// PRIVACY: quantities, prices and dollar cost live only in this module's inputs
// and return shape. Callers must publish the derived PERCENTAGE only.

import type { Transaction, DailyState } from "./types";

/** One open tax lot. Private. */
export interface Lot {
  /** Acquisition date (effective, not settlement). */
  date: string;
  /** Shares remaining in this lot after any FIFO consumption. */
  qty: number;
  /** Dollar cost remaining in this lot, proportional to qty. */
  cost: number;
}

export interface SurvivingPosition {
  ticker: string;
  /** Shares still held. Private. */
  qty: number;
  /** Remaining FIFO cost basis in dollars. Private. */
  costBasis: number;
  /** Acquisition date of the oldest surviving lot. */
  oldestLotDate?: string;
  lots: Lot[];
}

/** Below this a position is economically closed (source export shows 6 dp). */
const DUST = 1e-4;

/** Kinds that add shares at a cost. */
function isAcquire(k: Transaction["kind"]): boolean {
  return k === "buy" || k === "transfer_in_kind" || k === "stock_distribution";
}
/** Kinds that remove shares. */
function isDispose(k: Transaction["kind"]): boolean {
  return k === "sell" || k === "transfer_out_kind";
}

/**
 * Replay the ledger and return the lots still open for every ticker.
 *
 * Cost uses the transaction's own cash amount rather than price x quantity: the
 * amount is what actually left the account, and it stays correct for
 * dividend-reinvestment rows where the price column is blank.
 *
 * Splits scale open lot quantities and leave dollar cost untouched, which is
 * what a split does economically — cost per share divides, total cost does not
 * change.
 */
export interface RealizedResult {
  ticker: string;
  /** Cost of the lots that disposals consumed. Private. */
  cost: number;
  /** Cash received from those disposals. Private. */
  proceeds: number;
  firstAcquired?: string;
  lastDisposed?: string;
}

export function survivingLots(
  transactions: Transaction[],
  splits: Record<string, { date: string; ratio: number }[]> = {},
  realizedOut?: Map<string, RealizedResult>
): Map<string, SurvivingPosition> {
  const open = new Map<string, Lot[]>();

  // One chronological stream of trades and corporate actions.
  type Ev =
    | { date: string; kind: "tx"; tx: Transaction }
    | { date: string; kind: "split"; ticker: string; ratio: number };
  const events: Ev[] = transactions
    .filter((t) => t.ticker)
    .map((tx) => ({ date: tx.effectiveDate, kind: "tx" as const, tx }));
  for (const [ticker, evs] of Object.entries(splits)) {
    for (const e of evs) events.push({ date: e.date, kind: "split", ticker, ratio: e.ratio });
  }
  // Splits apply before same-day trades, so a same-day sale consumes post-split
  // quantities.
  events.sort((a, b) =>
    a.date === b.date
      ? (a.kind === "split" ? -1 : 0) - (b.kind === "split" ? -1 : 0)
      : a.date.localeCompare(b.date)
  );

  for (const ev of events) {
    if (ev.kind === "split") {
      const lots = open.get(ev.ticker);
      if (!lots) continue;
      for (const l of lots) l.qty *= ev.ratio;
      continue;
    }
    const tx = ev.tx;
    const ticker = tx.ticker!;
    const qty = tx.quantity ?? 0;
    if (qty <= 0) continue;

    if (isAcquire(tx.kind)) {
      const cost = Math.abs(tx.rawAmount) + (tx.fees ?? 0);
      const lots = open.get(ticker) ?? [];
      lots.push({ date: tx.effectiveDate, qty, cost });
      open.set(ticker, lots);
      if (realizedOut) {
        const r = realizedOut.get(ticker) ?? { ticker, cost: 0, proceeds: 0 };
        r.firstAcquired ??= tx.effectiveDate;
        realizedOut.set(ticker, r);
      }
    } else if (isDispose(tx.kind)) {
      const lots = open.get(ticker);
      if (!lots) continue;
      let remaining = qty;
      let consumedCost = 0;
      while (remaining > DUST && lots.length > 0) {
        const lot = lots[0];
        if (lot.qty <= remaining + DUST) {
          remaining -= lot.qty;
          consumedCost += lot.cost;
          lots.shift(); // lot fully consumed
        } else {
          // Partial consumption: remove cost proportionally.
          const frac = remaining / lot.qty;
          consumedCost += lot.cost * frac;
          lot.cost *= 1 - frac;
          lot.qty -= remaining;
          remaining = 0;
        }
      }
      if (realizedOut) {
        const r = realizedOut.get(ticker) ?? { ticker, cost: 0, proceeds: 0 };
        r.cost += consumedCost;
        // A sale's cash amount is negative in the provider convention.
        r.proceeds += Math.abs(tx.rawAmount) - (tx.fees ?? 0);
        r.lastDisposed = tx.effectiveDate;
        realizedOut.set(ticker, r);
      }
    }
  }

  const out = new Map<string, SurvivingPosition>();
  for (const [ticker, lots] of open) {
    const live = lots.filter((l) => l.qty > DUST);
    const qty = live.reduce((s, l) => s + l.qty, 0);
    if (qty <= DUST) continue;
    out.set(ticker, {
      ticker,
      qty,
      costBasis: live.reduce((s, l) => s + l.cost, 0),
      oldestLotDate: live[0]?.date,
      lots: live,
    });
  }
  return out;
}

/**
 * Return on the position as it stands today:
 *
 *   currentValue / survivingCostBasis - 1
 *
 * Deliberately not a linked price path. Returns undefined when the basis is
 * unusable, rather than emitting a misleading number.
 */
export function currentPositionReturnPct(
  position: SurvivingPosition,
  closingPrice: number | undefined
): number | undefined {
  if (closingPrice === undefined || !(position.costBasis > 0)) return undefined;
  return ((position.qty * closingPrice) / position.costBasis - 1) * 100;
}

export interface HoldingInterval {
  from: string;
  to: string;
  sessions: number;
}

/**
 * Every contiguous run of sessions during which the ticker was held. A run ends
 * the moment quantity reaches zero, so a re-entry starts a NEW interval and old
 * ownership is never blended into the current one.
 */
export function ownershipIntervals(
  days: DailyState[],
  ticker: string
): HoldingInterval[] {
  const out: HoldingInterval[] = [];
  let cur: HoldingInterval | null = null;
  for (const d of days) {
    const held = Math.abs(d.shares[ticker] ?? 0) > DUST;
    if (held) {
      if (!cur) cur = { from: d.date, to: d.date, sessions: 1 };
      else { cur.to = d.date; cur.sessions++; }
    } else if (cur) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * The CURRENT continuous ownership interval: the last run, and only if the
 * position is still open on the final session. Returns undefined for a closed
 * position, which is what keeps an exited name out of the active table.
 */
export function currentInterval(
  days: DailyState[],
  ticker: string
): HoldingInterval | undefined {
  const intervals = ownershipIntervals(days, ticker);
  const last = intervals[intervals.length - 1];
  if (!last || days.length === 0) return undefined;
  return last.to === days[days.length - 1].date ? last : undefined;
}

/**
 * Realized return on the lots a position actually disposed of:
 *
 *   proceeds / cost of consumed lots - 1
 *
 * Used for exited names on Historical Positions. Undefined when nothing was
 * disposed or the consumed cost is unusable.
 */
export function realizedReturnPct(r: RealizedResult): number | undefined {
  if (!(r.cost > 0) || !(r.proceeds > 0)) return undefined;
  return (r.proceeds / r.cost - 1) * 100;
}

// ─── Ownership episodes ───────────────────────────────────────────────────────
// An EPISODE is one uninterrupted stretch of ownership: it opens when quantity
// crosses zero to positive and closes when quantity returns to zero. Trims and
// adds inside a stretch stay in the same episode; a purchase after the balance
// hit zero starts a new one.
//
// This exists because a per-ticker lifetime aggregate is the wrong unit. OSCR
// was owned three separate times on completely different theses, and blending
// them produced a number describing no decision anyone actually made.

export interface Episode {
  ticker: string;
  index: number;
  start: string;
  /** Undefined while the episode is still open. */
  end?: string;
  open: boolean;
  /** Cash paid to acquire, excluding fees. Private. */
  acquisitionCost: number;
  /** Cash received from disposals, excluding fees. Private. */
  proceeds: number;
  /** Cash dividends and distributions received during the episode. Private. */
  dividends: number;
  /** Transaction fees incurred during the episode. Private. */
  fees: number;
  /** Shares still held (open episodes only). Private. */
  qtyOpen: number;
  txCount: number;
  /** Distributions attributed by the constrained fallback, not by ex-date. */
  inferredDividends?: number;
  /**
   * Set when basis had to be marked to market instead of taken from the ledger,
   * i.e. an in-kind transfer whose original purchase predates this account.
   */
  basisFromOpeningMark?: boolean;
}

/**
 * Build every ownership episode per ticker from the ledger.
 *
 * `openingMark` supplies a per-share value for shares that arrive by in-kind
 * transfer. Their true acquisition cost lives in the account they came FROM, so
 * inventing a lifetime basis would fabricate return. Marking them at the
 * tracked-inception close instead yields a genuine tracked-period return, which
 * is labelled as such.
 *
 * `dividendFor` resolves a cash-dividend row to a ticker, since the provider
 * leaves the ticker column blank on those rows and names the security in the
 * description instead.
 */
export function ownershipEpisodes(
  transactions: Transaction[],
  opts: {
    splits?: Record<string, { date: string; ratio: number }[]>;
    openingMark?: (ticker: string) => number | undefined;
    dividendFor?: (tx: Transaction) => string | undefined;
    /** Resolve a distribution to its EX-date from market data. */
    exDateFor?: (ticker: string, payDate: string, amount: number) => string | undefined;
    /** Collects distributions that could not be attributed to an episode. */
    unattributedOut?: { ticker: string; date: string; amount: number }[];
  } = {}
): Episode[] {
  const splits = opts.splits ?? {};

  type Ev =
    | { date: string; order: number; kind: "tx"; tx: Transaction }
    | { date: string; order: number; kind: "split"; ticker: string; ratio: number };
  const events: Ev[] = transactions.map((tx) => ({
    date: tx.effectiveDate, order: 1, kind: "tx" as const, tx,
  }));
  for (const [ticker, evs] of Object.entries(splits)) {
    for (const e of evs) {
      events.push({ date: e.date, order: 0, kind: "split", ticker, ratio: e.ratio });
    }
  }
  events.sort((a, b) => (a.date === b.date ? a.order - b.order : a.date.localeCompare(b.date)));

  const qty = new Map<string, number>();
  const cur = new Map<string, Episode>();
  const done: Episode[] = [];
  const counters = new Map<string, number>();
  const unattributed: { ticker: string; date: string; amount: number }[] = [];

  const openEpisode = (ticker: string, date: string): Episode => {
    const idx = counters.get(ticker) ?? 0;
    counters.set(ticker, idx + 1);
    const ep: Episode = {
      ticker, index: idx, start: date, open: true,
      acquisitionCost: 0, proceeds: 0, dividends: 0, fees: 0, qtyOpen: 0, txCount: 0,
    };
    cur.set(ticker, ep);
    return ep;
  };

  for (const ev of events) {
    if (ev.kind === "split") {
      const q = qty.get(ev.ticker);
      if (q && q > DUST) qty.set(ev.ticker, q * ev.ratio);
      continue;
    }
    const tx = ev.tx;

    // Cash dividends carry no ticker; the description names the security.
    if (tx.kind === "dividend" || tx.kind === "interest") {
      const t = tx.ticker || opts.dividendFor?.(tx);
      if (!t) continue;
      const amount = Math.abs(tx.rawAmount);
      // The EX-DATE is what establishes who earned a distribution: you had to
      // hold the shares on it to be paid at all. Pay dates fall weeks later, so
      // a position sold before the pay date can still have earned it, and a
      // position bought before the pay date may not have. A "within N days of
      // exit" window cannot tell those apart, and misattributes whenever a name
      // is re-entered or pays irregularly.
      const exDate = opts.exDateFor?.(t, tx.effectiveDate, amount);
      let target: Episode | undefined;

      const openEp = cur.get(t);
      if (openEp) {
        // An episode is open at the pay date. It earned the distribution only
        // if it also held the shares on the ex-date — otherwise this belongs to
        // an earlier episode, or to no episode we track.
        if (!exDate || exDate >= openEp.start) {
          openEp.dividends += amount;
          openEp.txCount++;
          continue;
        }
      }

      if (exDate) {
        // Attribute to the episode that actually held the shares on the ex-date.
        target = done.find(
          (e) => e.ticker === t && e.end !== undefined && exDate >= e.start && exDate <= e.end
        );
      }
      if (!target) {
        // Constrained fallback: the immediately preceding closed episode only,
        // and only when no later episode has begun. Never crosses into a later
        // ownership episode.
        const prior = done.filter((e) => e.ticker === t && e.end && e.end <= tx.effectiveDate);
        const last = prior[prior.length - 1];
        const laterEpisodeStarted =
          cur.has(t) || done.some((e) => e.ticker === t && e.start > (last?.end ?? ""));
        if (last && !laterEpisodeStarted) {
          target = last;
          last.inferredDividends = (last.inferredDividends ?? 0) + amount;
        }
      }
      if (target) {
        target.dividends += amount;
        target.txCount++;
      } else {
        // Genuinely ambiguous: record it rather than silently assigning.
        unattributed.push({ ticker: t, date: tx.effectiveDate, amount });
      }
      continue;
    }

    const ticker = tx.ticker;
    if (!ticker) continue;
    const q = tx.quantity ?? 0;

    if (isAcquire(tx.kind)) {
      if (q <= 0) continue;
      const held = qty.get(ticker) ?? 0;
      const ep = held > DUST ? (cur.get(ticker) ?? openEpisode(ticker, tx.effectiveDate))
                             : openEpisode(ticker, tx.effectiveDate);
      // In-kind arrivals have no cash amount; mark them to the opening value.
      if (tx.kind === "transfer_in_kind") {
        const mark = opts.openingMark?.(ticker);
        if (mark !== undefined) {
          ep.acquisitionCost += mark * q;
          ep.basisFromOpeningMark = true;
        }
      } else {
        ep.acquisitionCost += Math.abs(tx.rawAmount);
      }
      ep.fees += tx.fees ?? 0;
      ep.txCount++;
      qty.set(ticker, held + q);
    } else if (isDispose(tx.kind)) {
      const ep = cur.get(ticker);
      if (!ep) continue;
      ep.proceeds += Math.abs(tx.rawAmount);
      ep.fees += tx.fees ?? 0;
      ep.txCount++;
      const held = (qty.get(ticker) ?? 0) - q;
      qty.set(ticker, held);
      if (held <= DUST) {
        // Balance reached zero (allowing provider rounding dust): episode closed.
        ep.end = tx.effectiveDate;
        ep.open = false;
        ep.qtyOpen = 0;
        done.push(ep);
        cur.delete(ticker);
        qty.set(ticker, 0);
      }
    }
  }

  for (const [ticker, ep] of cur) {
    ep.qtyOpen = qty.get(ticker) ?? 0;
    done.push(ep);
  }
  if (opts.unattributedOut) opts.unattributedOut.push(...unattributed);
  return done.sort((a, b) =>
    a.ticker === b.ticker ? a.index - b.index : a.ticker.localeCompare(b.ticker)
  );
}

/**
 * Realized total return on a CLOSED episode, from actual cash:
 *
 *   (proceeds + dividends - acquisitionCost - fees) / acquisitionCost
 *
 * Deliberately not first-close-to-last-close. The ledger knows what was bought
 * and sold; a price path does not.
 */
export function episodeRealizedReturnPct(ep: Episode): number | undefined {
  if (ep.open || !(ep.acquisitionCost > 0)) return undefined;
  return (
    ((ep.proceeds + ep.dividends - ep.acquisitionCost - ep.fees) / ep.acquisitionCost) * 100
  );
}
