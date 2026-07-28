"use client";

// Visual sleeve dashboard: circular holding tiles + portfolio-weighting donut.
// Public-safe by construction — only ticker, logo, weight %, and links surface.
// No shares, no dollar values, no average cost.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import TickerLogo from "./TickerLogo";

interface PieLabelLineRenderProps {
  value: number;
  points: [{ x: number; y: number }, { x: number; y: number }];
}

export interface SleeveDashboardHolding {
  ticker: string;
  name: string;
  href: string;
  portfolioWeightPct: number;
  /** Optional category color used for the tile background/halo and donut slice. */
  color?: string;
  /** "fill" paints the tile in `color`; "ring" keeps it white with a colored halo. */
  accentStyle?: "fill" | "ring";
  /** When ringed, render a softer / thinner halo. */
  accentRingSoft?: boolean;
}

// Muted but distinct palette tuned to the cream page background. Cycles for
// sleeves with more than 5 holdings (e.g. Roth IRA has 14).
const SLICE_COLORS = [
  "#1a2845",
  "#7a8da3",
  "#a5b7c9",
  "#abc1b1",
  "#cdd182",
  "#c5a572",
  "#3d5a80",
  "#9aa9ba",
  "#b8c6b5",
  "#d8c98a",
  "#2f4663",
  "#869eb3",
  "#bcc9d4",
  "#c2d4a8",
];

interface PiePoint {
  ticker: string;
  name: string;
  href: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  valueDecimals = 2,
}: {
  active?: boolean;
  payload?: Array<{ payload: PiePoint }>;
  valueDecimals?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.12)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(15,30,53,0.08)",
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 13,
          fontWeight: 700,
          color: "#0f1e35",
          letterSpacing: "0.04em",
        }}
      >
        {d.ticker}
      </div>
      <div style={{ marginTop: 2, fontSize: 12, color: "#3d4f66" }}>
        {d.name}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "var(--font-geist-mono)",
          fontSize: 12,
          color: "#5a6e82",
          letterSpacing: "0.04em",
        }}
      >
        {d.value.toFixed(valueDecimals)}% weight
      </div>
    </div>
  );
}

export default function SleeveDashboard({
  label = "Sleeve View",
  title,
  subtitle,
  holdings,
  donutWide = false,
  showLegend = true,
  donutSidePanel,
  layout = "stack",
  valueDecimals = 2,
  labelThresholdPct,
  tileGridClassName = "grid grid-cols-3 gap-x-5 gap-y-7 justify-items-center",
  columnSplitClassName = "grid gap-8 md:items-center md:gap-10 lg:gap-12 md:grid-cols-[42%_minmax(0,1fr)]",
  donutMargin = { top: 20, right: 16, bottom: 20, left: 16 },
}: {
  label?: string;
  /** Optional. Omit when the page already provides its own title block. */
  title?: string;
  /** Optional. Only renders when set. */
  subtitle?: string;
  holdings: SleeveDashboardHolding[];
  /** When true, the portfolio-weighting donut spans the full section width. */
  donutWide?: boolean;
  /** When false, the per-ticker legend below the donut is suppressed
   *  (useful when the page renders its own category color key). */
  showLegend?: boolean;
  /** Optional content rendered alongside the donut inside the same card.
   *  When provided, the panel switches to a 2-column layout on md+. */
  donutSidePanel?: ReactNode;
  /** Section layout. "stack" (default) renders tiles above the donut card.
   *  "side-by-side" wraps tiles + donut in one shared cream-wash card with
   *  tiles on the left and the donut on the right (md+); stacks on mobile. */
  layout?: "stack" | "side-by-side";
  /** Decimal places for weight % in the tooltip, legend, and default slice label. */
  valueDecimals?: number;
  /** When set, outer slice labels + leader lines render only for slices whose
   *  weight is >= this value; slices below it appear in the legend only, with
   *  no leader line. Overrides the count-based `showSliceLabels` gate below —
   *  useful for sleeves with too many holdings to label every slice cleanly. */
  labelThresholdPct?: number;
  /** Tailwind classes for the tile grid in the "side-by-side" layout. Default
   *  matches the original fixed 3-column grid; override for sleeves with many
   *  more holdings that need more columns at wider breakpoints. */
  tileGridClassName?: string;
  /** Tailwind classes for the outer tile/donut column split in the
   *  "side-by-side" layout (the `md:grid-cols-[…]` template). Default matches
   *  the original 42%/58% split tuned for a 3-column tile grid. */
  columnSplitClassName?: string;
  /** Margin around the "side-by-side" layout's PieChart. Default matches the
   *  original tight margin; widen when outside labels (esp. `labelThresholdPct`
   *  mode with many slices) need more horizontal room so they don't get
   *  clipped by the SVG's own bounds near the left/right edges. */
  donutMargin?: { top: number; right: number; bottom: number; left: number };
}) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Hide outer slice labels when the donut has too many slices to label cleanly.
  const showSliceLabels = holdings.length <= 10;
  const total = holdings.reduce((s, h) => s + h.portfolioWeightPct, 0);
  const pieData: PiePoint[] = holdings.map((h, i) => ({
    ticker: h.ticker,
    name: h.name,
    href: h.href,
    value: h.portfolioWeightPct,
    color: h.color ?? SLICE_COLORS[i % SLICE_COLORS.length],
  }));

  // Outside label + leader line renderers, gated per-slice by weight when
  // `labelThresholdPct` is set; otherwise fall back to the original
  // all-or-nothing `showSliceLabels` behavior.
  const renderOutsideLabel = (props: PieLabelRenderProps) => {
    const { value, x, y, textAnchor } = props;
    if (labelThresholdPct !== undefined && value < labelThresholdPct) return null;
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11, fill: "#3d4f66" }}
      >
        {`${value.toFixed(valueDecimals)}%`}
      </text>
    );
  };

  const renderOutsideLabelLine = (props: PieLabelLineRenderProps) => {
    const { value, points } = props;
    // Recharts types this return as non-nullable, so render an empty <g />
    // rather than null to suppress the leader line for below-threshold slices.
    if (labelThresholdPct !== undefined && value < labelThresholdPct) return <g />;
    const [p0, p1] = points;
    return (
      <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#5a6e82" strokeWidth={0.75} />
    );
  };

  const pieLabel =
    labelThresholdPct !== undefined
      ? renderOutsideLabel
      : showSliceLabels
      ? ({ value }: { value: number }) => `${value.toFixed(valueDecimals)}%`
      : false;

  const pieLabelLine =
    labelThresholdPct !== undefined
      ? renderOutsideLabelLine
      : showSliceLabels
      ? { stroke: "#5a6e82", strokeWidth: 0.75 }
      : false;

  return (
    <div>
      {/* Header — only renders when a title is supplied. Pages that already
          render their own page header can omit title/subtitle and just pass
          the section label. */}
      {title ? (
        <>
          <p
            className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em]"
            style={{ color: "#1a4a2e" }}
          >
            {label}
          </p>
          <h2
            className="font-bold leading-[0.95] tracking-tight text-[#0f1e35]"
            style={{ fontSize: "clamp(2rem,3.5vw,2.75rem)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 max-w-xl text-[13.5px] leading-[1.7] text-[#3d4f66]">
              {subtitle}
            </p>
          )}
          <p className="mt-4 font-mono text-[11px] text-[#5a6e82]">
            {holdings.length} Positions
          </p>
        </>
      ) : (
        <p
          className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "#1a4a2e" }}
        >
          {label}
        </p>
      )}

      <div className={title ? "mt-8" : ""}>
        {layout === "side-by-side" ? (
          <div
            className="rounded-2xl px-6 py-7 lg:px-10 lg:py-9"
            style={{
              background: "rgba(250, 247, 242, 0.55)",
              border: "1px solid rgba(15, 30, 53, 0.07)",
            }}
          >
            <div className={columnSplitClassName}>
              {/* Tiles — compact 3-col grid (5 holdings flow as 3 + 2); override
                  via tileGridClassName for sleeves with many more holdings. */}
              <div className={tileGridClassName}>
                {holdings.map((h) => (
                  <Link
                    key={h.ticker}
                    href={h.href}
                    aria-label={`${h.name} (${h.ticker})`}
                    className="group flex flex-col items-center"
                  >
                    <span className="block transition-transform group-hover:-translate-y-0.5">
                      <TickerLogo
                        ticker={h.ticker}
                        name={h.name}
                        size="xl"
                        accentColor={h.color}
                        accentStyle={h.accentStyle}
                        accentRingSoft={h.accentRingSoft}
                      />
                    </span>
                    <span
                      className="mt-3 font-mono text-[12px] font-semibold tracking-[0.1em]"
                      style={{ color: "#0f1e35" }}
                    >
                      {h.ticker}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Donut + compact legend below */}
              <div>
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6e82]">
                  Portfolio Weighting
                </p>
                <div className="mt-4 h-[300px] md:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={donutMargin}>
                      <Tooltip
                        content={<CustomTooltip valueDecimals={valueDecimals} />}
                        wrapperStyle={{ outline: "none" }}
                        cursor={false}
                      />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="ticker"
                        innerRadius="55%"
                        outerRadius="86%"
                        paddingAngle={1.5}
                        stroke="#faf7f2"
                        strokeWidth={2}
                        isAnimationActive={false}
                        onMouseEnter={(_, idx) => setActiveIdx(idx)}
                        onMouseLeave={() => setActiveIdx(null)}
                        onClick={(_, idx) => {
                          const href = pieData[idx]?.href;
                          if (href) router.push(href);
                        }}
                        style={{ cursor: "pointer" }}
                        label={pieLabel}
                        labelLine={pieLabelLine}
                      >
                        {pieData.map((d, i) => {
                          const dimmed = activeIdx !== null && activeIdx !== i;
                          return (
                            <Cell
                              key={d.ticker}
                              fill={d.color}
                              fillOpacity={dimmed ? 0.35 : 1}
                              style={{ cursor: "pointer", outline: "none" }}
                            />
                          );
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {showLegend && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                    {pieData.map((d, i) => {
                      const dimmed = activeIdx !== null && activeIdx !== i;
                      return (
                        <Link
                          key={d.ticker}
                          href={d.href}
                          onMouseEnter={() => setActiveIdx(i)}
                          onMouseLeave={() => setActiveIdx(null)}
                          className="flex items-center gap-2 transition-opacity"
                          style={{ opacity: dimmed ? 0.4 : 1 }}
                          aria-label={`${d.name} (${d.ticker})`}
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: d.color }}
                            aria-hidden
                          />
                          <span className="font-mono text-[10.5px] tracking-[0.08em] text-[#3d4f66]">
                            {d.ticker}{" "}
                            <span className="text-[#7a8799]">
                              {d.value.toFixed(valueDecimals)}%
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
        <>
        {/* Circular holding tiles */}
        <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-10 sm:gap-x-14">
          {holdings.map((h) => (
            <Link
              key={h.ticker}
              href={h.href}
              aria-label={`${h.name} (${h.ticker})`}
              className="group flex flex-col items-center"
            >
              <span className="block transition-transform group-hover:-translate-y-0.5">
                <TickerLogo
                  ticker={h.ticker}
                  name={h.name}
                  size="xl"
                  accentColor={h.color}
                  accentStyle={h.accentStyle}
                  accentRingSoft={h.accentRingSoft}
                />
              </span>
              <span
                className="mt-4 font-mono text-[13px] font-semibold tracking-[0.1em]"
                style={{ color: "#0f1e35" }}
              >
                {h.ticker}
              </span>
            </Link>
          ))}
        </div>

        {/* Portfolio weighting — single card containing title, donut, and an
            optional side panel (e.g. sector key) so the section reads as one
            unified visual rather than separate floating pieces. */}
        <div
          className="mt-14 rounded-2xl"
          style={{
            background: "rgba(250, 247, 242, 0.55)",
            border: "1px solid rgba(15, 30, 53, 0.07)",
            boxShadow: "none",
          }}
        >
          <div className="px-7 py-8 lg:px-12 lg:py-10">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6e82]">
              Portfolio Weighting
            </p>

            {donutSidePanel ? (
              <div className="mt-8 grid gap-8 md:gap-10 lg:gap-14 md:grid-cols-[42%_minmax(0,1fr)]">
                <div className="h-[380px] md:h-[460px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 16, bottom: 20, left: 16 }}>
                      <Tooltip
                        content={<CustomTooltip valueDecimals={valueDecimals} />}
                        wrapperStyle={{ outline: "none" }}
                        cursor={false}
                      />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="ticker"
                        innerRadius="55%"
                        outerRadius="86%"
                        paddingAngle={1.5}
                        stroke="#faf7f2"
                        strokeWidth={2}
                        isAnimationActive={false}
                        onMouseEnter={(_, idx) => setActiveIdx(idx)}
                        onMouseLeave={() => setActiveIdx(null)}
                        onClick={(_, idx) => {
                          const href = pieData[idx]?.href;
                          if (href) router.push(href);
                        }}
                        style={{ cursor: "pointer" }}
                        label={pieLabel}
                        labelLine={pieLabelLine}
                      >
                        {pieData.map((d, i) => {
                          const dimmed = activeIdx !== null && activeIdx !== i;
                          return (
                            <Cell
                              key={d.ticker}
                              fill={d.color}
                              fillOpacity={dimmed ? 0.35 : 1}
                              style={{ cursor: "pointer", outline: "none" }}
                            />
                          );
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="self-center">{donutSidePanel}</div>
              </div>
            ) : (
              <div
                className={
                  donutWide
                    ? "mx-auto mt-6 h-[520px] w-full"
                    : "mx-auto mt-6 h-[340px] w-full max-w-xl"
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 32, right: 32, bottom: 32, left: 32 }}>
                    <Tooltip
                      content={<CustomTooltip valueDecimals={valueDecimals} />}
                      wrapperStyle={{ outline: "none" }}
                      cursor={false}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="ticker"
                      innerRadius={donutWide ? "52%" : "55%"}
                      outerRadius={donutWide ? "82%" : "78%"}
                      paddingAngle={1.5}
                      stroke="#faf7f2"
                      strokeWidth={2}
                      isAnimationActive={false}
                      onMouseEnter={(_, idx) => setActiveIdx(idx)}
                      onMouseLeave={() => setActiveIdx(null)}
                      onClick={(_, idx) => {
                        const href = pieData[idx]?.href;
                        if (href) router.push(href);
                      }}
                      style={{ cursor: "pointer" }}
                      label={pieLabel}
                      labelLine={pieLabelLine}
                    >
                      {pieData.map((d, i) => {
                        const dimmed = activeIdx !== null && activeIdx !== i;
                        return (
                          <Cell
                            key={d.ticker}
                            fill={d.color}
                            fillOpacity={dimmed ? 0.35 : 1}
                            style={{ cursor: "pointer", outline: "none" }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

          {/* Legend — hover dims non-matching slices; click routes to the holding page.
              Pages that render their own category color key can suppress this via showLegend={false}. */}
          {showLegend && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {pieData.map((d, i) => {
                const dimmed = activeIdx !== null && activeIdx !== i;
                return (
                  <Link
                    key={d.ticker}
                    href={d.href}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className="flex items-center gap-2 transition-opacity"
                    style={{ opacity: dimmed ? 0.4 : 1 }}
                    aria-label={`${d.name} (${d.ticker})`}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: d.color }}
                      aria-hidden
                    />
                    <span className="font-mono text-[11px] tracking-[0.08em] text-[#3d4f66]">
                      {d.ticker}{" "}
                      <span className="text-[#7a8799]">{d.value.toFixed(valueDecimals)}%</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
          {/* Sanity check — if total !== ~100, surface a quiet note (debug only) */}
          {Math.abs(total - 100) > 0.5 && (
            <p className="mt-3 text-center font-mono text-[9px] text-[#b0bac5]">
              Weights sum to {total.toFixed(2)}%
            </p>
          )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
