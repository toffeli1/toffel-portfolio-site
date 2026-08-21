// ─── Performance artifact generator ───────────────────────────────────────────
//   npx tsx scripts/computePerformance.ts
//
// Runs the validated reconstruction, feeds it through the ONE canonical engine
// (lib/performanceEngine.ts), and writes data/performanceDerived.json.
//
// That artifact is PUBLIC and committed. It contains dates, percentages and
// normalised index levels only — never a NAV dollar, share count or price.
//
// RETIRED BY THIS SCRIPT (see §16 of the brief):
//   - inceptionDate = 2025-08-01            → now 2025-07-03
//   - VOO as the benchmark                  → S&P 500 Total Return (^SP500TR)
//   - benchmarkDividendYieldAnnual proxy    → real total-return index
//   - monthly Modified Dietz engine         → daily TWR, linked
// lib/perf.ts is no longer read by anything public.

import { readFileSync, writeFileSync } from "node:fs";
import { reconstruct, type ReconstructOptions } from "../lib/reconstruction/engine";
import { classify, isTradeKind } from "../lib/reconstruction/classify";
import { effectiveDate, DATE_CONVENTION_SUMMARY } from "../lib/reconstruction/dates";
import { asTradedClose, type PriceCache } from "../lib/reconstruction/prices";
import type { Transaction, DailyState } from "../lib/reconstruction/types";
import {
  wealthIndex, cumulativeFromWealth, monthlyReturns, calendarYearReturns,
  drawdownSeries, maxDrawdown, benchmarkDailyReturns, linkReturns, excessReturn,
  geometricPerSessionReturn, type DailyReturn,
} from "../lib/performanceEngine";
import { activeCompanies, exitedCompanies } from "../data/companies";

const INCEPTION = "2025-07-03";

interface Row { [k: string]: unknown }
const pick = <T,>(r: Row, k: string[]): T | undefined => {
  for (const x of k) if (r[x] !== undefined && r[x] !== null) return r[x] as T;
  return undefined;
};

function loadTransactions(): Transaction[] {
  const raw = JSON.parse(readFileSync("data/rothTransactions.local.json", "utf8"));
  return (raw.transactions as Row[]).map((r) => {
    const postedDate = String(pick<string>(r, ["date"]) ?? "").slice(0, 10);
    const dt = pick<string>(r, ["transaction_datetime"]) ?? undefined;
    const rawType = pick<string>(r, ["type"]);
    const subtype = pick<string>(r, ["subtype"]);
    const rawDescription = pick<string>(r, ["name"]);
    const ticker = pick<string>(r, ["ticker_symbol"]);
    const quantity = Number(pick<number>(r, ["quantity"]) ?? 0) || undefined;
    const kind = classify(rawType, rawDescription, subtype, Boolean(ticker?.trim()), quantity ?? 0);
    return {
      postedDate, transactionDatetime: dt,
      effectiveDate: effectiveDate({
        postedDate, transactionDatetime: dt, isTrade: isTradeKind(kind),
        isOpeningInKind: kind === "transfer_in_kind" && (!dt || dt.slice(0, 10) <= INCEPTION),
        inceptionDate: INCEPTION,
      }),
      kind, ticker: ticker?.trim().toUpperCase() || undefined, quantity,
      price: Number(pick<number>(r, ["price"]) ?? 0) || undefined,
      rawAmount: Number(pick<number>(r, ["amount"]) ?? 0),
      fees: Number(pick<number>(r, ["fees"]) ?? 0),
      rawType, rawDescription,
    };
  });
}

/** Daily TWR from reconstructed NAV, with external flows removed. */
function portfolioDailyReturns(days: DailyState[]): DailyReturn[] {
  const out: DailyReturn[] = [];
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1], cur = days[i];
    if (prev.nav <= 0) continue;
    out.push({
      date: cur.date,
      returnPct: ((cur.nav - prev.nav - cur.externalFlow) / prev.nav) * 100,
    });
  }
  return out;
}

/**
 * Share count below which a position is economically closed.
 *
 * The engine only deletes at 1e-9, but the source export displays six decimals,
 * so a fully-exited name can retain sub-thousandth dust. That dust was
 * being read as an open position worth a fraction of a cent, which produced a
 * -100% "return" for a position that had actually been closed cleanly.
 */
const DUST_SHARES = 1e-4;

/**
 * Trading SESSIONS a ticker was actually held, split into real intervals.
 * A name exited and later re-entered yields multiple intervals; only sessions
 * inside them count, so ownership is never treated as continuous.
 */
function holdingIntervals(days: DailyState[], ticker: string) {
  const intervals: { from: string; to: string; sessions: number }[] = [];
  let open: { from: string; to: string; sessions: number } | null = null;
  for (const d of days) {
    const held = Math.abs(d.shares[ticker] ?? 0) > DUST_SHARES;
    if (held) {
      if (!open) open = { from: d.date, to: d.date, sessions: 1 };
      else { open.to = d.date; open.sessions++; }
    } else if (open) { intervals.push(open); open = null; }
  }
  if (open) intervals.push(open);
  return intervals;
}

/**
 * Holding total return from the position's own value path, neutralising the
 * cash effect of trades: each day's position return is
 *   (value_t − value_{t−1} − netTradeValue_t) / value_{t−1}
 * and those are linked. Adding to or trimming a position is a flow at the
 * position level, exactly as a contribution is at the portfolio level.
 */
function holdingReturn(
  days: DailyState[], ticker: string, txByDate: Map<string, Transaction[]>
): number | undefined {
  const linked: { returnPct: number }[] = [];
  for (let i = 1; i < days.length; i++) {
    const prevDay = days[i - 1], curDay = days[i];

    // A day with no close for this ticker is a DATA GAP, not a wipeout. Reading
    // an absent positionValue as 0 booked a -100% day and dragged MELI's whole
    // linked return to -100%. Skip the day instead; the position resumes when a
    // price is available again.
    if (prevDay.missingPrices.includes(ticker) || curDay.missingPrices.includes(ticker)) continue;

    const prev = prevDay.positionValues[ticker] ?? 0;
    const cur = curDay.positionValues[ticker] ?? 0;
    const heldNow = Math.abs(curDay.shares[ticker] ?? 0) > DUST_SHARES;
    // Held but unpriced (or unpriced-to-zero) is also a gap.
    if (heldNow && cur <= 0) continue;
    if (prev <= 0) continue;
    // Once the position is dust, stop measuring: the exit is complete.
    if (!heldNow && Math.abs(prevDay.shares[ticker] ?? 0) <= DUST_SHARES) continue;
    let tradeValue = 0;
    for (const tx of txByDate.get(curDay.date) ?? []) {
      if (tx.ticker !== ticker) continue;
      const px = tx.price ?? 0;
      const q = tx.quantity ?? 0;
      if (tx.kind === "buy") tradeValue += px * q;
      else if (tx.kind === "sell") tradeValue -= px * q;
    }
    linked.push({ returnPct: ((cur - prev - tradeValue) / prev) * 100 });
  }
  return linked.length ? linkReturns(linked) : undefined;
}

function main() {
  const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;
  const bench = JSON.parse(readFileSync("data/benchmarkSeries.json", "utf8"));
  const calendar = px.tradingDays.filter((d) => d >= INCEPTION);
  const txs = loadTransactions();

  const opts: ReconstructOptions = {
    from: INCEPTION, to: calendar[calendar.length - 1],
    opening: { date: INCEPTION, shares: {}, cash: 0 },
    calendar, splits: px.splits,
    priceLookup: (t, d) => asTradedClose(t, d, px),
  };
  const res = reconstruct(txs, opts);
  if (res.unresolved.length) {
    console.error(`STOP: ${res.unresolved.length} unresolved transactions.`);
    process.exit(2);
  }

  const days = res.days;
  const sessions = days.map((d) => d.date);
  const daily = portfolioDailyReturns(days);
  const wealth = wealthIndex(daily, INCEPTION);
  const cumulative = cumulativeFromWealth(wealth);
  const months = monthlyReturns(daily, INCEPTION);
  const years = calendarYearReturns(daily, INCEPTION);
  const dd = drawdownSeries(wealth);
  const worst = maxDrawdown(dd);

  // ── Benchmarks ────────────────────────────────────────────────────────────
  const benchOut: Record<string, unknown> = {};
  for (const b of Object.values(bench.benchmarks) as {
    key: string; name: string; symbol?: string; available: boolean;
    totalReturn: boolean; sourceNote: string; unavailableReason?: string;
    levels: { date: string; level: number }[];
  }[]) {
    if (!b.available || b.levels.length < 2) {
      benchOut[b.key] = {
        key: b.key, name: b.name, available: false, totalReturn: b.totalReturn,
        sourceNote: b.sourceNote, unavailableReason: b.unavailableReason,
        // No series, no monthly bars, no excess. Nothing fabricated.
        cumulativeReturnPct: null, monthly: [], calendarYear: [], wealth: [],
      };
      continue;
    }
    // Prefer the DAILY series from the price cache over the monthly levels in
    // benchmarkSeries.json: the portfolio return series is daily, and comparing
    // a daily portfolio against a monthly benchmark would misstate both the
    // shape of the cumulative chart and every drawdown alignment.
    const dailyLevels = b.symbol && px.series[b.symbol]
      ? Object.entries(px.series[b.symbol])
          .map(([date, level]) => ({ date, level }))
          .sort((x, y) => x.date.localeCompare(y.date))
      : b.levels;
    const bd = benchmarkDailyReturns(dailyLevels, sessions);
    const bw = wealthIndex(bd, INCEPTION);
    const bMonths = monthlyReturns(bd, INCEPTION);
    const bYears = calendarYearReturns(bd, INCEPTION);
    benchOut[b.key] = {
      key: b.key, name: b.name, symbol: b.symbol, available: true,
      totalReturn: b.totalReturn, sourceNote: b.sourceNote,
      granularity: dailyLevels === b.levels ? "monthly" : "daily",
      cumulativeReturnPct: cumulativeFromWealth(bw),
      // Index normalised to 100 at inception — reveals no security price.
      wealth: bw,
      monthly: bMonths.map((m) => ({ key: m.key, returnPct: m.returnPct })),
      calendarYear: bYears.map((y) => ({ key: y.key, returnPct: y.returnPct })),
      excessCumulativePts: excessReturn(cumulative, cumulativeFromWealth(bw)),
    };
  }

  // ── Holding analytics: ACTIVE set from the registry, never the log ────────
  const txByDate = new Map<string, Transaction[]>();
  for (const t of txs) {
    const l = txByDate.get(t.effectiveDate);
    if (l) l.push(t); else txByDate.set(t.effectiveDate, [t]);
  }

  const holdingRows = (tickers: string[]) =>
    tickers.map((ticker) => {
      const intervals = holdingIntervals(days, ticker);
      const sessionsHeld = intervals.reduce((s, i) => s + i.sessions, 0);
      const totalReturnPct = holdingReturn(days, ticker, txByDate);
      const geo = totalReturnPct === undefined
        ? undefined : geometricPerSessionReturn(totalReturnPct, sessionsHeld);
      return {
        ticker,
        totalReturnPct: totalReturnPct ?? null,
        sessionsHeld,
        intervals: intervals.map((i) => ({ from: i.from, to: i.to, sessions: i.sessions })),
        firstHeld: intervals[0]?.from ?? null,
        lastHeld: intervals[intervals.length - 1]?.to ?? null,
        reEntered: intervals.length > 1,
        geometricPerSessionReturnPct: geo ?? null,
        // Contribution is deliberately omitted — see the note in the artifact.
        contributionPts: null,
      };
    });

  const artifact = {
    _note:
      "Generated by scripts/computePerformance.ts from the canonical engine in " +
      "lib/performanceEngine.ts. Dates, percentages and normalised index levels " +
      "only — no NAV dollars, share counts, cost basis or security prices.",
    generatedAt: new Date().toISOString().slice(0, 10),
    inceptionDate: INCEPTION,
    inceptionNote:
      "Tracking inception is July 3, 2025, the first day of Robinhood Roth activity. " +
      "July 2025 is therefore a partial month and 2025 a partial year.",
    asOfDate: sessions[sessions.length - 1],
    sessions: sessions.length,
    methodology: {
      returnBasis: "daily time-weighted return, geometrically linked",
      formula: "r_t = (NAV_t - NAV_{t-1} - externalFlow_t) / NAV_{t-1}",
      navBasis: "total account value: reconstructed securities + cash",
      weightBasisNote:
        "Public allocation weights use a SECURITIES-ONLY denominator and are a " +
        "different concept from Performance NAV, which is total account value.",
      dividends: "treated as investment return, reinvested",
      externalFlows: "contributions, withdrawals and account transfers removed from return",
      dateConvention: DATE_CONVENTION_SUMMARY,
      retired: [
        "inceptionDate = 2025-08-01",
        "VOO as benchmark",
        "benchmarkDividendYieldAnnual total-return proxy",
        "monthly Modified Dietz engine",
      ],
    },
    cumulativeReturnPct: cumulative,
    wealth,
    monthly: months,
    calendarYear: years,
    drawdown: dd,
    maxDrawdownPct: worst.pct,
    maxDrawdownDate: worst.date,
    benchmarks: benchOut,
    activeHoldings: holdingRows(activeCompanies().map((c) => c.ticker)),
    historicalHoldings: holdingRows(
      exitedCompanies().map((c) => c.ticker)
    ).filter((h) => h.sessionsHeld > 0),
    contributionNote:
      "Holding periods are counted in trading sessions, not calendar days. " +
      "Holding-level contribution to portfolio return is omitted. Attribution " +
      "would require intra-day valuation at every execution, and this book has " +
      "frequent partial exits, re-entries and same-day multi-fill builds. An " +
      "approximation would not be defensible, so it is left out rather than estimated.",
  };

  writeFileSync("data/performanceDerived.json", JSON.stringify(artifact, null, 2) + "\n");
  console.log(`inception ${INCEPTION}  asOf ${artifact.asOfDate}  sessions ${sessions.length}`);
  console.log(`cumulative TWR ${cumulative.toFixed(2)}%  maxDD ${worst.pct.toFixed(2)}% (${worst.date})`);
  console.log(`months ${months.length}  years ${years.length}`);
  for (const [k, v] of Object.entries(benchOut)) {
    const b = v as { available: boolean; cumulativeReturnPct: number | null };
    console.log(`  ${k.padEnd(10)} ${b.available ? `${b.cumulativeReturnPct!.toFixed(2)}%` : "UNAVAILABLE"}`);
  }
  const withRet = artifact.activeHoldings.filter((h) => h.totalReturnPct !== null).length;
  console.log(`active holdings with return: ${withRet}/${artifact.activeHoldings.length}`);
}

main();
