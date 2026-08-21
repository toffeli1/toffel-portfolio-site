// ─── Shared routing ───────────────────────────────────────────────────────────
// ONE resolver for "where does this ticker's research page live". Investments,
// the Decision Log, Performance and the sitemap all call thesisHref() so a link
// can never diverge between surfaces — which is exactly what happened when each
// component decided between /positions, /etfs and /archive on its own.
//
// Canonical thesis route: /thesis/[ticker], for active AND exited names alike.
// The legacy /positions/*, /etfs/* and /archive/* URLs still resolve — they
// permanently redirect to /thesis/* via next.config.ts — so nothing that was
// already indexed or linked breaks.

import { getCompany, companies, type Company } from "@/data/companies";
import { hasThesis } from "@/data/thesis";

/** Canonical research-page URL for a ticker. */
export function thesisHref(ticker: string): string {
  return `/thesis/${ticker.toUpperCase()}`;
}

/**
 * thesisHref, but only when there is actually a page worth opening.
 * Returns undefined for tickers with no thesis content, so callers can render
 * plain text instead of a link into an empty page.
 */
export function thesisHrefIfPublished(ticker: string): string | undefined {
  const t = ticker.toUpperCase();
  return hasThesis(t) ? thesisHref(t) : undefined;
}

/** Every ticker that should get a statically-generated thesis page. */
export function thesisTickers(): string[] {
  return companies.filter((c) => hasThesis(c.ticker)).map((c) => c.ticker);
}

/**
 * Tickers eligible for *active* thesis navigation. Exited names are excluded on
 * purpose: their pages stay reachable, but only through the Decision Log.
 */
export function activeThesisTickers(): string[] {
  return companies
    .filter((c) => c.status === "active" && hasThesis(c.ticker))
    .map((c) => c.ticker);
}

export function isExited(ticker: string): boolean {
  return getCompany(ticker)?.status === "exited";
}

/** Company record plus its resolved link, for list/table rendering. */
export interface LinkedCompany extends Company {
  href?: string;
}

export function linkedCompany(ticker: string): LinkedCompany | undefined {
  const c = getCompany(ticker);
  if (!c) return undefined;
  return { ...c, href: thesisHrefIfPublished(c.ticker) };
}
