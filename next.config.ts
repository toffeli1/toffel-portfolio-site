import type { NextConfig } from "next";
import { companies } from "./data/companies";

// Per-ticker legacy redirects. Safe to import data/companies here because it is
// a dependency-free module — no JSON, no React.
//
// Deliberately NOT a wildcard over /positions or /etfs: those namespaces still
// serve tickers with no entry in the registry (the dormant retail sleeve — MU,
// OUST, NVTS, FLY, QQQM, QTUM). A blanket rule would 404 every one of them.
// Registered companies get exactly one canonical public URL: /thesis/[ticker].
function legacyThesisRedirects() {
  return companies.flatMap((c) => [
    { source: `/positions/${c.ticker}`, destination: `/thesis/${c.ticker}`, permanent: true },
    { source: `/etfs/${c.ticker}`, destination: `/thesis/${c.ticker}`, permanent: true },
    { source: `/archive/${c.ticker}`, destination: `/thesis/${c.ticker}`, permanent: true },
  ]);
}

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/portfolio/roth-ira",
        destination: "/portfolio/investments",
        permanent: true,
      },
      ...legacyThesisRedirects(),
    ];
  },
};

export default nextConfig;
