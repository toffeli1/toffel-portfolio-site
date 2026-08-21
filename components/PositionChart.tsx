"use client";

// ─── Performance history chart ────────────────────────────────────────────────
// Plots PERCENT CHANGE from the start of the selected range. It never renders a
// price, and it no longer accepts one.
//
// This component previously took `purchaseLots`, `sellEvents`, `averageCost` and
// `entryMarker` — all of which carried real per-share prices and share counts
// into a client bundle, where they were serialised into the page payload. All of
// it is gone, along with the lot-clustering and lot-tooltip machinery that
// consumed it. The props no longer exist, so a caller cannot reintroduce a
// private value by passing one.
//
// The raw close is fetched to compute the rebase and is never bound to a
// rendered axis, tooltip or label.

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import type { HistoricalPoint } from "@/lib/types";

type Range = "1w" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y" | "max";

export interface ExitMarker {
  date: string;
  reason?: string;
}

const RANGES: { key: Range; label: string }[] = [
  { key: "1w", label: "1W" }, { key: "1m", label: "1M" }, { key: "3m", label: "3M" },
  { key: "6m", label: "6M" }, { key: "1y", label: "1Y" }, { key: "3y", label: "3Y" },
  { key: "5y", label: "5Y" }, { key: "max", label: "MAX" },
];

const MONO = "var(--font-geist-mono)";
const MUTED = "#5a6e82";
const FAINT = "#7a8799";

interface ChartPoint { t: number; p: number; dateLabel: string }

function formatPercent(v: number, digits = 2): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

function formatXTick(ts: number, range: Range): string {
  const d = new Date(ts * 1000);
  if (range === "1w" || range === "1m" || range === "3m")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (range === "max") return d.getFullYear().toString();
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function PositionChart({
  ticker, exitMarker, defaultRange,
}: {
  ticker: string;
  exitMarker?: ExitMarker;
  defaultRange?: Range;
}) {
  const [range, setRange] = useState<Range>(defaultRange ?? "1y");
  const [points, setPoints] = useState<HistoricalPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPoints(null);
    fetch(`/api/history/${ticker}?range=${range}`)
      .then((r) => r.json())
      .then((data: { points: HistoricalPoint[] }) => { setPoints(data.points ?? []); setLoading(false); })
      .catch(() => { setPoints([]); setLoading(false); });
  }, [ticker, range]);

  // Rebased to percent change from the first close in the range.
  const chartData = useMemo((): ChartPoint[] => {
    const raw = points ?? [];
    const base = raw[0]?.c ?? 0;
    return raw.map((pt) => ({
      t: pt.t,
      p: base > 0 ? ((pt.c / base) - 1) * 100 : 0,
      dateLabel: new Date(pt.t * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
    }));
  }, [points]);

  const exitPoint = useMemo(() => {
    if (!exitMarker || chartData.length === 0) return null;
    const target = parseLocalDate(exitMarker.date).getTime() / 1000;
    return chartData.find((p) => p.t >= target) ?? null;
  }, [exitMarker, chartData]);

  const isUp = (chartData[chartData.length - 1]?.p ?? 0) >= 0;
  const lineColor = chartData.length >= 2 ? (isUp ? "#15542e" : "#8b1a1a") : "#1a3a5c";
  const gradId = `chart-grad-${ticker}`;

  return (
    <div
      className="rounded-2xl px-6 pt-6 pb-4"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: FAINT }}>
            Performance
          </p>
          {exitMarker && (
            <p className="font-mono text-[9px]" style={{ color: "#8b2530", opacity: 0.7 }}>
              ✕&ensp;exit
            </p>
          )}
        </div>
        <div className="flex gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className="rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors"
              style={range === r.key
                ? { background: "rgba(15,30,53,0.07)", color: "#0f1e35" }
                : { color: MUTED }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 300 }}>
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl" style={{ background: "rgba(15,30,53,0.04)" }} />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[11px]" style={{ color: MUTED }}>
              Historical data unavailable for this range
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]}
                tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd" minTickGap={50}
                tickFormatter={(v: number) => formatXTick(v, range)}
              />
              <YAxis
                tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
                axisLine={false} tickLine={false} width={52}
                tickFormatter={(v: number) => formatPercent(v, 0)}
              />
              <ReferenceLine y={0} stroke="rgba(15,30,53,0.2)" />
              <Tooltip
                contentStyle={{
                  background: "#ffffff", border: "1px solid rgba(15,30,53,0.1)",
                  borderRadius: 8, padding: "8px 14px", fontFamily: MONO, fontSize: 11,
                }}
                labelFormatter={(_, payload) => {
                  const e = payload?.[0]?.payload as { dateLabel?: string } | undefined;
                  return (
                    <span style={{ color: FAINT, fontSize: 10, fontFamily: MONO, display: "block", marginBottom: 4 }}>
                      {e?.dateLabel ?? ""}
                    </span>
                  );
                }}
                formatter={(v: unknown) => [formatPercent(Number(v)), ""]}
                separator=""
              />
              <Area
                type="monotone" dataKey="p" stroke={lineColor} strokeWidth={1.5}
                fill={`url(#${gradId})`} dot={false}
                activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              {exitPoint && (
                <ReferenceDot
                  x={exitPoint.t} y={exitPoint.p} r={5}
                  fill="none" stroke="#8b2530" strokeWidth={1.5}
                  label={{
                    value: "Exit", position: "top", fontSize: 9,
                    fontFamily: MONO, fill: "#8b2530", offset: 8,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {exitMarker?.reason && (
        <p className="mt-3 font-mono text-[9px]" style={{ color: FAINT }}>
          Exit: {exitMarker.reason}
        </p>
      )}
    </div>
  );
}
