// ─── Manually-maintained fundamentals ─────────────────────────────────────────
// Everything free automation can't reach reliably. Reliability beats coverage:
// a metric that is wrong half the time is worse than a metric marked pending.
//
// WHY EACH ENTRY IS MANUAL
//
//   forwardPE        — a consensus estimate, not a reported fact. It appears in
//                      no filing, and every free source for it is either a
//                      scrape or a paid feed. Maintained here by hand.
//   NBIS metrics     — Nebius files as a foreign private issuer; its 20-F
//                      carries no usable US-GAAP quarterly tags, so
//                      scripts/fetchFundamentals.ts skips it entirely.
//   CBRS revenue     — IPO'd too recently to have a full annual + three
//                      quarters, so Q4 can't be derived and the contiguity
//                      gate rejects the series.
//   backlog / KPIs   — disclosed in prose or slides, not tagged in XBRL
//                      (compute backlog, launch cadence, TPV, cross-border
//                      volume). Read out of filings and IR decks by hand.
//   ETFs             — SMH, SGOV and GLDM are funds. No company financials, and
//                      an earnings multiple is not the right lens.
//
// ── FORWARD P/E IS INTENTIONALLY UNSET ───────────────────────────────────────
// The `forwardPE` fields below are deliberately left undefined rather than
// seeded with plausible-looking numbers. Inventing a multiple would put a
// fabricated figure on a public research page and silently corrupt the peer
// average that depends on it. The valuation UI renders an explicit "pending"
// state until a real value is entered here.
//
// To populate: set `forwardPE`, add a dated point to `history`, and bump
// `updated`. Peer multiples go in PEER_FORWARD_PE so the direct-peer average
// can compute. Sources that are free and citable: company guidance in the
// latest 10-Q/20-F, or the consensus figure printed on the company's own IR
// page. Record where it came from in `note`.

import type { MetricSeries, Valuation } from "../thesis/types";

/**
 * Company-level revenue basis, decided and documented rather than implicit.
 *
 * RULE: the primary company-level revenue series is TOTAL reported revenue, and
 * total revenue is also the denominator for company-level operating margin.
 * Applied uniformly, so no series ever switches basis between quarters and no
 * chart mixes the two definitions.
 *
 * Contract revenue may be added as a SEPARATELY LABELLED secondary metric where
 * it is analytically useful. It must never be spliced into the total-revenue
 * history.
 */
export const REVENUE_BASIS = {
  primary: "total-reported-revenue",
  marginDenominator: "total-reported-revenue",
  secondaryAllowed: "contract-revenue, only as its own labelled series",
} as const;

/**
 * Where a filer's tags make the basis choice consequential, the note explains
 * what was chosen and what the alternative would have shown. These are resolved
 * decisions, not open questions.
 */
export const REVENUE_BASIS_NOTES: Record<string, string> = {
  CEG:
    "Constellation reports both a broad `Revenues` total and a narrower " +
    "`RevenueFromContractWithCustomerExcludingAssessedTax`. For Q1 2026 these are " +
    "roughly $11.1B and $7.5B respectively; the gap is revenue earned outside " +
    "customer contracts, chiefly mark-to-market on energy derivatives. Per " +
    "REVENUE_BASIS, the total is used for both the revenue series and the " +
    "operating-margin denominator. Consequence to keep in mind when reading the " +
    "chart: margin on the total-revenue basis reads lower than it would on a " +
    "contract-revenue basis, because the denominator includes derivative revenue " +
    "that carries no comparable operating cost. A contract-revenue series may be " +
    "added later as its own labelled metric, but must not be merged into this one.",
  UNH:
    "Uses `Revenues` (total), which includes premiums plus product and service " +
    "revenue. Premiums earned are charted separately as their own labelled series " +
    "rather than substituted for total revenue.",
  OSCR:
    "Uses `Revenues` (total). The contract-revenue tag excludes insurance premiums " +
    "entirely and reported roughly $6M against ~$3B of real premium revenue, which " +
    "is why the total tag is mandatory for insurers.",
};

/** Forward P/E for holdings. Undefined = pending, and the UI says so. */
export const MANUAL_FORWARD_PE: Record<string, number | undefined> = {
  AMZN: undefined,
  GOOGL: undefined,
  META: undefined,
  NOW: undefined,
  MA: undefined,
  UNH: undefined,
  CEG: undefined,
  MELI: undefined,
  OSCR: undefined,
  NBIS: undefined, // pre-profit; see ALTERNATE_MULTIPLE
  CBRS: undefined, // pre-profit
  RKLB: undefined, // pre-profit
  ASTS: undefined, // pre-revenue at scale
};

/**
 * Forward P/E for peer companies, used only for the direct-peer average.
 * Same rule: unset until a real figure is recorded. An average computed from a
 * partially-filled set would be quietly misleading, so lib/peerSelection.ts
 * reports its own sample size and the UI shows which tickers were used.
 */
export const PEER_FORWARD_PE: Record<string, number | undefined> = {
  // Hyperscalers / platforms
  MSFT: undefined, ORCL: undefined,
  // Neoclouds
  CRWV: undefined, APLD: undefined, IREN: undefined,
  // Semis
  NVDA: undefined, AMD: undefined,
  // Enterprise software
  CRM: undefined, WDAY: undefined, SNOW: undefined, GLOB: undefined,
  // Payments
  V: undefined, AXP: undefined, PYPL: undefined,
  // Marketplaces
  SE: undefined, NU: undefined,
  // Insurers
  ELV: undefined, CI: undefined, HUM: undefined, CNC: undefined,
  ALHC: undefined, CLOV: undefined,
  // Power
  VST: undefined, TLN: undefined, NRG: undefined, GEV: undefined,
  // Space
  LMT: undefined, FIREFLY: undefined, PL: undefined, IRDM: undefined, GSAT: undefined,
};

/**
 * Where earnings aren't the right basis, the multiple that is. Also pending
 * until real figures are recorded — same no-fabrication rule.
 */
export const ALTERNATE_MULTIPLE: Record<
  string,
  { label: string; value?: number; note?: string } | undefined
> = {
  NBIS: { label: "EV / forward revenue", note: "Pre-profit; revenue multiple is the comparable basis against other neoclouds." },
  CBRS: { label: "EV / forward revenue", note: "Pre-profit; compared against AI-infrastructure peers on revenue." },
  RKLB: { label: "EV / forward revenue", note: "Pre-profit; Neutron is not yet contributing revenue." },
  ASTS: { label: "EV / forward revenue", note: "Pre-commercial-scale revenue; any multiple is highly assumption-dependent." },
  GLDM: { label: "Expense ratio", note: "A bullion trust has no earnings. Cost of carry is the meaningful number." },
  SGOV: { label: "30-day SEC yield", note: "A T-bill fund is held for yield and liquidity, not multiple expansion." },
  SMH: { label: "Fund forward P/E", note: "Weighted average of the underlying basket." },
};

/** Reason a P/E is structurally inapplicable, shown instead of a pending state. */
export const PE_NOT_APPLICABLE: Record<string, string | undefined> = {
  SGOV: "A Treasury-bill fund has no earnings to capitalise.",
  GLDM: "A physical gold trust has no earnings to capitalise.",
  SMH: "An index fund's multiple is a property of its basket, not of a business.",
  ASTS: "Not yet generating revenue at commercial scale.",
  RKLB: "Not yet profitable.",
  NBIS: "Not yet profitable.",
  CBRS: "Not yet profitable.",
  OSCR: "Earnings are early and volatile; the multiple swings on reserve development.",
};

/** When each holding's valuation inputs were last reviewed. */
export const VALUATION_UPDATED: Record<string, string> = {
  DEFAULT: "August 2026",
};

/**
 * Hand-maintained metric series. Keyed by ticker. These render alongside the
 * SEC-derived charts and are labelled with their source so a reader can tell
 * which is which.
 *
 * Left empty pending source data rather than populated with estimates. Each
 * entry below documents exactly which disclosure to read the numbers out of,
 * so filling them in is mechanical.
 */
export const MANUAL_SERIES: Record<string, MetricSeries[]> = {
  // Nebius: read from the 20-F and quarterly shareholder letters. The metrics
  // that matter for this thesis are ARR, contracted backlog and capacity —
  // none of which are XBRL-tagged.
  NBIS: [],
  // Cerebras: S-1/10-Q revenue plus disclosed customer concentration.
  CBRS: [],
  // Rocket Lab: launch cadence and backlog come from the 10-Q narrative and
  // quarterly decks, not from tagged financials.
  RKLB: [],
  // Mastercard: GDV and cross-border volume growth are in the quarterly
  // supplement, not in XBRL.
  MA: [],
  // Constellation: nuclear output (TWh) and contracted volumes come from the
  // 10-Q operating statistics tables.
  CEG: [],
};

/** Valuation block for a ticker, assembled from the maps above. */
export function manualValuation(ticker: string): Valuation {
  const t = ticker.toUpperCase();
  const alt = ALTERNATE_MULTIPLE[t];
  return {
    forwardPE: MANUAL_FORWARD_PE[t],
    updated: VALUATION_UPDATED[t] ?? VALUATION_UPDATED.DEFAULT,
    notApplicableReason: PE_NOT_APPLICABLE[t],
    alternate:
      alt && alt.value !== undefined
        ? { label: alt.label, value: alt.value, note: alt.note }
        : undefined,
  };
}
