// Clean ticker logo. Defaults to a uniform monogram so every ticker has a
// recognizable glyph without a network call. Per-ticker brand-image overrides
// can be registered in TICKER_LOGO_ASSETS — when present, the matching image
// from /public/logos/ replaces the monogram. No assets are bundled by default;
// drop your own SVG/PNG files into /public/logos/ and add an entry here.

const SIZE_MAP: Record<"sm" | "md" | "lg", { box: number; font: number; radius: number }> = {
  sm: { box: 24, font: 8.5, radius: 6 },
  md: { box: 32, font: 10,  radius: 7 },
  lg: { box: 56, font: 14,  radius: 10 },
};

/**
 * Map ticker -> filename in /public/logos/. The component renders the file as
 * an <img> when present, otherwise falls back to the monogram. Drop assets
 * into /public/logos/ before registering them here so the build does not 404.
 *
 * Example: { AMD: "AMD.svg", NBIS: "NBIS.svg" }
 */
const TICKER_LOGO_ASSETS: Record<string, string> = {
  // Populate with /public/logos/<file> as brand assets become available.
};

export default function TickerLogo({
  ticker,
  size = "md",
  className,
}: {
  ticker: string;
  /** Optional full company name, available for future expansion (e.g. tooltip / a11y) */
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { box, font, radius } = SIZE_MAP[size];
  const upper = ticker.toUpperCase();
  const assetFile = TICKER_LOGO_ASSETS[upper];

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

  if (assetFile) {
    // Brand image override. Object-fit:contain keeps logos inside the rounded
    // container without stretching or cropping.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/logos/${assetFile}`}
        alt=""
        aria-hidden
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
      aria-hidden
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
