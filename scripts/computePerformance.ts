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

import { ingestLedger, makeExDateResolver } from "../lib/reconstruction/ingest";
import { readFileSync, writeFileSync } from "node:fs";
import { reconstruct, type ReconstructOptions } from "../lib/reconstruction/engine";
import { DATE_CONVENTION_SUMMARY } from "../lib/reconstruction/dates";
import { asTradedClose, type PriceCache } from "../lib/reconstruction/prices";
import type { Transaction, DailyState } from "../lib/reconstruction/types";
import {
  wealthIndex, cumulativeFromWealth, monthlyReturns, calendarYearReturns,
  drawdownSeries, maxDrawdown, benchmarkDailyReturns, linkReturns, excessReturn,
  geometricPerSessionReturn, type DailyReturn,
} from "../lib/performanceEngine";
import { activeCompanies } from "../data/companies";
import { isPubliclyExcluded } from "../lib/reconstruction/exclusions";
import {
  survivingLots, currentPositionReturnPct, currentInterval, ownershipIntervals,
  ownershipEpisodes, episodeRealizedReturnPct, type SurvivingPosition,
} from "../lib/reconstruction/fifo";
import { companyName } from "../data/companies";

const INCEPTION = "2025-07-03";

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

// The dust threshold that keeps a fully-exited name from reading as an open
// position worth a fraction of a cent now lives with the FIFO logic itself, as
// DUST in lib/reconstruction/fifo.ts.

/**
 * ACTIVE holdings: return on the position as it stands today, measured against
 * the cost basis of the lots that survive, over the CURRENT continuous interval.
 *
 * This replaces a linked daily price path that ran from the ticker's first-ever
 * purchase. That metric answered "how has this ticker moved since I first
 * touched it", which diverges wildly from the held position whenever a name was
 * trimmed and rebought at a different basis, and it blended pre-exit ownership
 * into a re-entered position's history.
 */
function activeRows(
  days: DailyState[],
  lots: Map<string, SurvivingPosition>,
  closeOf: (t: string) => number | undefined,
  tickers: string[]
) {
  return tickers.filter((t) => !isPubliclyExcluded(t)).map((ticker) => {
    const pos = lots.get(ticker);
    const iv = currentInterval(days, ticker);
    const totalReturnPct = pos ? currentPositionReturnPct(pos, closeOf(ticker)) : undefined;
    const sessionsHeld = iv?.sessions;
    const geo =
      totalReturnPct === undefined || sessionsHeld === undefined
        ? undefined
        : geometricPerSessionReturn(totalReturnPct, sessionsHeld);
    // Prior closed intervals are reported as a COUNT only, so a reader can see
    // the position was re-entered without that history touching the return.
    const prior = Math.max(0, ownershipIntervals(days, ticker).length - 1);
    return {
      ticker,
      totalReturnPct: totalReturnPct ?? null,
      sessionsHeld: sessionsHeld ?? null,
      currentIntervalStart: iv?.from ?? null,
      currentIntervalEnd: iv?.to ?? null,
      priorClosedIntervals: prior,
      reEntered: prior > 0,
      geometricPerSessionReturnPct: geo ?? null,
      contributionPts: null,
    };
  });
}

/** Securities that arrived by in-kind transfer, so their true basis predates
 *  this account. Valued at the tracked-inception mark instead. */
const TRANSFERRED_IN = new Set(["QQQ", "VGT", "VOO"]);

/**
 * CLOSED ownership episodes, from actual ledger cash.
 *
 * One row per episode, not per ticker: a name owned three separate times on
 * three different theses produces three rows. Aggregating them would describe
 * a decision nobody made.
 */
function historicalEpisodeRows(
  days: DailyState[],
  txs: Transaction[],
  px: PriceCache
) {
  const dividendFor = (tx: Transaction): string | undefined => {
    // Cash-dividend rows leave the ticker blank and name the security in prose.
    const m = /dividend of \$[\d.,]+ from ([A-Z.]{1,6})/i.exec(tx.rawDescription ?? "");
    return m ? m[1].toUpperCase() : undefined;
  };
  const openingMark = (t: string) =>
    TRANSFERRED_IN.has(t) ? asTradedClose(t, INCEPTION, px) : undefined;

  // Distributions are attributed by EX-DATE from market data, not by a time
  // window after the exit. See lib/reconstruction/fifo.ts.
  const exDateFor = makeExDateResolver(px.dividends);
  const unattributed: { ticker: string; date: string; amount: number }[] = [];
  const eps = ownershipEpisodes(txs, {
    splits: px.splits, openingMark, dividendFor, exDateFor,
    unattributedOut: unattributed,
  });

  // A distribution we cannot place is REPORTED, never silently absorbed.
  const shown = unattributed.filter((u) => !isPubliclyExcluded(u.ticker));
  if (shown.length) {
    console.log(`unattributed distributions (excluded from every return): ${shown.length}`);
    for (const u of shown) console.log(`  ${u.ticker} paid ${u.date} — no ownership episode covers its ex-date`);
  }
  const inferred = eps.filter((e) => e.inferredDividends && !isPubliclyExcluded(e.ticker));
  if (inferred.length) {
    console.log(`fallback-inferred distributions: ${inferred.length}`);
    for (const e of inferred) console.log(`  ${e.ticker} ep${e.index} — attributed to the immediately preceding episode`);
  }

  return eps
    .filter((ep) => !ep.open && !isPubliclyExcluded(ep.ticker))
    .map((ep) => {
      const iv = ownershipIntervals(days, ep.ticker)[ep.index];
      const sessions = iv?.sessions ?? 0;
      const ret = episodeRealizedReturnPct(ep);
      const geo =
        ret === undefined || sessions <= 0 ? undefined : geometricPerSessionReturn(ret, sessions);
      return {
        ticker: ep.ticker,
        company: companyName(ep.ticker),
        episode: ep.index,
        initiatedOn: ep.start,
        exitedOn: ep.end ?? null,
        sessionsHeld: sessions,
        totalReturnPct: ret ?? null,
        geometricPerSessionReturnPct: geo ?? null,
        // True when basis is the tracked-inception mark rather than a purchase
        // price, so the figure is a tracked-period return only.
        trackedPeriodBasis: ep.basisFromOpeningMark ?? false,
        contributionPts: null,
      };
    })
    .sort((a, b) => (b.totalReturnPct ?? -Infinity) - (a.totalReturnPct ?? -Infinity));
}

function main() {
  const px = JSON.parse(readFileSync("data/priceCache.local.json", "utf8")) as PriceCache;
  const bench = JSON.parse(readFileSync("data/benchmarkSeries.json", "utf8"));
  const calendar = px.tradingDays.filter((d) => d >= INCEPTION);

  // HARD BOUNDARY: Roth IRA only, asserted at the SOURCE ROW level, plus
  // session normalization. Aborts rather than reconstructing a blended book.
  const { transactions: txs, audit } = ingestLedger(px.tradingDays, INCEPTION);
  console.log(
    `source audit: type=${audit.accountType} rows=${audit.rowCount} ` +
    `owningAccountIds=${audit.owningAccountIds} foreignRows=${audit.foreignRows} ` +
    `counterpartyRefs=${audit.counterpartyRefs}`
  );

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
    key: string; name: string; symbol?: string; available: boolean; proxy?: boolean;
    totalReturn: boolean; sourceNote: string; unavailableReason?: string;
    levels: { date: string; level: number }[];
  }[]) {
    if (!b.available || b.levels.length < 2) {
      benchOut[b.key] = {
        key: b.key, name: b.name, available: false, proxy: b.proxy ?? false,
        totalReturn: b.totalReturn,
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
    // A benchmark total-return series must use ADJUSTED closes so distributions
    // are reinvested. ^SP500TR is already a total-return index, so its adjusted
    // and raw series coincide; QQQ (the Nasdaq-100 proxy) genuinely needs the
    // adjusted series, since its raw price omits distributions.
    const src = b.symbol
      ? (px.adjusted?.[b.symbol] ?? px.series[b.symbol])
      : undefined;
    const dailyLevels = src
      ? Object.entries(src).map(([date, level]) => ({ date, level }))
          .sort((x, y) => x.date.localeCompare(y.date))
      : b.levels;
    const bd = benchmarkDailyReturns(dailyLevels, sessions);
    const bw = wealthIndex(bd, INCEPTION);
    const bMonths = monthlyReturns(bd, INCEPTION);
    const bYears = calendarYearReturns(bd, INCEPTION);
    benchOut[b.key] = {
      key: b.key, name: b.name, symbol: b.symbol, available: true,
      proxy: b.proxy ?? false,
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
  const lots = survivingLots(txs, px.splits);
  const closeOf = (t: string) => asTradedClose(t, sessions[sessions.length - 1], px);

  const MONTH_ABBR = ["Jan.","Feb.","Mar.","Apr.","May","June","July","Aug.","Sept.","Oct.","Nov.","Dec."];
  const asOf = sessions[sessions.length - 1];
  const markLabel = `${MONTH_ABBR[Number(asOf.slice(5, 7)) - 1]} ${Number(asOf.slice(8, 10))}`;

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
    activeHoldings: activeRows(days, lots, closeOf, activeCompanies().map((c) => c.ticker)),
    historicalHoldings: historicalEpisodeRows(days, txs, px),
    holdingReturnBasis:
      "Active holdings show the return on the CURRENT position: market value of " +
      "the quantity held divided by the surviving FIFO cost basis, minus one, " +
      "over the current continuous ownership interval. A position fully exited " +
      "and later re-entered starts a new interval, and the earlier ownership is " +
      "not blended in. Exited holdings show realized return on the lots disposed " +
      "of, computed from actual ledger cash: proceeds plus dividends less " +
      "acquisition cost and fees, over the cost. Each closed ownership episode is " +
      "its own row, so a name owned several times is never aggregated. " +
      "Valuation uses one consistent daily closing source for every holding.",
    // Why a derived active return can differ from the broker's own figure.
    //
    // Do NOT characterise the two marks as "intraday last-trade" versus
    // "official close" — that was asserted earlier and never verified. State
    // only what is actually known: the two sources are different, and ours is
    // internally consistent across holdings.
    valuationMarkNote:
      "The remaining difference is caused by the valuation mark. The connected " +
      `Robinhood/Plaid snapshot and the selected ${markLabel} market close are ` +
      "not identical. Active holding returns use one consistent closing-price " +
      "source across all holdings.",
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
