// ─── SEC XBRL fundamentals fetcher ────────────────────────────────────────────
// Pulls reported financials straight from SEC company facts — free, no API key,
// no scraping, and the same numbers that are in the filings.
//
//   npx tsx scripts/fetchFundamentals.ts            # all covered tickers
//   npx tsx scripts/fetchFundamentals.ts AMZN META  # just these
//
// Writes data/fundamentals/reported.json. That file IS committed: reported
// company financials are public information, unlike the portfolio's own dollar
// figures. Nothing here touches the portfolio.
//
// Coverage limits, by design rather than by omission:
//   - Foreign private issuers that file 20-F without US-GAAP quarterly tags
//     (NBIS) come back empty. They are maintained by hand in
//     data/fundamentals/manual.ts.
//   - ETFs and trusts (SMH, SGOV, GLDM) have no company financials at all.
//   - Forward P/E is never available here — it is an estimate, not a filing.
//     Also manual.
//
// SEC asks for a descriptive User-Agent and fair-access rate limiting; both are
// honoured below. See https://www.sec.gov/os/webmaster-faq#developers

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const USER_AGENT = "Toffel Capital Research toffel.i@northeastern.edu";
const SEC_RATE_LIMIT_MS = 200; // SEC guidance is <10 req/s; this is well under.

const TODAY = new Date().toISOString().slice(0, 10);
/**
 * Reject a concept whose newest quarter is older than this. Generous enough for
 * a slow filer (two missed quarters plus reporting lag), tight enough to catch
 * a tag the company abandoned years ago.
 */
const STALE_AFTER_DAYS = 300;

/** Tickers we attempt to automate, with their SEC CIK. */
const CIKS: Record<string, string> = {
  AMZN: "0001018724",
  GOOGL: "0001652044",
  META: "0001326801",
  NOW: "0001373715",
  CEG: "0001868275",
  MA: "0001141391",
  UNH: "0000731766",
  RKLB: "0001819994",
  OSCR: "0001568651",
  ASTS: "0001780312",
  MELI: "0001099590",
  CBRS: "0002021728",
  // NBIS intentionally absent — 20-F filer, no usable US-GAAP quarterly tags.
};

/**
 * Concepts to try, in priority order, per logical metric. Different filers tag
 * the same economics differently, so each metric lists fallbacks.
 */
const CONCEPTS: Record<string, string[]> = {
  // Order matters. `Revenues` first: it is the total-revenue tag, whereas
  // RevenueFromContractWithCustomer* excludes insurance premiums entirely —
  // using it for Oscar produced a $6M "revenue" line against ~$3B of real
  // premium revenue. Falling back to the contract-revenue tags only when a
  // filer doesn't report `Revenues` keeps non-insurers working.
  revenue: [
    "Revenues",
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "RevenueFromContractWithCustomerIncludingAssessedTax",
  ],
  premiumsEarned: ["PremiumsEarnedNet", "HealthCarePremium"],
  grossProfit: ["GrossProfit"],
  operatingIncome: ["OperatingIncomeLoss"],
  netIncome: ["NetIncomeLoss"],
  operatingCashFlow: [
    "NetCashProvidedByUsedInOperatingActivities",
    "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
  ],
  epsDiluted: ["EarningsPerShareDiluted"],
};

interface SecFact {
  start?: string;
  end: string;
  val: number;
  form: string;
  fy?: number;
  fp?: string;
  frame?: string;
}

export interface QuarterPoint {
  /** Calendar quarter, e.g. "Q2 2026". */
  period: string;
  periodEnd: string;
  value: number;
  /** True when this quarter was reconstructed as (annual − other three). */
  derived?: boolean;
}

export interface TickerFundamentals {
  ticker: string;
  cik: string;
  /** metric → ascending quarterly series */
  metrics: Record<string, QuarterPoint[]>;
  /** Which XBRL concept actually supplied each metric, for auditability. */
  conceptUsed: Record<string, string>;
  /** Latest period end across all metrics, e.g. "2026-06-30". */
  latestPeriodEnd?: string;
  fetchedAt: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function daysBetween(a: string, b: string): number {
  return (Date.parse(b) - Date.parse(a)) / 86_400_000;
}

/**
 * Calendar-quarter label from a period end date. Deliberately NOT the filer's
 * fiscal label: SEC `fy`/`fp` describe the filing a fact was reported in, which
 * mislabels prior-year comparatives (a 2025-03-31 quarter arrived as "Q1 2026").
 * Calendar quarters are unambiguous and consistent across companies, which is
 * what a chart axis needs. Off-calendar fiscal years are noted per metric.
 */
function calendarQuarterLabel(periodEnd: string): string {
  const [y, m] = periodEnd.split("-").map(Number);
  return `Q${Math.floor((m - 1) / 3) + 1} ${y}`;
}

/**
 * A series is only trustworthy if its recent quarters are actually contiguous.
 * Gaps mean the filer switched tags mid-history, and charting across the gap
 * would imply a collapse in the business that never happened (Mastercard's
 * revenue tag stops in 2022 — exactly this case).
 */
function trailingContiguousRun(series: QuarterPoint[]): QuarterPoint[] {
  if (series.length === 0) return [];
  const out: QuarterPoint[] = [series[series.length - 1]];
  for (let i = series.length - 2; i >= 0; i--) {
    const gap = daysBetween(series[i].periodEnd, out[0].periodEnd);
    if (gap > 110) break; // more than one quarter apart → history is broken
    out.unshift(series[i]);
  }
  return out;
}

async function fetchConcept(
  cik: string,
  concept: string
): Promise<SecFact[] | null> {
  const url =
    `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/us-gaap/${concept}.json`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    console.warn(`    HTTP ${res.status} for ${concept}`);
    return null;
  }
  const json = (await res.json()) as {
    units?: Record<string, SecFact[]>;
  };
  // USD for dollar concepts, USD/shares for EPS.
  return json.units?.["USD"] ?? json.units?.["USD/shares"] ?? null;
}

/**
 * Reduce raw facts to one clean quarterly series.
 *
 * Two things make this non-trivial:
 *  - Facts repeat across amendments and later filings; we keep the newest.
 *  - Cumulative year-to-date durations are mixed in with quarterly ones. Only
 *    durations of ~13 weeks are kept, so a Q3 YTD figure can't masquerade as a
 *    quarter and inflate a chart.
 */
/**
 * Reduce raw facts to one clean, contiguous quarterly series.
 *
 * The hard part is Q4. XBRL has no standalone Q4 duration — a 10-K reports the
 * full fiscal year, so pulling only ~91-day durations leaves a structural hole
 * every fourth quarter. Charting that hole looks like the business stopped.
 * So Q4 is DERIVED: annual total minus the three quarters inside the same
 * fiscal window. That is the standard reconstruction and it reconciles exactly,
 * because all four values come from the filer's own tags.
 *
 * Also filtered out: year-to-date durations (a Q3 YTD figure would otherwise
 * masquerade as a quarter and triple the bar).
 */
function toQuarterlySeries(facts: SecFact[]): QuarterPoint[] {
  const isQuarter = (f: SecFact) => {
    if (!f.start || !f.end) return false;
    const d = daysBetween(f.start, f.end);
    return d >= 60 && d <= 110;
  };
  const isAnnual = (f: SecFact) => {
    if (!f.start || !f.end) return false;
    const d = daysBetween(f.start, f.end);
    return d >= 340 && d <= 380;
  };

  // One value per quarterly period end.
  const quarters = new Map<string, QuarterPoint>();
  for (const f of facts.filter(isQuarter)) {
    if (!quarters.has(f.end)) {
      quarters.set(f.end, {
        period: calendarQuarterLabel(f.end),
        periodEnd: f.end,
        value: f.val,
        derived: false,
      });
    }
  }

  // Derive Q4 for every fiscal year where the annual and its first three
  // quarters are all present.
  const annuals = new Map<string, SecFact>();
  for (const f of facts.filter(isAnnual)) {
    if (!annuals.has(f.end)) annuals.set(f.end, f);
  }

  for (const annual of annuals.values()) {
    if (quarters.has(annual.end)) continue; // filer tagged Q4 explicitly
    const inside = [...quarters.values()].filter(
      (q) =>
        q.periodEnd > annual.start! &&
        q.periodEnd < annual.end &&
        !q.derived
    );
    if (inside.length !== 3) continue;
    const sum = inside.reduce((t, q) => t + q.value, 0);
    quarters.set(annual.end, {
      period: calendarQuarterLabel(annual.end),
      periodEnd: annual.end,
      value: annual.val - sum,
      derived: true,
    });
  }

  return [...quarters.values()].sort((a, b) =>
    a.periodEnd.localeCompare(b.periodEnd)
  );
}

async function fetchTicker(ticker: string, cik: string): Promise<TickerFundamentals> {
  console.log(`  ${ticker} (CIK ${cik})`);
  const metrics: Record<string, QuarterPoint[]> = {};
  const conceptUsed: Record<string, string> = {};

  for (const [metric, candidates] of Object.entries(CONCEPTS)) {
    for (const concept of candidates) {
      await sleep(SEC_RATE_LIMIT_MS);
      const facts = await fetchConcept(cik, concept);
      if (!facts || facts.length === 0) continue;
      const series = toQuarterlySeries(facts);
      if (series.length === 0) continue;
      const contiguous = trailingContiguousRun(series).slice(-12);

      // A concept can be perfectly contiguous and still be dead. Companies that
      // adopted ASC 606 stopped tagging `Revenues` around 2018 and moved to
      // RevenueFromContractWithCustomer*, so the old tag keeps returning a tidy
      // run that ends years ago — ServiceNow's revenue chart came out showing
      // 2018. Reject anything whose newest quarter is stale and fall through to
      // the next candidate concept.
      const newest = contiguous[contiguous.length - 1]?.periodEnd;
      if (newest && daysBetween(newest, TODAY) > STALE_AFTER_DAYS) {
        console.log(
          `    ${metric.padEnd(18)} rejected via ${concept} (stale — ends ${newest})`
        );
        continue;
      }

      // Require at least four contiguous quarters, otherwise the tag isn't
      // usable for a chart and the metric falls through to manual maintenance.
      if (contiguous.length < 4) {
        console.log(
          `    ${metric.padEnd(18)} rejected via ${concept} ` +
            `(${series.length} raw, only ${contiguous.length} contiguous)`
        );
        continue;
      }
      metrics[metric] = contiguous;
      conceptUsed[metric] = concept;
      const dropped = series.length - contiguous.length;
      console.log(
        `    ${metric.padEnd(18)} ${contiguous.length} qtrs via ${concept}` +
          (dropped > 0 ? `  (dropped ${dropped} pre-gap)` : "")
      );
      break;
    }
    if (!metrics[metric]) console.log(`    ${metric.padEnd(18)} unavailable`);
  }

  const ends = Object.values(metrics)
    .flatMap((s) => s.map((p) => p.periodEnd))
    .sort();

  return {
    ticker,
    cik,
    metrics,
    conceptUsed,
    latestPeriodEnd: ends[ends.length - 1],
    fetchedAt: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const requested = process.argv.slice(2).map((t) => t.toUpperCase());
  const targets = requested.length
    ? requested.filter((t) => {
        if (!CIKS[t]) console.warn(`skipping ${t}: no CIK registered`);
        return Boolean(CIKS[t]);
      })
    : Object.keys(CIKS);

  console.log(`Fetching SEC fundamentals for ${targets.length} tickers…`);
  const out: Record<string, TickerFundamentals> = {};
  for (const t of targets) {
    try {
      out[t] = await fetchTicker(t, CIKS[t]);
    } catch (err) {
      console.error(`  ${t} FAILED:`, err instanceof Error ? err.message : err);
    }
  }

  const dest = resolve(process.cwd(), "data/fundamentals/reported.json");
  mkdirSync(dirname(dest), { recursive: true });

  // Merge rather than overwrite, so fetching a single ticker doesn't drop the rest.
  let existing: Record<string, TickerFundamentals> = {};
  try {
    const prior = await import(dest, { with: { type: "json" } });
    existing = (prior.default ?? {}) as Record<string, TickerFundamentals>;
  } catch {
    /* first run */
  }

  const merged = { ...existing, ...out };
  writeFileSync(dest, JSON.stringify(merged, null, 2) + "\n");
  console.log(`\nWrote ${dest} (${Object.keys(merged).length} tickers)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
