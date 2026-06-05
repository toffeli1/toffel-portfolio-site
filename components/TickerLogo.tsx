"use client";

// Clean ticker logo. Renders a real brand image from /public/logos/ when the
// file is registered in TICKER_LOGO_ASSETS below; falls back to a uniform
// monogram if either the ticker is unmapped OR the image fails to load (404,
// network error, etc.). The fallback is silent — no broken-image icon.
//
// To enable a real logo for a ticker:
//   1. Drop the asset file into /public/logos/ (SVG preferred, PNG OK)
//   2. Confirm the path matches the value in TICKER_LOGO_ASSETS below
// No file changes needed when adding/removing assets — the mapping is the
// single point of truth and missing files just degrade gracefully.

import { useState } from "react";

const SIZE_MAP: Record<"sm" | "md" | "lg" | "xl", { box: number; font: number; radius: number }> = {
  sm: { box: 24, font: 8.5, radius: 6 },
  md: { box: 32, font: 10,  radius: 7 },
  lg: { box: 56, font: 14,  radius: 10 },
  // xl is a perfect-circle tile for sleeve dashboards (radius = box/2).
  xl: { box: 112, font: 22, radius: 56 },
};

// Ticker → file path in /public/logos/. Drop the matching SVG/PNG into that
// directory to activate the real logo for the ticker. ETFs use issuer logos
// when a fund-specific mark isn't available (VOO→Vanguard, SMH→VanEck, etc.).
export const TICKER_LOGO_ASSETS: Record<string, string> = {
  // Active Roth IRA holdings
  AMD:   "/logos/amd.svg",
  VOO:   "/logos/vanguard.svg",
  SMH:   "/logos/vaneck.svg",
  FBTC:  "/logos/fidelity.svg",
  NBIS:  "/logos/nebius.svg",
  GOOGL: "/logos/alphabet.svg",
  MELI:  "/logos/mercadolibre.svg",
  CRWD:  "/logos/crowdstrike.svg",
  RKLB:  "/logos/rocket-lab.svg",
  META:  "/logos/meta.svg",
  NOW:   "/logos/servicenow.svg",
  UNH:   "/logos/unitedhealth.svg",
  PENG:  "/logos/penguin-solutions.svg",
  ASTS:  "/logos/ast-spacemobile.svg",
  // Active 2027 Roth Fund holdings (issuer logos for ETFs)
  QQQM:  "/logos/invesco.svg",
  QTUM:  "/logos/defiance-etfs.svg",
  // Archive / previous holdings
  AVEX:  "/logos/aevex.svg",
  DLO:   "/logos/dlocal.svg",
  NU:    "/logos/nu.svg",
  SCHD:  "/logos/schwab.svg",
  IREN:  "/logos/iren.svg",
  SATL:  "/logos/satellogic.svg",
  MU:    "/logos/micron.svg",
};

export default function TickerLogo({
  ticker,
  name,
  size = "md",
  className,
}: {
  ticker: string;
  /** Optional full company name; used for the image alt text. */
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const { box, font, radius } = SIZE_MAP[size];
  const upper = ticker.toUpperCase();
  const assetFile = TICKER_LOGO_ASSETS[upper];
  const [imgFailed, setImgFailed] = useState(false);
  const useImage = !!assetFile && !imgFailed;

  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: box,
    height: box,
    borderRadius: radius,
    background: "#ffffff",
    border: "1px solid rgba(15,30,53,0.10)",
    boxShadow: "0 1px 2px rgba(15,30,53,0.04)",
    overflow: "hidden",
    flexShrink: 0,
  };

  if (useImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={assetFile}
        alt={name ? `${name} logo` : `${upper} logo`}
        onError={() => setImgFailed(true)}
        className={className}
        style={{
          ...containerStyle,
          objectFit: "contain",
          padding: Math.round(box * 0.12),
        }}
      />
    );
  }

  // Monogram fallback.
  const label = upper.length > 4 ? upper.slice(0, 4) : upper;
  return (
    <span
      aria-label={name ? `${name} (${upper})` : upper}
      className={className}
      style={{
        ...containerStyle,
        color: "#0f1e35",
        fontFamily: "var(--font-geist-mono)",
        fontWeight: 600,
        fontSize: font,
        letterSpacing: "0.04em",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {label}
    </span>
  );
}
