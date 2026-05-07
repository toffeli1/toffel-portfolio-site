import type { MetadataRoute } from "next";
import { holdings } from "@/data/holdings";
import { rothIraHoldings } from "@/data/sleeveHoldings";
import { previousHoldings } from "@/data/previousHoldings";
import { portfolios } from "@/data/portfolios";
import { etfProfiles } from "@/data/etfConstituents";

const BASE_URL = "https://toffelcapital.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/analytics`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/decision-log`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const portfolioEntries: MetadataRoute.Sitemap = portfolios.map((p) => ({
    url: `${BASE_URL}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const positionTickers = new Set<string>([
    ...holdings.map((h) => h.ticker),
    ...rothIraHoldings.map((h) => h.ticker),
  ]);
  const positionEntries: MetadataRoute.Sitemap = [...positionTickers].map((ticker) => ({
    url: `${BASE_URL}/positions/${ticker}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const etfEntries: MetadataRoute.Sitemap = Object.keys(etfProfiles).map((ticker) => ({
    url: `${BASE_URL}/etfs/${ticker}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const archiveEntries: MetadataRoute.Sitemap = previousHoldings.map((h) => ({
    url: `${BASE_URL}/archive/${h.ticker}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticEntries, ...portfolioEntries, ...positionEntries, ...etfEntries, ...archiveEntries];
}
