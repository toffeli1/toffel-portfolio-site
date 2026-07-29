// ─── Performance calc engine ───────────────────────────────────────────────────
// Pure functions only — no embedded data, no I/O. Every derived performance
// figure on /performance is computed here from raw NAVs/flows/benchmark prices,
// never hardcoded. Reproducibility is the point: this file is committed and
// public even though the raw inputs it operates on (data/performanceSeed.local.json)
// are not.
//
// Methodology, in order:
//   1. Modified Dietz monthly return per month (handles intra-month cash flows).
//   2. Linked (compounded) time-weighted return over any window.
//   3. Annualized-equivalent, arithmetic/geometric mean, sample volatility.
//   4. Max drawdown from the linked monthly-return wealth index.
//   5. Downside deviation + Sortino (MAR = risk-free/12).
//   6. Sharpe with a Lo (2002) standard-error approximation and 95% CI —
//      required because n is small; see app/performance's display rules.
//   7. Benchmark price return + a total-return proxy (adds back an assumed
//      dividend yield), and alpha as the portfolio/benchmark TWR spread.

export interface NavPoint {
  date: string; // YYYY-MM-DD, month-end
  nav: number;
  role?: "base";
}

export interface Flow {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface BenchmarkPricePoint {
  date: string; // YYYY-MM-DD, month-end
  price: number;
  approx?: boolean;
  note?: string;
}

export interface PerformanceConfig {
  inceptionDate: string;
  baseNavDate: string;
  benchmarkTicker: string;
  benchmarkName: string;
  riskFreeAnnual: number;
  benchmarkDividendYieldAnnual: number;
  notes?: string;
}

export interface PerformanceSeed {
  config: PerformanceConfig;
  navSeries: NavPoint[];
  flows: Flow[];
  benchmarkPrices: BenchmarkPricePoint[];
}

export interface MonthlyReturn {
  date: string;
  returnPct: number; // e.g. 2.95 for +2.95%
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysInMonth(dateStr: string): number {
  const [y, m] = dateStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function dayOfMonth(dateStr: string): number {
  return parseLocalDate(dateStr).getDate();
}

// ── 1 & 2. Modified Dietz monthly returns + linking ────────────────────────────

export function computeMonthlyReturns(seed: PerformanceSeed): MonthlyReturn[] {
  const { navSeries, flows } = seed;
  const results: MonthlyReturn[] = [];

  for (let i = 1; i < navSeries.length; i++) {
    const prior = navSeries[i - 1];
    const current = navSeries[i];
    const bmv = prior.nav;
    const emv = current.nav;
    const D = daysInMonth(current.date);

    const monthFlows = flows.filter(
      (f) => f.date > prior.date && f.date <= current.date
    );

    let F = 0;
    let weightedFlow = 0;
    for (const flow of monthFlows) {
      const d = dayOfMonth(flow.date);
      const w = (D - d) / D;
      F += flow.amount;
      weightedFlow += flow.amount * w;
    }

    const r = (emv - bmv - F) / (bmv + weightedFlow);
    results.push({ date: current.date, returnPct: r * 100 });
  }

  return results;
}

export function linkReturns(returnsPct: number[]): number {
  const growth = returnsPct.reduce((acc, r) => acc * (1 + r / 100), 1);
  return (growth - 1) * 100;
}

/** Cumulative wealth index indexed to 100 at inception, one point per month
 *  (plus the inception point itself). */
export function cumulativeIndexSeries(
  returns: MonthlyReturn[],
  baseDate: string
): { date: string; index: number }[] {
  const series = [{ date: baseDate, index: 100 }];
  let index = 100;
  for (const r of returns) {
    index *= 1 + r.returnPct / 100;
    series.push({ date: r.date, index });
  }
  return series;
}

// ── 3. Annualized-equivalent, means, volatility ────────────────────────────────

export function annualizedEquivalent(cumTWRPct: number, n: number): number {
  return (Math.pow(1 + cumTWRPct / 100, 12 / n) - 1) * 100;
}

export function arithmeticMeanPct(returns: MonthlyReturn[]): number {
  return returns.reduce((s, r) => s + r.returnPct, 0) / returns.length;
}

export function geometricMeanPct(cumTWRPct: number, n: number): number {
  return (Math.pow(1 + cumTWRPct / 100, 1 / n) - 1) * 100;
}

export function sampleStdDevPct(returns: MonthlyReturn[]): number {
  const mean = arithmeticMeanPct(returns);
  const n = returns.length;
  const variance =
    returns.reduce((s, r) => s + (r.returnPct - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
}

export function annualizedVolPct(monthlyStdDevPct: number): number {
  return monthlyStdDevPct * Math.sqrt(12);
}

// ── 4. Max drawdown ────────────────────────────────────────────────────────────

export interface DrawdownResult {
  maxDrawdownPct: number;
  peakDate: string;
  troughDate: string;
}

export function maxDrawdown(
  returns: MonthlyReturn[],
  baseDate: string
): DrawdownResult {
  const series = cumulativeIndexSeries(returns, baseDate);
  let peak = series[0].index;
  let peakDate = series[0].date;
  let worst = 0;
  let worstPeakDate = series[0].date;
  let worstTroughDate = series[0].date;

  for (const point of series) {
    if (point.index > peak) {
      peak = point.index;
      peakDate = point.date;
    }
    const drawdown = point.index / peak - 1;
    if (drawdown < worst) {
      worst = drawdown;
      worstPeakDate = peakDate;
      worstTroughDate = point.date;
    }
  }

  return {
    maxDrawdownPct: worst * 100,
    peakDate: worstPeakDate,
    troughDate: worstTroughDate,
  };
}

// ── 5. Downside deviation + Sortino ─────────────────────────────────────────────

export interface SortinoResult {
  downsideDeviationPct: number;
  sortinoAnnualized: number;
  n: number;
}

export function computeSortino(
  returns: MonthlyReturn[],
  riskFreeAnnual: number
): SortinoResult {
  const marPct = (riskFreeAnnual / 12) * 100;
  const n = returns.length;
  const meanPct = arithmeticMeanPct(returns);

  const downsideVariance =
    returns.reduce((s, r) => s + Math.min(r.returnPct - marPct, 0) ** 2, 0) / n;
  const downsideDeviationPct = Math.sqrt(downsideVariance);

  const sortinoAnnualized =
    ((meanPct - marPct) / downsideDeviationPct) * Math.sqrt(12);

  return { downsideDeviationPct, sortinoAnnualized, n };
}

// ── 6. Sharpe with standard error + 95% CI ──────────────────────────────────────

export interface SharpeResult {
  sharpeAnnualized: number;
  standardError: number;
  ciLow: number;
  ciHigh: number;
  n: number;
}

export function computeSharpe(
  returns: MonthlyReturn[],
  riskFreeAnnual: number
): SharpeResult {
  const n = returns.length;
  const meanPct = arithmeticMeanPct(returns);
  const sigmaPct = sampleStdDevPct(returns);
  const rfMonthlyPct = (riskFreeAnnual / 12) * 100;

  const monthlySR = (meanPct - rfMonthlyPct) / sigmaPct;
  const sharpeAnnualized = monthlySR * Math.sqrt(12);
  const standardError =
    Math.sqrt((1 + 0.5 * monthlySR ** 2) / n) * Math.sqrt(12);
  const ciLow = sharpeAnnualized - 1.96 * standardError;
  const ciHigh = sharpeAnnualized + 1.96 * standardError;

  return { sharpeAnnualized, standardError, ciLow, ciHigh, n };
}

// ── 7. Benchmark price return, total-return proxy, alpha ──────────────────────

export interface BenchmarkWindowStats {
  priceReturnLinkedPct: number;
  totalReturnProxyPct: number;
}

/** Benchmark stats over the first `throughCount` months (1-indexed) of
 *  benchmarkPrices beyond the base price. Pass benchmarkPrices.length - 1 for
 *  the full window. */
export function benchmarkWindowStats(
  benchmarkPrices: BenchmarkPricePoint[],
  dividendYieldAnnual: number,
  throughCount: number
): BenchmarkWindowStats {
  const base = benchmarkPrices[0].price;
  const end = benchmarkPrices[throughCount].price;
  const priceReturnLinkedPct = (end / base - 1) * 100;
  const monthlyDivYield = dividendYieldAnnual / 12;
  const totalReturnProxyPct =
    ((1 + priceReturnLinkedPct / 100) * Math.pow(1 + monthlyDivYield, throughCount) -
      1) *
    100;
  return { priceReturnLinkedPct, totalReturnProxyPct };
}

// ── Top-level orchestration ────────────────────────────────────────────────────

export interface MonthComparisonRow {
  date: string;
  portfolioReturnPct: number;
  benchmarkReturnPct: number;
}

export interface PerformanceResult {
  n: number;
  inceptionDate: string;
  asOfDate: string;
  monthlyReturns: MonthlyReturn[];
  cumulativeSeries: { date: string; portfolioIndex: number; benchmarkIndex: number }[];
  monthComparison: MonthComparisonRow[];
  cumulativeTWRPct: number;
  annualizedEquivalentPct: number;
  arithmeticMeanPct: number;
  geometricMeanPct: number;
  annualizedVolPct: number;
  drawdown: DrawdownResult;
  bestMonth: MonthlyReturn;
  worstMonth: MonthlyReturn;
  hitRateFraction: string; // e.g. "6 of 11"
  sortino: SortinoResult;
  sharpe: SharpeResult;
  benchmarkFullWindow: BenchmarkWindowStats;
  alphaFullWindowPts: number;
  /** Alpha through the second-to-last month, i.e. excluding a trailing
   *  approximate (non-statement) benchmark price when present. Undefined if
   *  there are fewer than 2 months of data. */
  alphaThroughPriorMonthPts?: number;
  priorMonthDate?: string;
}

export function computePerformance(seed: PerformanceSeed): PerformanceResult {
  const monthlyReturns = computeMonthlyReturns(seed);
  const n = monthlyReturns.length;
  const baseDate = seed.config.baseNavDate;
  const asOfDate = seed.navSeries[seed.navSeries.length - 1].date;

  const cumulativeTWRPct = linkReturns(monthlyReturns.map((r) => r.returnPct));
  const portfolioIndexSeries = cumulativeIndexSeries(monthlyReturns, baseDate);

  // Benchmark monthly price returns + cumulative index, aligned to the same dates.
  const benchmarkMonthlyReturns: MonthlyReturn[] = [];
  for (let i = 1; i < seed.benchmarkPrices.length; i++) {
    const prior = seed.benchmarkPrices[i - 1].price;
    const current = seed.benchmarkPrices[i].price;
    benchmarkMonthlyReturns.push({
      date: seed.benchmarkPrices[i].date,
      returnPct: (current / prior - 1) * 100,
    });
  }
  const benchmarkIndexSeries = cumulativeIndexSeries(benchmarkMonthlyReturns, baseDate);

  const cumulativeSeries = portfolioIndexSeries.map((p, i) => ({
    date: p.date,
    portfolioIndex: p.index,
    benchmarkIndex: benchmarkIndexSeries[i]?.index ?? p.index,
  }));

  const monthComparison: MonthComparisonRow[] = monthlyReturns.map((r, i) => ({
    date: r.date,
    portfolioReturnPct: r.returnPct,
    benchmarkReturnPct: benchmarkMonthlyReturns[i]?.returnPct ?? 0,
  }));

  const bestMonth = monthlyReturns.reduce((a, b) =>
    b.returnPct > a.returnPct ? b : a
  );
  const worstMonth = monthlyReturns.reduce((a, b) =>
    b.returnPct < a.returnPct ? b : a
  );
  const hitCount = monthlyReturns.filter((r) => r.returnPct > 0).length;

  const benchmarkFullWindow = benchmarkWindowStats(
    seed.benchmarkPrices,
    seed.config.benchmarkDividendYieldAnnual,
    seed.benchmarkPrices.length - 1
  );
  const alphaFullWindowPts = cumulativeTWRPct - benchmarkFullWindow.totalReturnProxyPct;

  let alphaThroughPriorMonthPts: number | undefined;
  let priorMonthDate: string | undefined;
  if (n >= 2) {
    const priorCumTWR = linkReturns(
      monthlyReturns.slice(0, n - 1).map((r) => r.returnPct)
    );
    const priorBenchmark = benchmarkWindowStats(
      seed.benchmarkPrices,
      seed.config.benchmarkDividendYieldAnnual,
      seed.benchmarkPrices.length - 2
    );
    alphaThroughPriorMonthPts = priorCumTWR - priorBenchmark.totalReturnProxyPct;
    priorMonthDate = monthlyReturns[n - 2].date;
  }

  return {
    n,
    inceptionDate: seed.config.inceptionDate,
    asOfDate,
    monthlyReturns,
    cumulativeSeries,
    monthComparison,
    cumulativeTWRPct,
    annualizedEquivalentPct: annualizedEquivalent(cumulativeTWRPct, n),
    arithmeticMeanPct: arithmeticMeanPct(monthlyReturns),
    geometricMeanPct: geometricMeanPct(cumulativeTWRPct, n),
    annualizedVolPct: annualizedVolPct(sampleStdDevPct(monthlyReturns)),
    drawdown: maxDrawdown(monthlyReturns, baseDate),
    bestMonth,
    worstMonth,
    hitRateFraction: `${hitCount} of ${n}`,
    sortino: computeSortino(monthlyReturns, seed.config.riskFreeAnnual),
    sharpe: computeSharpe(monthlyReturns, seed.config.riskFreeAnnual),
    benchmarkFullWindow,
    alphaFullWindowPts,
    alphaThroughPriorMonthPts,
    priorMonthDate,
  };
}
