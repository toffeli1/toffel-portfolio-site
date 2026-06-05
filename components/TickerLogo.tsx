// Clean ticker monogram. Uniform styling across the site, no external assets.
// Sized via the `size` prop. The ticker text is shown in semibold mono so each
// holding gets a recognizable, intentional-looking glyph without a network call.

const SIZE_MAP: Record<"sm" | "md" | "lg", { box: number; font: number; radius: number }> = {
  sm: { box: 24, font: 8.5, radius: 6 },
  md: { box: 32, font: 10,  radius: 7 },
  lg: { box: 56, font: 14,  radius: 10 },
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
  // Use up to 4 chars for ETFs like QQQM and FBTC; clip to a clean 3 otherwise.
  const label = ticker.length > 4 ? ticker.slice(0, 4) : ticker;

  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: box,
        height: box,
        borderRadius: radius,
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.10)",
        boxShadow: "0 1px 2px rgba(15,30,53,0.04)",
        color: "#0f1e35",
        fontFamily: "var(--font-geist-mono)",
        fontWeight: 600,
        fontSize: font,
        letterSpacing: "0.04em",
        lineHeight: 1,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {label}
    </span>
  );
}
