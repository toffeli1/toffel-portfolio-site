// ─── Thesis assembly ──────────────────────────────────────────────────────────
// Joins written analysis (./entries.ts) to computed inputs: SEC-derived charts,
// the peer set from lib/peerSelection.ts, and the manually-maintained valuation
// block.
//
// Chart selection is PER COMPANY, which is the point of §6 in the spec. A
// payments network is judged on volume growth and operating margin; a launch
// company on revenue and gross margin; an insurer on premiums and margin, where
// revenue growth alone says almost nothing. The CHART_PLAN below encodes that
// choice explicitly rather than rendering the same four charts everywhere.

import { thesisEntries } from "./entries";
import { getPreviousHolding } from "../previousHoldings";
import { getCompany } from "../companies";
import type { CompanyThesis, MetricSeries } from "./types";
import {
  reportedSeries,
  marginSeries,
  yoyGrowthSeries,
  manualSeries,
  manualValuation,
  dataThroughLabel,
} from "../fundamentals";

/** Which charts belong on which company's page, and in what order. */
type ChartSpec =
  | { kind: "reported"; metric: string; label?: string; quarters?: number }
  | { kind: "margin"; numerator: string; denominator: string; label: string }
  | { kind: "yoy"; metric: string; label: string };

const CHART_PLAN: Record<string, ChartSpec[]> = {
  // Hyperscale platforms — scale, the capex-bearing margin line, and cash.
  AMZN: [
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "yoy", metric: "revenue", label: "Revenue growth (YoY)" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
    { kind: "reported", metric: "operatingCashFlow", label: "Operating cash flow" },
  ],
  GOOGL: [
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "yoy", metric: "revenue", label: "Revenue growth (YoY)" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
    { kind: "reported", metric: "epsDiluted", label: "Diluted EPS" },
  ],
  // Meta: operating earnings and margin are the thesis, per §4.
  META: [
    { kind: "reported", metric: "operatingIncome", label: "Operating income" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "reported", metric: "epsDiluted", label: "Diluted EPS" },
  ],
  // Software: growth plus the margin that proves expansion, not seat erosion.
  NOW: [
    { kind: "reported", metric: "revenue", label: "Subscription + total revenue" },
    { kind: "yoy", metric: "revenue", label: "Revenue growth (YoY)" },
    { kind: "margin", numerator: "grossProfit", denominator: "revenue", label: "Gross margin" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
  ],
  // Payments: revenue growth and the operating margin that shows network leverage.
  MA: [
    { kind: "reported", metric: "revenue", label: "Net revenue" },
    { kind: "yoy", metric: "revenue", label: "Revenue growth (YoY)" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
  ],
  // Marketplace + credit: revenue, gross margin, operating margin.
  MELI: [
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "yoy", metric: "revenue", label: "Revenue growth (YoY)" },
    { kind: "margin", numerator: "grossProfit", denominator: "revenue", label: "Gross margin" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
  ],
  // Insurers: premiums are the volume line; margin is the whole question.
  UNH: [
    { kind: "reported", metric: "premiumsEarned", label: "Premiums earned, net" },
    { kind: "reported", metric: "revenue", label: "Total revenue" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
    { kind: "reported", metric: "epsDiluted", label: "Diluted EPS" },
  ],
  OSCR: [
    { kind: "reported", metric: "premiumsEarned", label: "Premiums earned, net" },
    { kind: "yoy", metric: "revenue", label: "Revenue growth (YoY)" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
  ],
  // Generator: revenue is lumpy; the spread and cash generation carry the story.
  CEG: [
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "reported", metric: "operatingIncome", label: "Operating income" },
    { kind: "margin", numerator: "operatingIncome", denominator: "revenue", label: "Operating margin" },
    { kind: "reported", metric: "operatingCashFlow", label: "Operating cash flow" },
  ],
  // Pre-profit hardware/launch: growth and gross margin, plus cash burn.
  RKLB: [
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "yoy", metric: "revenue", label: "Revenue growth (YoY)" },
    { kind: "margin", numerator: "grossProfit", denominator: "revenue", label: "Gross margin" },
    { kind: "reported", metric: "operatingCashFlow", label: "Operating cash flow" },
  ],
  CBRS: [
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "margin", numerator: "grossProfit", denominator: "revenue", label: "Gross margin" },
    { kind: "reported", metric: "operatingIncome", label: "Operating income" },
  ],
  ASTS: [
    { kind: "reported", metric: "revenue", label: "Revenue" },
    { kind: "reported", metric: "operatingIncome", label: "Operating income" },
    { kind: "reported", metric: "operatingCashFlow", label: "Operating cash flow" },
  ],
  // NBIS is a 20-F filer with no usable XBRL — manual series only.
  NBIS: [],
  // Funds have no company financials at all.
  SMH: [], SGOV: [], GLDM: [],
};

function buildCharts(ticker: string): MetricSeries[] {
  const plan = CHART_PLAN[ticker] ?? [];
  const out: MetricSeries[] = [];

  for (const spec of plan) {
    let series: MetricSeries | undefined;
    if (spec.kind === "reported") {
      series = reportedSeries(ticker, spec.metric, {
        label: spec.label,
        quarters: spec.quarters,
      });
    } else if (spec.kind === "margin") {
      series = marginSeries(ticker, spec.numerator, spec.denominator, spec.label);
    } else {
      series = yoyGrowthSeries(ticker, spec.metric, spec.label);
    }
    // Silently skipping an unavailable metric is correct here: the gate in
    // scripts/fetchFundamentals.ts already rejected series it couldn't trust,
    // and a missing chart is better than a misleading one.
    if (series) out.push(series);
  }

  return [...out, ...manualSeries(ticker)];
}

/**
 * Historical entry for an exited company that has no written thesis of its own.
 *
 * Two cases, and neither invents analysis:
 *
 *  1. data/previousHoldings.ts preserved an archived write-up — migrate it
 *     verbatim into sections (original thesis, what changed, why exited,
 *     lesson). Nothing is rewritten; the prose is the prose that was archived.
 *  2. Nothing was archived — render a restrained shell that says exactly that,
 *     and point at the Decision Log, which does have the history.
 *
 * Deliberately no charts and no valuation for either case: the position is
 * closed, so current financials and multiples would be beside the point.
 */
function historicalFallback(ticker: string): Omit<CompanyThesis, "ticker"> | undefined {
  const company = getCompany(ticker);
  if (!company || company.status !== "exited") return undefined;

  const archived = getPreviousHolding(ticker);
  if (archived) {
    const sections = [];
    if (archived.originalThesis)
      sections.push({ heading: "Original thesis", body: [archived.originalThesis] });
    if (archived.whatChanged)
      sections.push({ heading: "What changed", body: [archived.whatChanged] });
    if (archived.whyExited)
      sections.push({ heading: "Why the position was exited", body: [archived.whyExited] });
    if (archived.lesson)
      sections.push({ heading: "What it taught", body: [archived.lesson] });

    return {
      historical: true,
      exitedOn: archived.ownedTo,
      sections: sections.length
        ? sections
        : [
            {
              heading: "Historical position",
              body: [
                "This position has been exited. An archived record exists but contains no written analysis.",
              ],
            },
          ],
      charts: [],
    };
  }

  return {
    historical: true,
    sections: [
      {
        heading: "Historical position",
        body: [
          `${company.name} was held and has since been exited. A full written thesis was not archived for this position, so none is reproduced here — nothing has been reconstructed after the fact.`,
          "The decision history for this holding is preserved in the Decision Log, including the dated actions taken and the rationale recorded at the time.",
        ],
      },
    ],
    charts: [],
  };
}

/** Fully-assembled thesis: written content + computed charts + valuation. */
export function getThesis(ticker: string): CompanyThesis | undefined {
  const t = ticker.toUpperCase();
  const base = thesisEntries[t] ?? historicalFallback(t);
  if (!base) return undefined;

  // Closed positions get no charts or valuation panel.
  if (base.historical) {
    return { ...base, ticker: t, charts: [], valuation: undefined, dataThrough: undefined };
  }

  return {
    ...base,
    ticker: t,
    charts: buildCharts(t),
    valuation: base.valuation ?? manualValuation(t),
    dataThrough: base.dataThrough ?? dataThroughLabel(t),
  };
}

export function hasThesis(ticker: string): boolean {
  const t = ticker.toUpperCase();
  return Boolean(thesisEntries[t] ?? historicalFallback(t));
}
