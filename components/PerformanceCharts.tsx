"use client";

// Performance visualisations. These are RENDERERS ONLY — every number arrives
// precomputed from data/performanceDerived.json, which comes from the single
// canonical engine. No component here recalculates a return, so no chart can
// ever disagree with another.
//
// Follows the established chart idiom: 9px mono ticks in #5a6e82, no axis lines,
// zero reference line where values go negative, same tooltip card treatment.

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { ACCENT as GREEN, AMBER, NEGATIVE, MUTED, FAINT, CARD_BORDER } from "@/lib/theme";

const NAVY = "#1a3a5c";
const MONO = "var(--font-geist-mono)";

const TOOLTIP = {
  background: "#ffffff",
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: 8,
  padding: "8px 12px",
  fontFamily: MONO,
  fontSize: 11,
} as const;

function fmtPct(v: number, d = 2) {
  return `${v >= 0 ? "+" : ""}${v.toFixed(d)}%`;
}
function fmtMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "short", year: "2-digit", timeZone: "UTC",
  });
}

// ── Cumulative: portfolio vs available benchmarks ───────────────────────────

export interface CumulativeSeries {
  key: string;
  label: string;
  color: string;
  /** Wealth index normalised to 100 at inception. */
  points: { date: string; index: number }[];
}

export function CumulativeChart({ series }: { series: CumulativeSeries[] }) {
  // Merge on date so all series share one x-axis and identical date handling.
  const byDate = new Map<string, Record<string, number | string>>();
  for (const s of series) {
    for (const p of s.points) {
      const row = byDate.get(p.date) ?? { date: p.date };
      // Plot as percent from inception rather than an index level.
      row[s.key] = p.index - 100;
      byDate.set(p.date, row);
    }
  }
  const data = [...byDate.values()].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  return (
    <div style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd" minTickGap={60}
            tickFormatter={(d: string) => fmtMonth(d.slice(0, 7))}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
            axisLine={false} tickLine={false} width={46}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <ReferenceLine y={0} stroke="rgba(15,30,53,0.2)" />
          <Tooltip
            contentStyle={TOOLTIP}
            labelStyle={{ color: FAINT, fontSize: 10 }}
            formatter={(v: unknown, name: unknown) => [fmtPct(Number(v)), String(name)]}
          />
          <Legend
            verticalAlign="top" height={28} iconType="plainline"
            wrapperStyle={{ fontFamily: MONO, fontSize: 10, color: MUTED }}
          />
          {series.map((s) => (
            <Line
              key={s.key} type="monotone" dataKey={s.key} name={s.label}
              stroke={s.color} strokeWidth={1.75} dot={false}
              isAnimationActive={false} connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Monthly grouped bars ────────────────────────────────────────────────────

export interface MonthlyRow {
  key: string;
  portfolioPct: number;
  partial?: boolean;
  [benchmarkKey: string]: number | string | boolean | undefined;
}

export function MonthlyGroupedBars({
  rows, benchmarks,
}: {
  rows: MonthlyRow[];
  benchmarks: { key: string; label: string; color: string }[];
}) {
  const data = rows.map((r) => ({ ...r, label: fmtMonth(r.key) }));
  return (
    <div style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={1.5}>
          <XAxis
            dataKey="label"
            tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
            axisLine={false} tickLine={false} interval={0} angle={-35}
            textAnchor="end" height={46}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
            axisLine={false} tickLine={false} width={46}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <ReferenceLine y={0} stroke="rgba(15,30,53,0.2)" />
          <Tooltip
            cursor={{ fill: "rgba(15,30,53,0.04)" }}
            contentStyle={TOOLTIP}
            labelStyle={{ color: FAINT, fontSize: 10 }}
            formatter={(v: unknown, name: unknown) => [fmtPct(Number(v)), String(name)]}
          />
          <Legend
            verticalAlign="top" height={28}
            wrapperStyle={{ fontFamily: MONO, fontSize: 10, color: MUTED }}
          />
          <Bar dataKey="portfolioPct" name="Portfolio" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.portfolioPct < 0 ? NEGATIVE : GREEN} fillOpacity={0.9} />
            ))}
          </Bar>
          {/* Benchmarks render only when a real series exists — an unavailable
              benchmark contributes no bars rather than a row of zeros. */}
          {benchmarks.map((b) => (
            <Bar
              key={b.key} dataKey={b.key} name={b.label}
              fill={b.color} fillOpacity={0.62} radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Drawdown ────────────────────────────────────────────────────────────────

export function DrawdownChart({
  points,
}: {
  points: { date: string; drawdownPct: number }[];
}) {
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dd-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={NEGATIVE} stopOpacity={0.05} />
              <stop offset="100%" stopColor={NEGATIVE} stopOpacity={0.22} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd" minTickGap={60}
            tickFormatter={(d: string) => fmtMonth(d.slice(0, 7))}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
            axisLine={false} tickLine={false} width={46}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <ReferenceLine y={0} stroke="rgba(15,30,53,0.2)" />
          <Tooltip
            contentStyle={TOOLTIP}
            labelStyle={{ color: FAINT, fontSize: 10 }}
            formatter={(v: unknown) => [`${Number(v).toFixed(2)}%`, "Drawdown"]}
          />
          <Area
            type="monotone" dataKey="drawdownPct" stroke={NEGATIVE}
            strokeWidth={1.25} fill="url(#dd-grad)" dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const SERIES_COLORS = { portfolio: GREEN, sp500: NAVY, nasdaq100: AMBER };
