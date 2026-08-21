// ─── Peer-similarity attribute table ──────────────────────────────────────────
// Structured business attributes for every holding plus a candidate universe of
// potential comparables. lib/peerSelection.ts scores these to CHOOSE peers —
// the peer lists on thesis pages are computed, not hand-written, so a peer can't
// drift out of sync with the reasoning behind it.
//
// Why attributes instead of a sector field: "sector: Technology" would make
// Mastercard a peer of Cerebras. What actually makes two companies comparable
// for valuation is the shape of the business — how it earns revenue, who pays,
// how much capital it consumes, and how diversified it is. Those are the axes
// below.
//
// `candidateOnly: true` means the company is not held; it exists here purely as
// a comparable. Nothing in the portfolio is derived from these entries.

export type BusinessModel =
  | "compute-infrastructure" // rents/sells compute capacity
  | "hyperscale-platform" // cloud + adjacent consumer/enterprise at huge scale
  | "subscription-software"
  | "ad-platform"
  | "payment-network"
  | "marketplace"
  | "insurer"
  | "power-generation"
  | "launch-and-space-systems"
  | "semiconductor"
  | "fund"; // ETF / trust

export type RevenueModel =
  | "consumption" // usage-metered
  | "subscription"
  | "transaction-fee"
  | "advertising"
  | "premiums"
  | "power-contract"
  | "product-sale"
  | "contract-milestone"
  | "fund-fee";

export type CustomerType =
  | "hyperscaler"
  | "ai-lab"
  | "enterprise"
  | "smb"
  | "consumer"
  | "government"
  | "utility"
  | "merchant-issuer";

export type GrowthProfile = "hyper" | "high" | "moderate" | "low";
export type MarginBand = "negative" | "thin" | "mid" | "high" | "very-high";

export interface CompanyProfile {
  ticker: string;
  name: string;
  candidateOnly?: boolean;
  businessModel: BusinessModel;
  revenueModel: RevenueModel;
  customerTypes: CustomerType[];
  /** What it actually sells. Free-form tags, intersected across companies. */
  products: string[];
  /** Demand pools it sells into. Drives "competes for the same spend". */
  endMarkets: string[];
  /** 1 = asset-light, 5 = extremely capital-hungry (fabs, reactors, GPU fleets). */
  capitalIntensity: 1 | 2 | 3 | 4 | 5;
  growth: GrowthProfile;
  grossMargin: MarginBand;
  operatingMargin: MarginBand;
  /** "us" | "latam" | "europe" | "global" | "emea" | "apac" */
  geography: string[];
  /** 1 = pure-play, 5 = highly diversified. Gates direct-peer eligibility. */
  diversification: 1 | 2 | 3 | 4 | 5;
}

export const companyProfiles: CompanyProfile[] = [
  // ── Held: AI infrastructure / neocloud ──────────────────────────────────
  {
    ticker: "NBIS", name: "Nebius Group",
    businessModel: "compute-infrastructure", revenueModel: "consumption",
    customerTypes: ["ai-lab", "enterprise"],
    products: ["gpu-cloud", "ai-training-capacity", "inference-capacity", "managed-ai-platform"],
    endMarkets: ["ai-training", "ai-inference", "cloud-infrastructure"],
    capitalIntensity: 5, growth: "hyper", grossMargin: "mid", operatingMargin: "negative",
    geography: ["europe", "global"], diversification: 1,
  },
  {
    ticker: "CBRS", name: "Cerebras Systems",
    businessModel: "compute-infrastructure", revenueModel: "consumption",
    customerTypes: ["ai-lab", "enterprise", "government"],
    products: ["ai-accelerator", "wafer-scale-chip", "inference-capacity", "ai-supercomputer"],
    endMarkets: ["ai-training", "ai-inference", "ai-silicon"],
    capitalIntensity: 4, growth: "hyper", grossMargin: "mid", operatingMargin: "negative",
    geography: ["us", "global"], diversification: 1,
  },

  // ── Held: hyperscale platforms ──────────────────────────────────────────
  {
    ticker: "AMZN", name: "Amazon.com",
    businessModel: "hyperscale-platform", revenueModel: "consumption",
    customerTypes: ["enterprise", "consumer", "smb", "ai-lab"],
    products: ["public-cloud", "ai-training-capacity", "inference-capacity", "ecommerce", "logistics", "advertising", "robotics"],
    endMarkets: ["cloud-infrastructure", "ai-training", "ai-inference", "retail", "digital-advertising"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "mid", operatingMargin: "mid",
    geography: ["global"], diversification: 5,
  },
  {
    ticker: "GOOGL", name: "Alphabet Class A",
    businessModel: "hyperscale-platform", revenueModel: "advertising",
    customerTypes: ["consumer", "enterprise", "smb", "ai-lab"],
    products: ["search", "public-cloud", "ai-training-capacity", "video-platform", "advertising", "autonomous-driving", "ai-models"],
    endMarkets: ["digital-advertising", "cloud-infrastructure", "ai-training", "autonomous-mobility"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "high", operatingMargin: "high",
    geography: ["global"], diversification: 5,
  },
  {
    ticker: "META", name: "Meta Platforms",
    businessModel: "ad-platform", revenueModel: "advertising",
    customerTypes: ["consumer", "smb", "enterprise"],
    products: ["social-network", "advertising", "ai-training-capacity", "ai-models", "messaging", "mixed-reality"],
    endMarkets: ["digital-advertising", "ai-training", "social-media"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "high", operatingMargin: "high",
    geography: ["global"], diversification: 3,
  },

  // ── Held: enterprise software ───────────────────────────────────────────
  {
    ticker: "NOW", name: "ServiceNow",
    businessModel: "subscription-software", revenueModel: "subscription",
    customerTypes: ["enterprise", "government"],
    products: ["workflow-automation", "itsm", "enterprise-platform", "ai-agents"],
    endMarkets: ["enterprise-software", "workflow-automation", "enterprise-ai"],
    capitalIntensity: 1, growth: "high", grossMargin: "very-high", operatingMargin: "mid",
    geography: ["global"], diversification: 2,
  },

  // ── Held: payments ──────────────────────────────────────────────────────
  {
    ticker: "MA", name: "Mastercard",
    businessModel: "payment-network", revenueModel: "transaction-fee",
    customerTypes: ["merchant-issuer", "enterprise", "consumer"],
    products: ["card-network", "cross-border-settlement", "value-added-services", "fraud-analytics"],
    endMarkets: ["payments", "cross-border-payments", "financial-infrastructure"],
    capitalIntensity: 1, growth: "moderate", grossMargin: "very-high", operatingMargin: "very-high",
    geography: ["global"], diversification: 2,
  },

  // ── Held: marketplace / emerging markets ────────────────────────────────
  {
    ticker: "MELI", name: "MercadoLibre",
    businessModel: "marketplace", revenueModel: "transaction-fee",
    customerTypes: ["consumer", "smb", "merchant-issuer"],
    products: ["ecommerce-marketplace", "digital-payments", "credit", "logistics", "advertising"],
    endMarkets: ["retail", "payments", "fintech-credit"],
    capitalIntensity: 3, growth: "high", grossMargin: "mid", operatingMargin: "mid",
    geography: ["latam"], diversification: 3,
  },

  // ── Held: healthcare ────────────────────────────────────────────────────
  {
    ticker: "UNH", name: "UnitedHealth Group",
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer", "enterprise", "government"],
    products: ["health-insurance", "pharmacy-benefits", "care-delivery", "health-analytics"],
    endMarkets: ["health-insurance", "healthcare-services"],
    capitalIntensity: 2, growth: "moderate", grossMargin: "thin", operatingMargin: "mid",
    geography: ["us"], diversification: 4,
  },
  {
    ticker: "OSCR", name: "Oscar Health",
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer", "smb"],
    products: ["health-insurance", "aca-marketplace-plans", "health-tech-platform"],
    endMarkets: ["health-insurance"],
    capitalIntensity: 1, growth: "high", grossMargin: "thin", operatingMargin: "thin",
    geography: ["us"], diversification: 1,
  },

  // ── Held: power ─────────────────────────────────────────────────────────
  {
    ticker: "CEG", name: "Constellation Energy",
    businessModel: "power-generation", revenueModel: "power-contract",
    customerTypes: ["utility", "enterprise", "hyperscaler", "government"],
    products: ["nuclear-generation", "carbon-free-ppa", "retail-power", "capacity-sales"],
    endMarkets: ["electricity", "data-center-power", "carbon-free-energy"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "mid", operatingMargin: "mid",
    geography: ["us"], diversification: 2,
  },

  // ── Held: space ─────────────────────────────────────────────────────────
  {
    ticker: "RKLB", name: "Rocket Lab",
    businessModel: "launch-and-space-systems", revenueModel: "contract-milestone",
    customerTypes: ["government", "enterprise"],
    products: ["small-launch", "medium-launch", "satellite-components", "spacecraft-manufacturing"],
    endMarkets: ["space-launch", "national-security-space", "satellite-manufacturing"],
    capitalIntensity: 4, growth: "high", grossMargin: "thin", operatingMargin: "negative",
    geography: ["us", "global"], diversification: 2,
  },
  {
    ticker: "ASTS", name: "AST SpaceMobile",
    businessModel: "launch-and-space-systems", revenueModel: "subscription",
    customerTypes: ["enterprise", "consumer", "government"],
    products: ["direct-to-device-satellite", "satellite-constellation", "carrier-wholesale"],
    endMarkets: ["satellite-connectivity", "mobile-telecom"],
    capitalIntensity: 5, growth: "hyper", grossMargin: "negative", operatingMargin: "negative",
    geography: ["us", "global"], diversification: 1,
  },

  // ══ Candidate universe (not held) ═══════════════════════════════════════

  // Neocloud / AI infrastructure
  {
    ticker: "CRWV", name: "CoreWeave", candidateOnly: true,
    businessModel: "compute-infrastructure", revenueModel: "consumption",
    customerTypes: ["ai-lab", "enterprise", "hyperscaler"],
    products: ["gpu-cloud", "ai-training-capacity", "inference-capacity", "managed-ai-platform"],
    endMarkets: ["ai-training", "ai-inference", "cloud-infrastructure"],
    capitalIntensity: 5, growth: "hyper", grossMargin: "mid", operatingMargin: "negative",
    geography: ["us", "global"], diversification: 1,
  },
  {
    ticker: "APLD", name: "Applied Digital", candidateOnly: true,
    businessModel: "compute-infrastructure", revenueModel: "consumption",
    customerTypes: ["ai-lab", "enterprise", "hyperscaler"],
    products: ["gpu-cloud", "ai-training-capacity", "datacenter-hosting"],
    endMarkets: ["ai-training", "cloud-infrastructure", "datacenter-capacity"],
    capitalIntensity: 5, growth: "hyper", grossMargin: "mid", operatingMargin: "negative",
    geography: ["us"], diversification: 1,
  },
  {
    ticker: "IREN", name: "IREN Limited", candidateOnly: true,
    businessModel: "compute-infrastructure", revenueModel: "consumption",
    customerTypes: ["ai-lab", "enterprise"],
    products: ["gpu-cloud", "ai-training-capacity", "datacenter-hosting", "bitcoin-mining"],
    endMarkets: ["ai-training", "datacenter-capacity", "cloud-infrastructure"],
    capitalIntensity: 5, growth: "hyper", grossMargin: "mid", operatingMargin: "thin",
    geography: ["us", "apac"], diversification: 2,
  },
  {
    ticker: "MSFT", name: "Microsoft", candidateOnly: true,
    businessModel: "hyperscale-platform", revenueModel: "subscription",
    customerTypes: ["enterprise", "consumer", "smb", "ai-lab"],
    products: ["public-cloud", "ai-training-capacity", "inference-capacity", "enterprise-platform", "workflow-automation", "ai-models"],
    endMarkets: ["cloud-infrastructure", "ai-training", "ai-inference", "enterprise-software"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "high", operatingMargin: "very-high",
    geography: ["global"], diversification: 5,
  },
  {
    ticker: "ORCL", name: "Oracle", candidateOnly: true,
    businessModel: "hyperscale-platform", revenueModel: "consumption",
    customerTypes: ["enterprise", "ai-lab", "government"],
    products: ["public-cloud", "ai-training-capacity", "enterprise-platform", "database"],
    endMarkets: ["cloud-infrastructure", "ai-training", "enterprise-software"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "high", operatingMargin: "high",
    geography: ["global"], diversification: 4,
  },
  {
    ticker: "NVDA", name: "NVIDIA", candidateOnly: true,
    businessModel: "semiconductor", revenueModel: "product-sale",
    customerTypes: ["hyperscaler", "ai-lab", "enterprise"],
    products: ["ai-accelerator", "gpu", "ai-supercomputer", "networking"],
    endMarkets: ["ai-silicon", "ai-training", "ai-inference"],
    capitalIntensity: 2, growth: "hyper", grossMargin: "very-high", operatingMargin: "very-high",
    geography: ["global"], diversification: 2,
  },
  {
    ticker: "AMD", name: "Advanced Micro Devices", candidateOnly: true,
    businessModel: "semiconductor", revenueModel: "product-sale",
    customerTypes: ["hyperscaler", "enterprise", "consumer"],
    products: ["ai-accelerator", "gpu", "cpu"],
    endMarkets: ["ai-silicon", "ai-training", "computing"],
    capitalIntensity: 2, growth: "high", grossMargin: "high", operatingMargin: "mid",
    geography: ["global"], diversification: 3,
  },

  // Enterprise software
  {
    ticker: "CRM", name: "Salesforce", candidateOnly: true,
    businessModel: "subscription-software", revenueModel: "subscription",
    customerTypes: ["enterprise", "smb"],
    products: ["enterprise-platform", "workflow-automation", "crm", "ai-agents"],
    endMarkets: ["enterprise-software", "workflow-automation", "enterprise-ai"],
    capitalIntensity: 1, growth: "moderate", grossMargin: "very-high", operatingMargin: "mid",
    geography: ["global"], diversification: 2,
  },
  {
    ticker: "WDAY", name: "Workday", candidateOnly: true,
    businessModel: "subscription-software", revenueModel: "subscription",
    customerTypes: ["enterprise", "government"],
    products: ["enterprise-platform", "workflow-automation", "hcm", "ai-agents"],
    endMarkets: ["enterprise-software", "workflow-automation"],
    capitalIntensity: 1, growth: "high", grossMargin: "very-high", operatingMargin: "mid",
    geography: ["global"], diversification: 1,
  },
  {
    ticker: "SNOW", name: "Snowflake", candidateOnly: true,
    businessModel: "subscription-software", revenueModel: "consumption",
    customerTypes: ["enterprise"],
    products: ["data-platform", "enterprise-platform", "ai-agents"],
    endMarkets: ["enterprise-software", "enterprise-ai", "data-infrastructure"],
    capitalIntensity: 1, growth: "high", grossMargin: "high", operatingMargin: "negative",
    geography: ["global"], diversification: 1,
  },

  // Payments
  {
    ticker: "V", name: "Visa", candidateOnly: true,
    businessModel: "payment-network", revenueModel: "transaction-fee",
    customerTypes: ["merchant-issuer", "enterprise", "consumer"],
    products: ["card-network", "cross-border-settlement", "value-added-services", "fraud-analytics"],
    endMarkets: ["payments", "cross-border-payments", "financial-infrastructure"],
    capitalIntensity: 1, growth: "moderate", grossMargin: "very-high", operatingMargin: "very-high",
    geography: ["global"], diversification: 2,
  },
  {
    ticker: "AXP", name: "American Express", candidateOnly: true,
    businessModel: "payment-network", revenueModel: "transaction-fee",
    customerTypes: ["consumer", "merchant-issuer", "smb"],
    products: ["card-network", "cross-border-settlement", "lending", "premium-cards"],
    endMarkets: ["payments", "consumer-credit", "financial-infrastructure"],
    capitalIntensity: 2, growth: "moderate", grossMargin: "high", operatingMargin: "high",
    geography: ["global"], diversification: 3,
  },
  {
    ticker: "PYPL", name: "PayPal", candidateOnly: true,
    businessModel: "payment-network", revenueModel: "transaction-fee",
    customerTypes: ["consumer", "smb", "merchant-issuer"],
    products: ["digital-payments", "checkout", "cross-border-settlement"],
    endMarkets: ["payments", "cross-border-payments"],
    capitalIntensity: 1, growth: "low", grossMargin: "high", operatingMargin: "high",
    geography: ["global"], diversification: 2,
  },

  // Marketplaces / LatAm
  {
    ticker: "SE", name: "Sea Limited", candidateOnly: true,
    businessModel: "marketplace", revenueModel: "transaction-fee",
    customerTypes: ["consumer", "smb"],
    products: ["ecommerce-marketplace", "digital-payments", "credit", "gaming"],
    endMarkets: ["retail", "payments", "fintech-credit"],
    capitalIntensity: 2, growth: "high", grossMargin: "mid", operatingMargin: "mid",
    geography: ["apac"], diversification: 3,
  },
  {
    ticker: "NU", name: "Nu Holdings", candidateOnly: true,
    businessModel: "marketplace", revenueModel: "transaction-fee",
    customerTypes: ["consumer", "smb"],
    products: ["digital-banking", "credit", "digital-payments"],
    endMarkets: ["payments", "fintech-credit"],
    capitalIntensity: 1, growth: "high", grossMargin: "mid", operatingMargin: "mid",
    geography: ["latam"], diversification: 2,
  },
  {
    ticker: "GLOB", name: "Globant", candidateOnly: true,
    businessModel: "subscription-software", revenueModel: "subscription",
    customerTypes: ["enterprise"],
    products: ["it-services", "enterprise-platform"],
    endMarkets: ["enterprise-software"],
    capitalIntensity: 1, growth: "moderate", grossMargin: "mid", operatingMargin: "mid",
    geography: ["latam"], diversification: 1,
  },

  // Health insurers
  {
    ticker: "ELV", name: "Elevance Health", candidateOnly: true,
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer", "enterprise", "government"],
    products: ["health-insurance", "pharmacy-benefits", "care-delivery"],
    endMarkets: ["health-insurance", "healthcare-services"],
    capitalIntensity: 2, growth: "moderate", grossMargin: "thin", operatingMargin: "mid",
    geography: ["us"], diversification: 3,
  },
  {
    ticker: "CI", name: "The Cigna Group", candidateOnly: true,
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer", "enterprise", "government"],
    products: ["health-insurance", "pharmacy-benefits"],
    endMarkets: ["health-insurance", "healthcare-services"],
    capitalIntensity: 2, growth: "moderate", grossMargin: "thin", operatingMargin: "mid",
    geography: ["us"], diversification: 3,
  },
  {
    ticker: "CNC", name: "Centene", candidateOnly: true,
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer", "government"],
    products: ["health-insurance", "medicaid-plans", "aca-marketplace-plans"],
    endMarkets: ["health-insurance"],
    capitalIntensity: 1, growth: "moderate", grossMargin: "thin", operatingMargin: "thin",
    geography: ["us"], diversification: 2,
  },
  {
    ticker: "HUM", name: "Humana", candidateOnly: true,
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer", "government"],
    products: ["health-insurance", "medicare-advantage", "care-delivery"],
    endMarkets: ["health-insurance", "healthcare-services"],
    capitalIntensity: 2, growth: "moderate", grossMargin: "thin", operatingMargin: "thin",
    geography: ["us"], diversification: 2,
  },
  {
    ticker: "ALHC", name: "Alignment Healthcare", candidateOnly: true,
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer"],
    products: ["health-insurance", "medicare-advantage", "health-tech-platform"],
    endMarkets: ["health-insurance"],
    capitalIntensity: 1, growth: "high", grossMargin: "thin", operatingMargin: "thin",
    geography: ["us"], diversification: 1,
  },
  {
    ticker: "CLOV", name: "Clover Health", candidateOnly: true,
    businessModel: "insurer", revenueModel: "premiums",
    customerTypes: ["consumer"],
    products: ["health-insurance", "medicare-advantage", "health-tech-platform"],
    endMarkets: ["health-insurance"],
    capitalIntensity: 1, growth: "high", grossMargin: "thin", operatingMargin: "thin",
    geography: ["us"], diversification: 1,
  },

  // Power
  {
    ticker: "VST", name: "Vistra", candidateOnly: true,
    businessModel: "power-generation", revenueModel: "power-contract",
    customerTypes: ["utility", "enterprise", "hyperscaler", "consumer"],
    products: ["nuclear-generation", "gas-generation", "retail-power", "capacity-sales"],
    endMarkets: ["electricity", "data-center-power", "carbon-free-energy"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "mid", operatingMargin: "mid",
    geography: ["us"], diversification: 2,
  },
  {
    ticker: "TLN", name: "Talen Energy", candidateOnly: true,
    businessModel: "power-generation", revenueModel: "power-contract",
    customerTypes: ["utility", "hyperscaler", "enterprise"],
    products: ["nuclear-generation", "carbon-free-ppa", "capacity-sales"],
    endMarkets: ["electricity", "data-center-power", "carbon-free-energy"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "mid", operatingMargin: "mid",
    geography: ["us"], diversification: 1,
  },
  {
    ticker: "NRG", name: "NRG Energy", candidateOnly: true,
    businessModel: "power-generation", revenueModel: "power-contract",
    customerTypes: ["utility", "consumer", "enterprise"],
    products: ["gas-generation", "retail-power", "capacity-sales"],
    endMarkets: ["electricity", "data-center-power"],
    capitalIntensity: 4, growth: "moderate", grossMargin: "mid", operatingMargin: "mid",
    geography: ["us"], diversification: 3,
  },
  {
    ticker: "GEV", name: "GE Vernova", candidateOnly: true,
    businessModel: "power-generation", revenueModel: "product-sale",
    customerTypes: ["utility", "government", "enterprise"],
    products: ["turbines", "grid-equipment", "wind-equipment"],
    endMarkets: ["electricity", "carbon-free-energy", "grid-infrastructure"],
    capitalIntensity: 3, growth: "moderate", grossMargin: "mid", operatingMargin: "mid",
    geography: ["global"], diversification: 3,
  },

  // Space
  {
    ticker: "LMT", name: "Lockheed Martin", candidateOnly: true,
    businessModel: "launch-and-space-systems", revenueModel: "contract-milestone",
    customerTypes: ["government"],
    products: ["spacecraft-manufacturing", "satellite-components", "defense-systems"],
    endMarkets: ["national-security-space", "defense"],
    capitalIntensity: 3, growth: "low", grossMargin: "thin", operatingMargin: "mid",
    geography: ["us", "global"], diversification: 5,
  },
  {
    ticker: "FIREFLY", name: "Firefly Aerospace", candidateOnly: true,
    businessModel: "launch-and-space-systems", revenueModel: "contract-milestone",
    customerTypes: ["government", "enterprise"],
    products: ["small-launch", "spacecraft-manufacturing", "lunar-landers"],
    endMarkets: ["space-launch", "national-security-space"],
    capitalIntensity: 4, growth: "high", grossMargin: "thin", operatingMargin: "negative",
    geography: ["us"], diversification: 1,
  },
  {
    ticker: "PL", name: "Planet Labs", candidateOnly: true,
    businessModel: "launch-and-space-systems", revenueModel: "subscription",
    customerTypes: ["government", "enterprise"],
    products: ["satellite-constellation", "earth-imagery", "satellite-components"],
    endMarkets: ["satellite-connectivity", "national-security-space"],
    capitalIntensity: 4, growth: "moderate", grossMargin: "mid", operatingMargin: "negative",
    geography: ["us", "global"], diversification: 1,
  },
  {
    ticker: "IRDM", name: "Iridium Communications", candidateOnly: true,
    businessModel: "launch-and-space-systems", revenueModel: "subscription",
    customerTypes: ["enterprise", "government", "consumer"],
    products: ["satellite-constellation", "direct-to-device-satellite", "carrier-wholesale"],
    endMarkets: ["satellite-connectivity", "mobile-telecom"],
    capitalIntensity: 4, growth: "low", grossMargin: "high", operatingMargin: "mid",
    geography: ["global"], diversification: 1,
  },
  {
    ticker: "GSAT", name: "Globalstar", candidateOnly: true,
    businessModel: "launch-and-space-systems", revenueModel: "subscription",
    customerTypes: ["enterprise", "consumer"],
    products: ["satellite-constellation", "direct-to-device-satellite", "carrier-wholesale"],
    endMarkets: ["satellite-connectivity", "mobile-telecom"],
    capitalIntensity: 5, growth: "moderate", grossMargin: "mid", operatingMargin: "thin",
    geography: ["global"], diversification: 1,
  },
];

const BY_TICKER = new Map(companyProfiles.map((p) => [p.ticker, p]));

export function getProfile(ticker: string): CompanyProfile | undefined {
  return BY_TICKER.get(ticker.toUpperCase());
}
