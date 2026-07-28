// ─── Sleeve / account metadata ────────────────────────────────────────────────
// Add a new entry here to add another sleeve.  The `slug` drives the URL at
// /portfolio/[slug].  The `type` controls which view component renders.
//
// The former "retail-with-friends" (Individual Brokerage / 2027 Roth Fund)
// entry has been removed so the site shows exactly one account. Its component
// (RetailView in app/portfolio/[slug]/page.tsx) and data files
// (data/holdings.ts, data/sleeveTheses.ts) remain in the repo, unreferenced.

export type PortfolioType = "retail" | "investments";

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
    slug: "investments",
    title: "Investments",
    subtitle: "Long-Term Compounding",
    description:
      "Blends core market exposure with compounders, thematic growth, and measured speculative positions.",
    role: "Long-duration compounders held with low turnover by design.",
    type: "investments",
    color: "#1a4a2e",
    themes: ["US", "Latin America", "International"],
  },
];

export function getPortfolio(slug: string): Portfolio | undefined {
  return portfolios.find((p) => p.slug === slug);
}
