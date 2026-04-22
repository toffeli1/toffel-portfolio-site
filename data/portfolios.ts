// ─── Sleeve / account metadata ────────────────────────────────────────────────
// Add a new entry here to add another sleeve.  The `slug` drives the URL at
// /portfolio/[slug].  The `type` controls which view component renders.

export type PortfolioType = "retail" | "roth-ira" | "etfs";

export interface Portfolio {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** One-sentence portfolio-construction role — how this sleeve functions within the total book. */
  role: string;
  type: PortfolioType;
  color: string;
  themes: string[];
}

export const portfolios: Portfolio[] = [
  {
    slug: "retail-with-friends",
    title: "Speculative Individual Stocks",
    subtitle: "Speculative thematic equity sleeve",
    description:
      "Concentrated thematic bets across AI infrastructure, defense autonomy, and energy transition.",
    role: "Primary expression of high-conviction themes. Carries the highest risk budget in the book.",
    type: "retail",
    color: "#1a3a5c",
    themes: ["AI", "Defense / Drone", "Energy"],
  },
  {
    slug: "roth-ira",
    title: "Roth IRA",
    subtitle: "Long-term retirement sleeve",
    description:
      "Blends core market exposure with compounders, thematic growth, and measured speculative positions.",
    role: "Long-duration compounders inside a tax-free wrapper. Low turnover by design.",
    type: "roth-ira",
    color: "#1a4a2e",
    themes: ["US", "Latin America", "International"],
  },
  {
    slug: "etfs",
    title: "ETFs",
    subtitle: "Core ETF sleeve",
    description:
      "Broad-market exposure centered on large-cap growth and semiconductors.",
    role: "Benchmark-aware core. Anchors total book risk and serves as a performance reference.",
    type: "etfs",
    color: "#8b2530",
    themes: ["Broad Market", "Semiconductors", "Large-cap Growth"],
  },
];

export function getPortfolio(slug: string): Portfolio | undefined {
  return portfolios.find((p) => p.slug === slug);
}
