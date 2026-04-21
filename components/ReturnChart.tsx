"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { HistoricalPoint } from "@/lib/types";

type Range = "1y" | "3y" | "5y" | "max";

const RANGES: { key: Range; label: string }[] = [
  { key: "1y", label: "1Y" },
  { key: "3y", label: "3Y" },
  { key: "5y", label: "5Y" },
  { key: "max", label: "MAX" },
];

export function ReturnChart({
  ticker,
  costBasis,
}: {
  ticker: string;
  costBasis: number;
}) {
  const [range, setRange] = useState<Range>("1y");
  const [points, setPoints] = useState<HistoricalPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPoints(null);
    fetch(`/api/history/${ticker}?range=${range}`)
      .then((r) => r.json())
      .then((data: { points: HistoricalPoint[] }) => {
        setPoints(data.points ?? []);
        setLoading(false);
      })
      .catch(() => {
        setPoints([]);
        setLoading(false);
      });
  }, [ticker, range]);

  const chartData = (points ?? []).map((p) => {
    const r = ((p.c - costBasis) / costBasis) * 100;
    const d = new Date(p.t * 1000);
    const label =
      range === "max"
        ? d.getFullYear().toString()
        : d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const dateLabel = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return { t: p.t, r, label, dateLabel };
  });

  const lastR = chartData[chartData.length - 1]?.r ?? 0;
  const isUp = lastR >= 0;
  const lineColor = chartData.length >= 2 ? (isUp ? "#15542e" : "#8b1a1a") : "#1a3a5c";
  const gradId = `return-grad-${ticker}`;

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
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7a8799]">
          Return Since Purchase
        </p>
        <div className="flex gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className="rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors"
              style={
                range === r.key
                  ? { background: "rgba(15,30,53,0.07)", color: "#0f1e35" }
                  : { color: "#a8b2bd" }
              }
              onMouseEnter={(e) => {
                if (range !== r.key)
                  (e.currentTarget as HTMLButtonElement).style.color = "#5a6e82";
              }}
              onMouseLeave={(e) => {
                if (range !== r.key)
                  (e.currentTarget as HTMLButtonElement).style.color = "#a8b2bd";
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 280 }}>
        {loading ? (
          <div
            className="h-full w-full animate-pulse rounded-xl"
            style={{ background: "rgba(15,30,53,0.04)" }}
          />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[11px] text-[#a8b2bd]">
              Historical data unavailable for this range
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#a8b2bd",
                  fontSize: 9,
                  fontFamily: "var(--font-geist-mono)",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />

              <YAxis
                tick={{
                  fill: "#a8b2bd",
                  fontSize: 9,
                  fontFamily: "var(--font-geist-mono)",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`
                }
                domain={["auto", "auto"]}
                width={52}
              />

              <ReferenceLine
                y={0}
                stroke="rgba(15,30,53,0.15)"
                strokeDasharray="3 3"
              />

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,30,53,0.1)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  boxShadow: "0 4px 16px rgba(15,30,53,0.08)",
                }}
                labelFormatter={(_, payload) => {
                  const entry = payload?.[0]?.payload as
                    | { dateLabel?: string }
                    | undefined;
                  return (
                    <span
                      style={{
                        color: "#7a8799",
                        fontSize: 10,
                        fontFamily: "var(--font-geist-mono)",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {entry?.dateLabel ?? ""}
                    </span>
                  );
                }}
                formatter={(value: unknown) => {
                  const v = Number(value);
                  return [
                    <span
                      key="ret"
                      style={{
                        color: v >= 0 ? "#15542e" : "#8b1a1a",
                        fontSize: 13,
                        fontFamily: "var(--font-geist-mono)",
                        fontWeight: 600,
                      }}
                    >
                      {v >= 0 ? "+" : ""}
                      {v.toFixed(2)}%
                    </span>,
                    "",
                  ];
                }}
                itemStyle={{ padding: 0 }}
                separator=""
              />

              <Area
                type="monotone"
                dataKey="r"
                stroke={lineColor}
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
