// ─── Thesis content model ─────────────────────────────────────────────────────
// Active thesis pages are CURRENT-STATE documents. When the thesis changes,
// rewrite the entry — do not append a new version and do not keep the old prose
// around. Evolution over time is the Decision Log's job, not this file's.
//
// Two rules this model exists to enforce:
//
//  1. NO UNIVERSAL TEMPLATE. `sections` is an ordered, free-form list whose
//     headings are chosen per company. A payments network and a GPU cloud do
//     not get the same analytical skeleton. There is deliberately no
//     `whyIOwnIt` field and no `bull/base/bear` triple — the previous model had
//     both and every page came out shaped identically.
//
//  2. NO BOLT-ON RISK SECTION. There is no `risks: string[]`. Risk belongs
//     inside the section that raises the opportunity, so the page reads as
//     balanced analysis rather than a pitch followed by a disclaimer. Sections
//     that carry the counter-argument set `weighsRisk` — surfaced only as an
//     editorial checklist in dev, never rendered.
//
// PRIVACY: no share counts, no prices (entry, average, current), no position
// returns. Portfolio weight is the only position-level number allowed here.

export type MetricUnit =
  | "usd_b" // billions of USD
  | "usd_m" // millions of USD
  | "pct" // already a percentage, e.g. 42.1 → 42.1%
  | "x" // a multiple, e.g. 24.5x
  | "count"; // launches, satellites, customers

export type SourceKind =
  | "sec" // pulled from SEC XBRL by scripts/fetchFundamentals.ts
  | "filing" // read out of a filing/press release by hand
  | "ir" // investor-relations deck or shareholder letter
  | "manual"; // maintained by hand (forward P/E, non-US filers)

export interface DataPoint {
  /** Fiscal label as reported: "Q2 2026", "FY2025". */
  period: string;
  value: number;
  /** Marks a company-guided or consensus figure rather than a reported one. */
  estimate?: boolean;
}

export interface MetricSeries {
  /** Chart title. Must name the metric precisely — "Cloud revenue", not "Revenue". */
  label: string;
  unit: MetricUnit;
  points: DataPoint[];
  source: SourceKind;
  /** Freshness stamp, e.g. "Financial data through Q2 2026". */
  dataThrough: string;
  /** Any definition caveat a reader needs to compare the series honestly. */
  note?: string;
}

export interface ThesisSection {
  heading: string;
  /** Paragraphs. Each string renders as its own <p>. */
  body: string[];
  /** True when this section argues the bear side as well as the bull side. */
  weighsRisk?: boolean;
  /** True for an unwritten section awaiting Isaac's actual answer. Never
   *  rendered in production; shown with a dashed dev-only treatment locally
   *  so an empty prompt never ships as if it were finished analysis. */
  isPlaceholder?: boolean;
}

/** Forward P/E history for the company itself — the "vs its own past" comparison. */
export interface ValuationHistoryPoint {
  /** "Aug 2025", "FY2024 avg" — whatever the maintained series is keyed on. */
  period: string;
  forwardPE: number;
}

export interface Valuation {
  /** Current forward P/E. Manually maintained — no paid data feed. */
  forwardPE?: number;
  /** The company's own forward-P/E history, for the self-comparison chart. */
  history?: ValuationHistoryPoint[];
  /** When the valuation inputs were last refreshed, e.g. "August 2026". */
  updated: string;
  /** Why a P/E is absent or not the right lens (pre-profit, trust, fund). */
  notApplicableReason?: string;
  /** Multiple actually used when earnings are not the right basis. */
  alternate?: { label: string; value: number; note?: string };
}

export interface CompanyThesis {
  ticker: string;
  /**
   * Optional one-line thesis headline. Left undefined on purpose for companies
   * where a slogan would add nothing — the spec says not to force one.
   */
  headline?: string;
  /** Ordered analytical sections, adapted to this specific business. */
  sections: ThesisSection[];
  /** Charts chosen for this business. Empty is valid (e.g. a cash ETF). */
  charts: MetricSeries[];
  valuation?: Valuation;
  /** Freshness line for the reported-financials block. */
  dataThrough?: string;
  /** Set for exited names: this page is a historical record, not current research. */
  historical?: boolean;
  /** For a historical page, when the position was closed. */
  exitedOn?: string;
}
