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
  AMD:   "/logos/amd.png",
  VOO:   "/logos/vanguard.png",
  SMH:   "/logos/vaneck.png",
  FBTC:  "/logos/fbtc.png",
  NBIS:  "/logos/nebius.png",
  GOOGL: "/logos/alphabet.png",
  MELI:  "/logos/mercadolibre.png",
  CRWD:  "/logos/crowdstrike.png",
  RKLB:  "/logos/rocket-lab.png",
  META:  "/logos/meta.png",
  NOW:   "/logos/servicenow.png",
  UNH:   "/logos/unitedhealth.png",
  PENG:  "/logos/penguin-solutions.png",
  ASTS:  "/logos/ast-spacemobile.png",
  // Active 2027 Roth Fund holdings (issuer logos for ETFs)
  QQQM:  "/logos/invesco.png",
  QTUM:  "/logos/defiance.png",
  // Active 2028 Roth Fund holdings
  MU:    "/logos/micron.png",
  OUST:  "/logos/ouster.png",
  NVTS:  "/logos/navitas.png",
  FLY:   "/logos/firefly-aerospace.png",
  // Archive / previous holdings
  AVEX:  "/logos/aevex.svg",
  DLO:   "/logos/dlocal.svg",
  NU:    "/logos/nu.svg",
  SCHD:  "/logos/schwab.svg",
  IREN:  "/logos/iren.svg",
  SATL:  "/logos/satellogic.svg",
};

// Per-ticker scale tuning (max width/height of the logo image as a % of the
// container box). Compact marks can run larger; wide wordmarks stay smaller
// so they don't crowd the circle edges. Unmapped tickers use DEFAULT_SCALE.
const TICKER_LOGO_SCALE: Record<string, string> = {
  // 2027 / 2028 sleeves
  QQQM: "86%",
  SMH:  "122%",  // ring tile — VanEck wordmark zoomed further
  VOO:  "118%",  // ring tile — bigger Vanguard V
  FBTC: "138%",  // fill tile — orange Bitcoin coin fills the badge, white padding around the PNG clips out
  QTUM: "84%",
  MU:   "86%",
  OUST: "86%",
  PENG: "122%",  // fill tile — penguin mark dominates the gold circle
  NVTS: "86%",
  FLY:  "82%",
  // Roth IRA active holdings
  AMD:  "86%",
  NBIS: "88%",
  GOOGL: "116%",  // ring tile — bigger Google G
  MELI: "86%",
  CRWD: "96%",   // ring tile — let the eagle badge fill the circle
  RKLB: "130%",  // fill tile — Rocket Lab mark runs to the edges
  META: "106%",  // ring tile — slightly larger but not cropped
  NOW:  "122%",  // fill tile — wordmark fills the teal badge
  UNH:  "74%",   // compact U mark — keep restrained
  ASTS: "92%",   // dark bg wordmark
};
const DEFAULT_SCALE = "82%";

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function TickerLogo({
  ticker,
  name,
  size = "md",
  className,
  accentColor,
  accentStyle = "fill",
  accentRingSoft = false,
}: {
  ticker: string;
  /** Optional full company name; used for the image alt text. */
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /**
   * Optional accent color. With "fill" it becomes the tile background; with
   * "ring" the tile stays white and the color renders as a soft outer halo.
   */
  accentColor?: string;
  /** "fill" paints the whole tile in accentColor; "ring" keeps the tile
   *  white and wraps it in a colored halo. */
  accentStyle?: "fill" | "ring";
  /** When ringed, render a thinner / lower-opacity halo so the border feels
   *  softer (used for tickers whose ring read as too strong). */
  accentRingSoft?: boolean;
}) {
  const { box, font, radius } = SIZE_MAP[size];
  const upper = ticker.toUpperCase();
  const assetFile = TICKER_LOGO_ASSETS[upper];
  const [imgFailed, setImgFailed] = useState(false);
  const useImage = !!assetFile && !imgFailed;

  const filled = !!accentColor && accentStyle === "fill";
  const ringed = !!accentColor && accentStyle === "ring";

  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: box,
    height: box,
    borderRadius: radius,
    background: filled ? accentColor : "#ffffff",
    border: filled
      ? "1px solid rgba(15,30,53,0.18)"
      : "1px solid rgba(15,30,53,0.10)",
    // Ring treatment: 2px colored halo via box-shadow so the inner 112px stays
    // fully white. Drop shadow stays subtle in both modes.
    boxShadow: ringed
      ? accentRingSoft
        ? `0 0 0 1.5px ${hexToRgba(accentColor!, 0.55)}, 0 2px 6px rgba(15,30,53,0.06)`
        : `0 0 0 2px ${accentColor}, 0 2px 6px rgba(15,30,53,0.08)`
      : filled
      ? "0 2px 6px rgba(15,30,53,0.10)"
      : "0 1px 2px rgba(15,30,53,0.04)",
    overflow: "hidden",
    flexShrink: 0,
  };

  if (useImage) {
    const scale = TICKER_LOGO_SCALE[upper] ?? DEFAULT_SCALE;
    return (
      <span className={className} style={containerStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetFile}
          alt={name ? `${name} logo` : `${upper} logo`}
          onError={() => setImgFailed(true)}
          style={{
            maxWidth: scale,
            maxHeight: scale,
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </span>
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
