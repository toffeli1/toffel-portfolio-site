"use client";

// Renders one MetricSeries from a thesis page's chart plan.
//
// Follows the chart idiom already established in PerformanceMonthlyBars /
// PositionChart rather than introducing a second visual language: mono tick
// labels at 9px in #5a6e82, no axis lines, a zero reference line where values
// can go negative, and the same tooltip card treatment.
//
// Chart form is chosen from the unit, not per call site, so the same metric type
// always looks the same across companies:
//   pct  → line (a rate over time reads as a trajectory)
//   else → bars (a level per period reads as discrete quantities)
//
// NO SECURITY PRICES pass through here. Every series is a reported financial
// figure, a computed margin, or a growth rate. There is deliberately no code
// path that formats a share price.

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MetricSeries, MetricUnit } from "@/data/thesis/types";

const GREEN = "#1a4a2e";
const NAVY = "#1a3a5c";
const NEGATIVE = "#8b1a1a";
const MUTED = "#5a6e82";
const FAINT = "#7a8799";
const MONO = "var(--font-geist-mono)";

function formatValue(v: number, unit: MetricUnit): string {
  switch (unit) {
    case "usd_b":
      return Math.abs(v) >= 1
        ? `$${v.toFixed(v >= 100 ? 0 : 1)}B`
        : `$${(v * 1000).toFixed(0)}M`;
    case "usd_m":
      return `$${v.toFixed(0)}M`;
    case "pct":
      return `${v >= 0 ? "" : ""}${v.toFixed(1)}%`;
    case "x":
      return v.toFixed(2);
    case "count":
      return v.toFixed(0);
  }
}

function axisTick(unit: MetricUnit) {
  return (v: number) => {
    if (unit === "usd_b") return Math.abs(v) >= 1 ? `$${v.toFixed(0)}B` : `$${(v * 1000).toFixed(0)}M`;
    if (unit === "pct") return `${v.toFixed(0)}%`;
    if (unit === "x") return v.toFixed(1);
    return String(v);
  };
}

const SOURCE_LABEL: Record<MetricSeries["source"], string> = {
  sec: "SEC XBRL",
  filing: "Company filing",
  ir: "Investor relations",
  manual: "Manually maintained",
};

export default function MetricChart({ series }: { series: MetricSeries }) {
  const data = series.points.map((p) => ({
    label: p.period,
    value: p.value,
    estimate: p.estimate ?? false,
  }));

  const hasNegative = data.some((d) => d.value < 0);
  const asLine = series.unit === "pct";

  return (
    <div
      className="rounded-2xl px-5 pt-5 pb-4"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <div className="mb-1 flex items-baseline justify-between gap-4">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "#0f1e35" }}
        >
          {series.label}
        </p>
        <p className="font-mono text-[9px]" style={{ color: FAINT }}>
          {SOURCE_LABEL[series.source]}
        </p>
      </div>

      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          {asLine ? (
            <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={axisTick(series.unit)}
              />
              {hasNegative && <ReferenceLine y={0} stroke="rgba(15,30,53,0.2)" />}
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,30,53,0.1)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontFamily: MONO,
                  fontSize: 11,
                }}
                labelStyle={{ color: FAINT, fontSize: 10 }}
                formatter={(v: unknown) => [formatValue(Number(v), series.unit), ""]}
                separator=""
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={GREEN}
                strokeWidth={1.75}
                dot={{ r: 2.5, fill: GREEN, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: GREEN, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={axisTick(series.unit)}
              />
              {hasNegative && <ReferenceLine y={0} stroke="rgba(15,30,53,0.2)" />}
              <Tooltip
                cursor={{ fill: "rgba(15,30,53,0.04)" }}
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,30,53,0.1)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontFamily: MONO,
                  fontSize: 11,
                }}
                labelStyle={{ color: FAINT, fontSize: 10 }}
                formatter={(v: unknown) => [formatValue(Number(v), series.unit), ""]}
                separator=""
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.value < 0 ? NEGATIVE : NAVY} fillOpacity={0.82} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="mt-2 font-mono text-[9px] leading-[1.5]" style={{ color: FAINT }}>
        {series.dataThrough}
        {series.note ? ` · ${series.note}` : ""}
      </p>
    </div>
  );
}
