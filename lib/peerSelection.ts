// ─── Peer selection ───────────────────────────────────────────────────────────
// Chooses comparables by scoring business similarity, rather than assigning
// companies to a broad sector bucket. Pure functions over data/peerAttributes.ts,
// so every peer shown on a thesis page can be traced to the attributes that
// earned it a place.
//
// Two outputs, and the distinction matters for valuation:
//
//   Direct peers          — similar enough that comparing multiples is
//                           meaningful. Only these feed the peer-average P/E.
//   Strategic competitors — chasing the same customers or the same budget, but
//                           too diversified for their multiple to say anything
//                           about the holding. Shown, never averaged.
//
// The classic failure this prevents: putting Microsoft and Amazon in a GPU-cloud
// peer average. They are the most important competitors Nebius has, and their
// ~30x blended multiples describe a completely different financial object.

import {
  companyProfiles,
  getProfile,
  type CompanyProfile,
} from "@/data/peerAttributes";

// ── Scoring weights ──────────────────────────────────────────────────────────
// Sum to 1.0. Business/revenue model and product overlap dominate, because they
// determine whether two P/Es are measuring comparable earnings streams.
const WEIGHTS = {
  businessModel: 0.20,
  revenueModel: 0.15,
  products: 0.18,
  endMarkets: 0.12,
  customerTypes: 0.10,
  capitalIntensity: 0.10,
  growth: 0.06,
  margins: 0.06,
  geography: 0.03,
} as const;

/** Similarity above this is a candidate for direct-peer status. */
const DIRECT_THRESHOLD = 0.55;
/** Overlap on demand pools above this makes something a strategic competitor. */
const STRATEGIC_MARKET_OVERLAP = 0.28;
/**
 * A peer this much more diversified than the holding is disqualified from the
 * direct set no matter how well it scores — a conglomerate's multiple is not a
 * clean read on a pure-play.
 */
const MAX_DIVERSIFICATION_GAP = 2;

const MAX_DIRECT = 5;
const MAX_STRATEGIC = 4;

// ── Similarity primitives ────────────────────────────────────────────────────

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

const GROWTH_RANK: Record<CompanyProfile["growth"], number> = {
  low: 0, moderate: 1, high: 2, hyper: 3,
};

const MARGIN_RANK: Record<CompanyProfile["grossMargin"], number> = {
  negative: 0, thin: 1, mid: 2, high: 3, "very-high": 4,
};

/** 1.0 for identical, decaying linearly with ordinal distance. */
function ordinalCloseness(a: number, b: number, span: number): number {
  return Math.max(0, 1 - Math.abs(a - b) / span);
}

export interface SimilarityBreakdown {
  businessModel: number;
  revenueModel: number;
  products: number;
  endMarkets: number;
  customerTypes: number;
  capitalIntensity: number;
  growth: number;
  margins: number;
  geography: number;
}

export function similarityBreakdown(
  a: CompanyProfile,
  b: CompanyProfile
): SimilarityBreakdown {
  return {
    businessModel: a.businessModel === b.businessModel ? 1 : 0,
    revenueModel: a.revenueModel === b.revenueModel ? 1 : 0,
    products: jaccard(a.products, b.products),
    endMarkets: jaccard(a.endMarkets, b.endMarkets),
    customerTypes: jaccard(a.customerTypes, b.customerTypes),
    capitalIntensity: ordinalCloseness(a.capitalIntensity, b.capitalIntensity, 4),
    growth: ordinalCloseness(GROWTH_RANK[a.growth], GROWTH_RANK[b.growth], 3),
    margins:
      (ordinalCloseness(MARGIN_RANK[a.grossMargin], MARGIN_RANK[b.grossMargin], 4) +
        ordinalCloseness(
          MARGIN_RANK[a.operatingMargin],
          MARGIN_RANK[b.operatingMargin],
          4
        )) /
      2,
    geography: jaccard(a.geography, b.geography),
  };
}

export function similarityScore(a: CompanyProfile, b: CompanyProfile): number {
  const s = similarityBreakdown(a, b);
  return (
    s.businessModel * WEIGHTS.businessModel +
    s.revenueModel * WEIGHTS.revenueModel +
    s.products * WEIGHTS.products +
    s.endMarkets * WEIGHTS.endMarkets +
    s.customerTypes * WEIGHTS.customerTypes +
    s.capitalIntensity * WEIGHTS.capitalIntensity +
    s.growth * WEIGHTS.growth +
    s.margins * WEIGHTS.margins +
    s.geography * WEIGHTS.geography
  );
}

// ── Classification ───────────────────────────────────────────────────────────

export interface ScoredPeer {
  ticker: string;
  name: string;
  /** 0-1 similarity. Rendered as a percentage on the page. */
  score: number;
  /** The two or three attributes that contributed most — shown as chips. */
  drivers: string[];
  /** Why a well-scoring company was pushed to the strategic bucket. */
  excludedFromValuation?: string;
}

export interface PeerSet {
  direct: ScoredPeer[];
  strategic: ScoredPeer[];
  /** One-line, generated explanation of how this set was chosen. */
  method: string;
}

const DRIVER_LABELS: Record<keyof SimilarityBreakdown, string> = {
  businessModel: "same business model",
  revenueModel: "same revenue model",
  products: "overlapping products",
  endMarkets: "same end markets",
  customerTypes: "same customer type",
  capitalIntensity: "similar capital intensity",
  growth: "similar growth profile",
  margins: "similar margin profile",
  geography: "similar geographic exposure",
};

function topDrivers(a: CompanyProfile, b: CompanyProfile, n = 3): string[] {
  const s = similarityBreakdown(a, b);
  return (Object.keys(s) as (keyof SimilarityBreakdown)[])
    .map((k) => ({ k, contribution: s[k] * WEIGHTS[k] }))
    .filter((x) => x.contribution > 0.02)
    .sort((x, y) => y.contribution - x.contribution)
    .slice(0, n)
    .map((x) => DRIVER_LABELS[x.k]);
}

/**
 * Select direct peers and strategic competitors for a ticker.
 * Returns empty sets when the ticker has no attribute profile (ETFs, trusts).
 */
export function selectPeers(ticker: string): PeerSet {
  const self = getProfile(ticker);
  if (!self) {
    return {
      direct: [],
      strategic: [],
      method: "No peer profile — comparable analysis not applicable.",
    };
  }

  const direct: ScoredPeer[] = [];
  const strategic: ScoredPeer[] = [];

  for (const other of companyProfiles) {
    if (other.ticker === self.ticker) continue;

    const score = similarityScore(self, other);
    const marketOverlap = jaccard(self.endMarkets, other.endMarkets);
    const customerOverlap = jaccard(self.customerTypes, other.customerTypes);
    const diversificationGap = other.diversification - self.diversification;

    const drivers = topDrivers(self, other);

    // A company can clear the similarity bar and still be a bad comp because it
    // is far more diversified. Route those to strategic instead of dropping
    // them — they are usually the most important competitors.
    if (score >= DIRECT_THRESHOLD && diversificationGap <= MAX_DIVERSIFICATION_GAP) {
      direct.push({ ticker: other.ticker, name: other.name, score, drivers });
      continue;
    }

    // Strategic status requires overlapping END MARKETS — competing for the
    // same demand pool. Shared customer *type* is far too loose on its own:
    // "sells to enterprises and governments" would make Planet Labs a
    // competitor of ServiceNow. Customer overlap only reinforces a market
    // overlap that already exists.
    const competesForSameSpend =
      marketOverlap >= STRATEGIC_MARKET_OVERLAP ||
      (marketOverlap > 0 && customerOverlap >= 0.5);

    if (competesForSameSpend) {
      strategic.push({
        ticker: other.ticker,
        name: other.name,
        score,
        drivers,
        excludedFromValuation:
          diversificationGap > MAX_DIVERSIFICATION_GAP
            ? "Too diversified for a clean multiple comparison"
            : "Competes for the same demand, but a different financial profile",
      });
    }
  }

  direct.sort((a, b) => b.score - a.score);
  strategic.sort((a, b) => b.score - a.score);

  const trimmedDirect = direct.slice(0, MAX_DIRECT);
  const trimmedStrategic = strategic.slice(0, MAX_STRATEGIC);

  return {
    direct: trimmedDirect,
    strategic: trimmedStrategic,
    method:
      `Selected by weighted similarity across business model, revenue model, products, ` +
      `end markets, customer type, capital intensity, growth, margins and geography. ` +
      `Direct peers score ≥${Math.round(DIRECT_THRESHOLD * 100)}% and sit within ` +
      `${MAX_DIVERSIFICATION_GAP} diversification steps; only they feed the peer average.`,
  };
}

/**
 * Mean forward P/E across direct peers that have one. Strategic competitors are
 * excluded by construction — they never reach this function.
 */
export function directPeerAverageForwardPE(
  peers: ScoredPeer[],
  forwardPEByTicker: Record<string, number | undefined>
): { average: number; sampleSize: number; used: string[] } | undefined {
  const used: string[] = [];
  let sum = 0;
  for (const p of peers) {
    const pe = forwardPEByTicker[p.ticker];
    if (typeof pe === "number" && isFinite(pe) && pe > 0) {
      sum += pe;
      used.push(p.ticker);
    }
  }
  if (used.length === 0) return undefined;
  return { average: sum / used.length, sampleSize: used.length, used };
}
