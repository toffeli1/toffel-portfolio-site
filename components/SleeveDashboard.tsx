"use client";

// Visual sleeve dashboard: circular holding tiles + portfolio-weighting donut.
// Public-safe by construction — only ticker, logo, weight %, and links surface.
// No shares, no dollar values, no average cost.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TickerLogo from "./TickerLogo";

export interface SleeveDashboardHolding {
  ticker: string;
  name: string;
  href: string;
  portfolioWeightPct: number;
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
}: {
  active?: boolean;
  payload?: Array<{ payload: PiePoint }>;
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
        {d.value.toFixed(2)}% weight
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
}: {
  label?: string;
  /** Optional. Omit when the page already provides its own title block. */
  title?: string;
  /** Optional. Only renders when set. */
  subtitle?: string;
  holdings: SleeveDashboardHolding[];
  /** When true, the portfolio-weighting donut spans the full section width. */
  donutWide?: boolean;
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
    color: SLICE_COLORS[i % SLICE_COLORS.length],
  }));

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

      <div
        className={title ? "mt-10 border-t pt-12" : ""}
        style={title ? { borderColor: "rgba(15,30,53,0.08)" } : undefined}
      >
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
                <TickerLogo ticker={h.ticker} name={h.name} size="xl" />
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

        {/* Portfolio weighting donut */}
        <div className="mt-14">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6e82]">
            Portfolio Weighting
          </p>
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
                  content={<CustomTooltip />}
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
                  label={
                    showSliceLabels
                      ? ({ value }) => `${value.toFixed(2)}%`
                      : false
                  }
                  labelLine={
                    showSliceLabels
                      ? { stroke: "#5a6e82", strokeWidth: 0.75 }
                      : false
                  }
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

          {/* Legend — hover dims non-matching slices; click routes to the holding page */}
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
                    <span className="text-[#7a8799]">{d.value.toFixed(2)}%</span>
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Sanity check — if total !== ~100, surface a quiet note (debug only) */}
          {Math.abs(total - 100) > 0.5 && (
            <p className="mt-3 text-center font-mono text-[9px] text-[#b0bac5]">
              Weights sum to {total.toFixed(2)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
