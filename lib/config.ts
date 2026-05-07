// ─── Site-wide config ────────────────────────────────────────────────────────
// Update this date when you refresh holdings, weights, or returnPct values.

export const PORTFOLIO_UPDATED_AT = "2026-05-06";

export function fmtPortfolioDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
