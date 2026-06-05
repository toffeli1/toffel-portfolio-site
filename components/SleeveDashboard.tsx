"use client";

// Visual sleeve dashboard: circular holding tiles + portfolio-weighting donut.
// Public-safe by construction — only ticker, logo, weight %, and links surface.
// No shares, no dollar values, no average cost.

import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import TickerLogo from "./TickerLogo";

export interface SleeveDashboardHolding {
  ticker: string;
  name: string;
  href: string;
  portfolioWeightPct: number;
}

// Muted but distinct palette tuned to the cream page background.
const SLICE_COLORS = ["#1a2845", "#7a8da3", "#a5b7c9", "#abc1b1", "#cdd182"];

export default function SleeveDashboard({
  label = "Sleeve View",
  title,
  subtitle,
  holdings,
}: {
  label?: string;
  title: string;
  subtitle: string;
  holdings: SleeveDashboardHolding[];
}) {
  const total = holdings.reduce((s, h) => s + h.portfolioWeightPct, 0);
  const pieData = holdings.map((h, i) => ({
    name: h.ticker,
    value: h.portfolioWeightPct,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
  }));

  return (
    <div>
      {/* Header */}
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
      <p className="mt-3 max-w-xl text-[13.5px] leading-[1.7] text-[#3d4f66]">
        {subtitle}
      </p>
      <p className="mt-4 font-mono text-[11px] text-[#5a6e82]">
        {holdings.length} Positions
      </p>

      <div
        className="mt-10 border-t pt-12"
        style={{ borderColor: "rgba(15,30,53,0.08)" }}
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
          <div className="mx-auto mt-6 h-[340px] w-full max-w-xl">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 28, right: 28, bottom: 28, left: 28 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="78%"
                  paddingAngle={1.5}
                  stroke="#faf7f2"
                  strokeWidth={2}
                  isAnimationActive={false}
                  label={({ name, value }) =>
                    `${value.toFixed(2)}%`
                  }
                  labelLine={{ stroke: "#5a6e82", strokeWidth: 0.75 }}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: d.color }}
                  aria-hidden
                />
                <span className="font-mono text-[11px] tracking-[0.08em] text-[#3d4f66]">
                  {d.name}{" "}
                  <span className="text-[#7a8799]">{d.value.toFixed(2)}%</span>
                </span>
              </span>
            ))}
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
