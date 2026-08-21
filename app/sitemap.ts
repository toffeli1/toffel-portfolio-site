import type { MetadataRoute } from "next";
import { previousHoldings } from "@/data/previousHoldings";
import { portfolios } from "@/data/portfolios";
import { thesisTickers } from "@/lib/routes";
import { getCompany } from "@/data/companies";

const BASE_URL = "https://toffelcapital.com";

// Canonical company URL is /thesis/[ticker]. /positions/*, /etfs/* and
// /archive/* still resolve for legacy links, but they are intentionally left
// out of the sitemap for any ticker that now has a thesis page — listing both
// would advertise two URLs for the same content.

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/performance`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/decision-log`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/performance/historical`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const portfolioEntries: MetadataRoute.Sitemap = portfolios.map((p) => ({
    url: `${BASE_URL}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Active holdings rank above exited ones — the latter are historical records.
  const thesisEntries: MetadataRoute.Sitemap = thesisTickers().map((ticker) => ({
    url: `${BASE_URL}/thesis/${ticker}`,
    lastModified: now,
    changeFrequency: getCompany(ticker)?.status === "active" ? "monthly" : "yearly",
    priority: getCompany(ticker)?.status === "active" ? 0.6 : 0.4,
  }));

  // Older exited names that predate the company registry still live only at
  // /archive/[ticker], so they stay listed until they're folded in.
  const legacyArchive: MetadataRoute.Sitemap = previousHoldings
    .filter((h) => !getCompany(h.ticker))
    .map((h) => ({
      url: `${BASE_URL}/archive/${h.ticker}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    }));

  return [...staticEntries, ...portfolioEntries, ...thesisEntries, ...legacyArchive];
}
