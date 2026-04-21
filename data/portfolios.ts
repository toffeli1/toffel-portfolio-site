// ─── Sleeve / account metadata ────────────────────────────────────────────────
// Add a new entry here to add another sleeve.  The `slug` drives the URL at
// /portfolio/[slug].  The `type` controls which view component renders.

export type PortfolioType = "retail" | "roth-ira" | "etfs";

export interface Portfolio {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  type: PortfolioType;
  color: string;
  themes: string[];
}

export const portfolios: Portfolio[] = [
  {
    slug: "retail-with-friends",
    title: "Retail with Friends",
    subtitle: "Thematic equity portfolio",
    description:
      "Concentrated thematic bets across AI infrastructure, defense autonomy, and energy transition. High-conviction positions with asymmetric upside.",
    type: "retail",
    color: "#1a3a5c",
    themes: ["AI", "Defense / Drone", "Energy"],
  },
  {
    slug: "roth-ira",
    title: "Roth IRA",
    subtitle: "Long-term retirement sleeve",
    description:
      "Long-term retirement sleeve blending core market exposure, compounders, thematic growth, and select speculative positions.",
    type: "roth-ira",
    color: "#1a4a2e",
    themes: ["US", "Latin America", "International"],
  },
  {
    slug: "etfs",
    title: "ETFs",
    subtitle: "Core ETF sleeve",
    description:
      "Core ETF sleeve centered on broad-market exposure, large-cap growth, and semiconductors.",
    type: "etfs",
    color: "#8b2530",
    themes: ["Broad Market", "Semiconductors", "Large-cap Growth"],
  },
];

export function getPortfolio(slug: string): Portfolio | undefined {
  return portfolios.find((p) => p.slug === slug);
}
