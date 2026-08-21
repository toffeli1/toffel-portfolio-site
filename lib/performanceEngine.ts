// ─── Canonical performance engine ─────────────────────────────────────────────
// THE single source of every portfolio-level performance number on the site.
// Pure functions. No I/O, no data. Chart components must never recompute any of
// this — they render what scripts/computePerformance.ts emits.
//
// ── TWO DIFFERENT NAV CONCEPTS, DELIBERATELY ────────────────────────────────
//
//   PUBLIC ALLOCATION WEIGHT  = positionValue / SECURITIES value
//       Excludes residual cash so bookkeeping noise cannot move a displayed
//       security weight. Used by Investments and the Decision Log.
//
//   PERFORMANCE NAV           = securities + cash  (TOTAL account value)
//       Cash is part of the book and must be included, or a large cash
//       allocation would silently inflate measured return.
//
// These are not a contradiction and must not be "reconciled" into one number.
// See lib/reconstruction/cashPolicy.ts for the approved cash policy.
//
// ── METHODOLOGY ─────────────────────────────────────────────────────────────
// Daily time-weighted return, geometrically linked:
//
//   r_t  = (NAV_t − NAV_{t−1} − externalFlow_t) / NAV_{t−1}
//   TWR  = Π(1 + r_t) − 1
//
// The flow is removed from the numerator, so contributed capital is never
// counted as performance. Dividends and fees stay in the numerator: they are
// return, not flows. This replaces the retired monthly Modified Dietz
// approximation — daily marks are available, so the coarser estimate would only
// introduce disagreement between surfaces.

export interface DailyReturn {
  date: string;
  returnPct: number;
}

export interface WealthPoint {
  date: string;
  /** Index normalised to 100 at inception. */
  index: number;
}

export interface PeriodReturn {
  /** "2025-07" or "2025" */
  key: string;
  label: string;
  returnPct: number;
  /** True when the period does not span its full natural length. */
  partial?: boolean;
  /** First and last dates actually included. */
  from: string;
  to: string;
}

export interface DrawdownPoint {
  date: string;
  /** ≤ 0. Percent below the running peak. */
  drawdownPct: number;
}

/** Geometrically link a set of returns into one cumulative percentage. */
export function linkReturns(returns: { returnPct: number }[]): number {
  return (returns.reduce((acc, r) => acc * (1 + r.returnPct / 100), 1) - 1) * 100;
}

/**
 * Wealth index from daily returns, normalised to 100 at inception.
 * Every cumulative figure and the drawdown series derive from THIS array, so
 * they cannot disagree.
 */
export function wealthIndex(
  returns: DailyReturn[],
  inceptionDate: string
): WealthPoint[] {
  const out: WealthPoint[] = [{ date: inceptionDate, index: 100 }];
  let level = 100;
  for (const r of returns) {
    level *= 1 + r.returnPct / 100;
    out.push({ date: r.date, index: level });
  }
  return out;
}

/** Cumulative return implied by a wealth index. */
export function cumulativeFromWealth(wealth: WealthPoint[]): number {
  if (wealth.length === 0) return 0;
  return wealth[wealth.length - 1].index - 100;
}

/** Group daily returns into calendar months, linking within each. */
export function monthlyReturns(
  returns: DailyReturn[],
  inceptionDate: string
): PeriodReturn[] {
  const buckets = new Map<string, DailyReturn[]>();
  for (const r of returns) {
    const key = r.date.slice(0, 7);
    const list = buckets.get(key);
    if (list) list.push(r);
    else buckets.set(key, [r]);
  }

  const out: PeriodReturn[] = [];
  for (const [key, rs] of [...buckets.entries()].sort()) {
    const [y, m] = key.split("-").map(Number);
    const monthStart = `${key}-01`;
    const lastDay = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    // Partial when inception lands mid-month, or the month is still running.
    const partial =
      (inceptionDate > monthStart && inceptionDate.slice(0, 7) === key) ||
      rs[rs.length - 1].date < lastDay;
    out.push({
      key,
      label: new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
        month: "short", year: "numeric", timeZone: "UTC",
      }),
      returnPct: linkReturns(rs),
      partial,
      from: inceptionDate.slice(0, 7) === key ? inceptionDate : rs[0].date,
      to: rs[rs.length - 1].date,
    });
  }
  return out;
}

/** Group daily returns into calendar years, linking within each. */
export function calendarYearReturns(
  returns: DailyReturn[],
  inceptionDate: string
): PeriodReturn[] {
  const buckets = new Map<string, DailyReturn[]>();
  for (const r of returns) {
    const key = r.date.slice(0, 4);
    const list = buckets.get(key);
    if (list) list.push(r);
    else buckets.set(key, [r]);
  }

  const out: PeriodReturn[] = [];
  for (const [key, rs] of [...buckets.entries()].sort()) {
    const startedMidYear = inceptionDate.slice(0, 4) === key && inceptionDate > `${key}-01-01`;
    const endsMidYear = rs[rs.length - 1].date < `${key}-12-31`;
    out.push({
      key,
      label: key,
      returnPct: linkReturns(rs),
      partial: startedMidYear || endsMidYear,
      from: startedMidYear ? inceptionDate : rs[0].date,
      to: rs[rs.length - 1].date,
    });
  }
  return out;
}

/**
 * Drawdown from the SAME wealth index used for cumulative return.
 * Daily granularity, because the validated series supports it — a month-end-only
 * drawdown would understate the true peak-to-trough.
 */
export function drawdownSeries(wealth: WealthPoint[]): DrawdownPoint[] {
  let peak = -Infinity;
  return wealth.map((w) => {
    peak = Math.max(peak, w.index);
    return { date: w.date, drawdownPct: (w.index / peak - 1) * 100 };
  });
}

export function maxDrawdown(dd: DrawdownPoint[]): { pct: number; date: string } {
  let worst = { pct: 0, date: dd[0]?.date ?? "" };
  for (const p of dd) if (p.drawdownPct < worst.pct) worst = { pct: p.drawdownPct, date: p.date };
  return worst;
}

// ── Benchmarks ───────────────────────────────────────────────────────────────

/**
 * Benchmark daily returns restricted to the portfolio's own session list, so
 * both series span exactly the same dates. A benchmark with missing sessions
 * must never define the comparison calendar.
 */
export function benchmarkDailyReturns(
  levels: { date: string; level: number }[],
  sessions: string[]
): DailyReturn[] {
  const byDate = new Map(levels.map((l) => [l.date, l.level]));
  const out: DailyReturn[] = [];
  let prev: number | undefined;
  for (const d of sessions) {
    const lvl = byDate.get(d);
    if (lvl === undefined) continue; // gap in the index; skip, never interpolate
    if (prev !== undefined && prev > 0) {
      out.push({ date: d, returnPct: (lvl / prev - 1) * 100 });
    }
    prev = lvl;
  }
  return out;
}

/** portfolio − benchmark, in percentage points. */
export function excessReturn(portfolioPct: number, benchmarkPct: number): number {
  return portfolioPct - benchmarkPct;
}

// ── Holding-level analytics ──────────────────────────────────────────────────

export interface HoldingInterval {
  from: string;
  to: string;
  /** Trading days in the interval. */
  sessions: number;
}

/**
 * Average GEOMETRIC return per TRADING SESSION held:
 *
 *   (1 + totalReturn)^(1 / sessionsHeld) − 1
 *
 * Not totalReturn / sessionsHeld, which overstates compounding badly over long
 * holds. Undefined when the holding period is too short to be meaningful.
 */
export function geometricPerSessionReturn(
  totalReturnPct: number,
  sessionsHeld: number
): number | undefined {
  if (sessionsHeld <= 0) return undefined;
  const growth = 1 + totalReturnPct / 100;
  if (growth <= 0) return undefined; // total loss: no real geometric rate
  return (Math.pow(growth, 1 / sessionsHeld) - 1) * 100;
}

/**
 * Sum of trading SESSIONS across actual holding intervals — not calendar span.
 * A position exited and later re-entered counts only the sessions inside its
 * real holding intervals.
 */
export function totalSessionsHeld(intervals: HoldingInterval[]): number {
  return intervals.reduce((s, i) => s + i.sessions, 0);
}
