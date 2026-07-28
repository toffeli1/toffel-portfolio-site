import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/portfolio/roth-ira",
        destination: "/portfolio/investments",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
