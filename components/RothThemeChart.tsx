"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SleeveHolding } from "@/data/sleeveHoldings";

const THEME_COLORS: Record<string, string> = {
  "Core Market":         "#1a4a2e",
  "AI / Semiconductors": "#1a3a5c",
  "Platform Tech":       "#6b3fa0",
  "Fintech":             "#7a4520",
  "Digital Assets":      "#8b5e3c",
  "Healthcare":          "#1a5c5c",
  "Space / Defense":     "#8b2530",
};

const FALLBACK_COLOR = "#7a8799";

interface ThemeSlice {
  theme: string;
  pct: number;
  color: string;
  holdings: SleeveHolding[];
}

export default function RothThemeChart({
  holdings,
}: {
  holdings: SleeveHolding[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const totalWeight = useMemo(
    () => holdings.reduce((s, h) => s + h.portfolioWeightPct, 0) || 1,
    [holdings]
  );

  const slices = useMemo<ThemeSlice[]>(() => {
    const map = new Map<string, SleeveHolding[]>();
    for (const h of holdings) {
      const key = h.theme ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(h);
    }
    return Array.from(map.entries())
      .map(([theme, hs]) => ({
        theme,
        pct: (hs.reduce((s, h) => s + h.portfolioWeightPct, 0) / totalWeight) * 100,
        color: THEME_COLORS[theme] ?? FALLBACK_COLOR,
        holdings: hs,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [holdings, totalWeight]);

  const selectedSlice = slices.find((s) => s.theme === selected) ?? null;

  // SVG donut params
  const cx = 80;
  const cy = 80;
  const r = 54;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * r;

  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
      {/* Donut + legend */}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        {/* SVG donut */}
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              {slices.map((slice) => {
                const dashLength = (slice.pct / 100) * circumference;
                const gapLength = circumference - dashLength;
                const offset = -cumulativeOffset;
                cumulativeOffset += dashLength;
                const isActive = selected === null || selected === slice.theme;
                return (
                  <circle
                    key={slice.theme}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dashLength} ${gapLength}`}
                    strokeDashoffset={offset}
                    opacity={isActive ? 1 : 0.2}
                    className="cursor-pointer transition-opacity"
                    onClick={() =>
                      setSelected((prev) =>
                        prev === slice.theme ? null : slice.theme
                      )
                    }
                  />
                );
              })}
            </g>
            {/* Centre label */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono"
              style={{ fontSize: 9, fill: "#a8b2bd", letterSpacing: "0.15em" }}
            >
              {selectedSlice
                ? `${selectedSlice.pct.toFixed(1)}%`
                : `${slices.length}`}
            </text>
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono"
              style={{ fontSize: 7, fill: "#a8b2bd", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              {selectedSlice ? "of account" : "themes"}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {slices.map((slice) => {
            const isActive = selected === null || selected === slice.theme;
            return (
              <button
                key={slice.theme}
                onClick={() =>
                  setSelected((prev) =>
                    prev === slice.theme ? null : slice.theme
                  )
                }
                className="flex items-center gap-3 text-left transition-opacity"
                style={{ opacity: isActive ? 1 : 0.35 }}
              >
                <span
                  className="shrink-0 rounded-sm"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: slice.color,
                  }}
                />
                <span
                  className="font-mono text-[11px] text-[#3d4f66]"
                  style={{ minWidth: 160 }}
                >
                  {slice.theme}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[#a8b2bd]">
                  {slice.pct.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Holdings detail panel */}
      <div className="flex-1">
        {selectedSlice ? (
          <div
            className="rounded-2xl p-6"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,30,53,0.09)",
              boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
            }}
          >
            <p
              className="mb-5 font-mono text-[10px] uppercase tracking-[0.25em]"
              style={{ color: selectedSlice.color }}
            >
              {selectedSlice.theme}
            </p>
            <div className="divide-y" style={{ borderColor: "rgba(15,30,53,0.06)" }}>
              {selectedSlice.holdings
                .sort((a, b) => b.portfolioWeightPct - a.portfolioWeightPct)
                .map((h) => {
                  const normPct =
                    (h.portfolioWeightPct / totalWeight) * 100;
                  return (
                    <div
                      key={h.ticker}
                      className="flex items-center justify-between gap-4 py-3.5"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <Link
                          href={`/positions/${h.ticker}`}
                          className="font-mono text-[12px] font-semibold transition-opacity hover:opacity-70"
                          style={{ color: selectedSlice.color }}
                        >
                          {h.ticker}
                        </Link>
                        <span className="truncate text-[12px] text-[#5a6e82]">
                          {h.company}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {h.subcategory && (
                          <span
                            className="hidden rounded-md px-2 py-0.5 font-mono text-[9px] text-[#7a8799] sm:block"
                            style={{ border: "1px solid rgba(15,30,53,0.09)" }}
                          >
                            {h.subcategory}
                          </span>
                        )}
                        <span className="font-mono text-[11px] tabular-nums text-[#7a8799]">
                          {normPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div
            className="flex h-full min-h-[120px] items-center justify-center rounded-2xl"
            style={{
              border: "1px dashed rgba(15,30,53,0.12)",
            }}
          >
            <p className="font-mono text-[11px] text-[#a8b2bd]">
              Select a theme to see holdings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
