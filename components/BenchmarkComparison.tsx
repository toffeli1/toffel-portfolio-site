"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { HistoricalPoint } from "@/lib/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const BENCHMARK_TICKERS = ["VOO", "QQQ"] as const;
type BenchmarkTicker = (typeof BENCHMARK_TICKERS)[number];

const BENCHMARK_COLORS: Record<string, string> = {
  VOO: "#1a3a5c",
  QQQ: "#8b2530",
};

// 17-color palette: distinct dark tones that fit the editorial design system
const HOLDING_PALETTE = [
  "#2e7dd4",
  "#2e9a5e",
  "#c45c1b",
  "#7b4db0",
  "#1a8c8c",
  "#c07a1a",
  "#2e9a7a",
  "#8c2e5a",
  "#1a7a5c",
  "#5a9a1a",
  "#9b3a2a",
  "#2e5a9a",
  "#8c7a1a",
  "#5a1a8c",
  "#3e9b3e",
  "#4a8c2e",
  "#2e4a8c",
];

// ±4 days tolerance for aligning weekly candle timestamps across tickers
const TOLERANCE_SECONDS = 4 * 86400;

// ── Types ─────────────────────────────────────────────────────────────────────

type ChartRow = {
  t: number;
  label: string;
  dateLabel: string;
  [ticker: string]: number | string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtXLabel(t: number): string {
  const d = new Date(t * 1000);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function fmtTooltipDate(t: number): string {
  return new Date(t * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function fetchSeries(
  ticker: string
): Promise<{ ticker: string; points: HistoricalPoint[] } | null> {
  try {
    const r = await fetch(`/api/history/${ticker}?range=3y`);
    if (!r.ok) return null;
    const data: { points: HistoricalPoint[] } = await r.json();
    if (!data.points || data.points.length < 2) return null;
    return { ticker, points: data.points };
  } catch {
    return null;
  }
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

interface TooltipItemShape {
  dataKey: string;
  value: number | null;
  payload: ChartRow;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipItemShape[];
  activeHoldings: Set<string>;
  colorOf: (t: string) => string;
}

function CustomTooltip({
  active,
  payload,
  activeHoldings,
  colorOf,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const dateLabel = payload[0]?.payload?.dateLabel ?? "";

  const benchItems = payload.filter(
    (p) =>
      BENCHMARK_TICKERS.includes(p.dataKey as BenchmarkTicker) &&
      p.value != null
  );
  const holdingItems = payload
    .filter(
      (p) =>
        !BENCHMARK_TICKERS.includes(p.dataKey as BenchmarkTicker) &&
        activeHoldings.has(p.dataKey) &&
        p.value != null
    )
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const items = [...benchItems, ...holdingItems];
  if (items.length === 0) return null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.1)",
        borderRadius: 8,
        padding: "8px 14px",
        boxShadow: "0 4px 16px rgba(15,30,53,0.08)",
        minWidth: 150,
      }}
    >
      <p
        style={{
          color: "#7a8799",
          fontSize: 10,
          fontFamily: "var(--font-geist-mono)",
          marginBottom: 7,
        }}
      >
        {dateLabel}
      </p>
      {items.map((item) => {
        const isBench = BENCHMARK_TICKERS.includes(
          item.dataKey as BenchmarkTicker
        );
        return (
          <div
            key={item.dataKey}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 20,
              marginBottom: 3,
            }}
          >
            <span
              style={{
                color: colorOf(item.dataKey),
                fontFamily: "var(--font-geist-mono)",
                fontSize: 10,
                fontWeight: isBench ? 700 : 400,
              }}
            >
              {item.dataKey}
            </span>
            <span
              style={{
                color: "#0f1e35",
                fontFamily: "var(--font-geist-mono)",
                fontSize: 11,
                fontWeight: 600,
                tabularNums: true,
              } as React.CSSProperties}
            >
              {item.value != null ? item.value.toFixed(1) : "—"}
            </span>
          </div>
        );
      })}
      {holdingItems.length === 0 && (
        <p
          style={{
            color: "#c8d0d8",
            fontFamily: "var(--font-geist-mono)",
            fontSize: 9,
            marginTop: 5,
          }}
        >
          select holdings below
        </p>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BenchmarkComparison({
  holdingTickers,
}: {
  holdingTickers: string[];
}) {
  const [seriesMap, setSeriesMap] = useState<Record<string, HistoricalPoint[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);
  const [activeHoldings, setActiveHoldings] = useState<Set<string>>(new Set());

  // Benchmarks live in their own bucket; holdings exclude them to avoid duplication.
  const holdingsOnly = useMemo(
    () =>
      holdingTickers.filter(
        (t) => !BENCHMARK_TICKERS.includes(t as BenchmarkTicker)
      ),
    [holdingTickers]
  );

  const allFetchTickers = useMemo(
    () => [...new Set([...BENCHMARK_TICKERS, ...holdingsOnly])],
    [holdingsOnly]
  );

  const holdingColors = useMemo(() => {
    const map: Record<string, string> = {};
    holdingsOnly.forEach((t, i) => {
      map[t] = HOLDING_PALETTE[i % HOLDING_PALETTE.length];
    });
    return map;
  }, [holdingsOnly]);

  const colorOf = useCallback(
    (ticker: string) =>
      BENCHMARK_COLORS[ticker] ?? holdingColors[ticker] ?? "#a8b2bd",
    [holdingColors]
  );

  // Fetch all series in parallel; failures are silently excluded
  const fetchKey = allFetchTickers.join(",");
  useEffect(() => {
    setLoading(true);
    setSeriesMap({});
    setFailed([]);
    setActiveHoldings(new Set());
    Promise.allSettled(allFetchTickers.map(fetchSeries)).then((results) => {
      const map: Record<string, HistoricalPoint[]> = {};
      const failedList: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          map[allFetchTickers[i]] = r.value.points;
        } else {
          failedList.push(allFetchTickers[i]);
        }
      });
      setSeriesMap(map);
      setFailed(failedList);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  // Merge all series onto the master timeline; normalize each to 100 at start
  const { chartData, presentBenchmarks, presentHoldings } = useMemo(() => {
    const presentKeys = Object.keys(seriesMap);
    if (presentKeys.length === 0)
      return {
        chartData: [] as ChartRow[],
        presentBenchmarks: [] as string[],
        presentHoldings: [] as string[],
      };

    // Master timeline = VOO if available, else the longest series
    const masterKey = seriesMap["VOO"]
      ? "VOO"
      : presentKeys.reduce((a, b) =>
          seriesMap[a].length >= seriesMap[b].length ? a : b
        );

    const masterPoints = seriesMap[masterKey];

    // Build chart rows aligned to master timeline
    const rows: ChartRow[] = masterPoints.map((mp) => {
      const row: ChartRow = {
        t: mp.t,
        label: fmtXLabel(mp.t),
        dateLabel: fmtTooltipDate(mp.t),
      };
      for (const ticker of presentKeys) {
        const pts = seriesMap[ticker];
        const nearest = pts.reduce((best, p) =>
          Math.abs(p.t - mp.t) < Math.abs(best.t - mp.t) ? p : best
        );
        row[ticker] =
          Math.abs(nearest.t - mp.t) <= TOLERANCE_SECONDS ? nearest.c : null;
      }
      return row;
    });

    // Normalize: find each ticker's first non-null value and scale to 100
    for (const ticker of presentKeys) {
      let baseline: number | null = null;
      for (const row of rows) {
        if (row[ticker] != null) {
          baseline = row[ticker] as number;
          break;
        }
      }
      if (baseline != null && baseline !== 0) {
        for (const row of rows) {
          if (row[ticker] != null) {
            row[ticker] = ((row[ticker] as number) / baseline) * 100;
          }
        }
      }
    }

    const presentBenchmarks = (BENCHMARK_TICKERS as readonly string[]).filter(
      (t) => presentKeys.includes(t)
    );
    const presentHoldings = holdingsOnly.filter((t) => presentKeys.includes(t));

    return { chartData: rows, presentBenchmarks, presentHoldings };
  }, [seriesMap, holdingsOnly]);

  const toggleHolding = useCallback((ticker: string) => {
    setActiveHoldings((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setActiveHoldings(new Set(presentHoldings));
  }, [presentHoldings]);

  const clearAll = useCallback(() => setActiveHoldings(new Set()), []);

  // Stable tooltip renderer — rebuilt only when activeHoldings or colorOf change
  const tooltipContent = useCallback(
    (props: object) =>
      (
        <CustomTooltip
          {...(props as CustomTooltipProps)}
          activeHoldings={activeHoldings}
          colorOf={colorOf}
        />
      ),
    [activeHoldings, colorOf]
  );

  return (
    <div
      className="rounded-2xl px-6 pt-6 pb-5"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      {/* Header */}
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7a8799]">
          3Y Relative Performance
        </p>
        <p className="mt-1.5 font-mono text-[10px] text-[#a8b2bd]">
          Normalized to 100 at start of period · VOO &amp; QQQ as benchmarks ·
          click holdings below to overlay
        </p>
      </div>

      {/* Chart */}
      <div style={{ height: 300 }}>
        {loading ? (
          <div
            className="h-full w-full animate-pulse rounded-xl"
            style={{ background: "rgba(15,30,53,0.04)" }}
          />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[11px] text-[#a8b2bd]">
              Historical data unavailable
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
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
                minTickGap={80}
              />
              <YAxis
                tick={{
                  fill: "#a8b2bd",
                  fontSize: 9,
                  fontFamily: "var(--font-geist-mono)",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toFixed(0)}
                domain={["auto", "auto"]}
                width={36}
              />

              {/* Baseline at 100 */}
              <ReferenceLine
                y={100}
                stroke="rgba(15,30,53,0.14)"
                strokeDasharray="4 3"
              />

              <Tooltip content={tooltipContent} />

              {/* Holdings — all rendered, muted until activated */}
              {presentHoldings.map((ticker) => {
                const isActive = activeHoldings.has(ticker);
                return (
                  <Line
                    key={ticker}
                    dataKey={ticker}
                    stroke={colorOf(ticker)}
                    strokeWidth={isActive ? 2 : 1}
                    strokeOpacity={isActive ? 1 : 0.18}
                    dot={false}
                    activeDot={
                      isActive
                        ? { r: 3, fill: colorOf(ticker), strokeWidth: 0 }
                        : false
                    }
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                );
              })}

              {/* Benchmarks — always prominent, rendered last so they sit on top */}
              {presentBenchmarks.map((ticker) => (
                <Line
                  key={ticker}
                  dataKey={ticker}
                  stroke={BENCHMARK_COLORS[ticker]}
                  strokeWidth={2.5}
                  strokeOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 3.5,
                    fill: BENCHMARK_COLORS[ticker],
                    strokeWidth: 0,
                  }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {!loading && (
        <div className="mt-5 space-y-4">
          {/* Benchmark labels — always visible, not toggleable */}
          {presentBenchmarks.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                Benchmarks
              </span>
              {presentBenchmarks.map((ticker) => (
                <div key={ticker} className="flex items-center gap-1.5">
                  <span
                    style={{
                      display: "inline-block",
                      width: 18,
                      height: 2.5,
                      borderRadius: 2,
                      backgroundColor: BENCHMARK_COLORS[ticker],
                    }}
                  />
                  <span
                    className="font-mono text-[10px] font-semibold"
                    style={{ color: BENCHMARK_COLORS[ticker] }}
                  >
                    {ticker}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Holdings toggle pills */}
          {presentHoldings.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                  Holdings
                </span>
                <button
                  onClick={selectAll}
                  className="font-mono text-[9px] text-[#a8b2bd] underline-offset-2 transition-colors hover:text-[#5a6e82]"
                >
                  select all
                </button>
                <span className="font-mono text-[9px] text-[#c8d0d8]">·</span>
                <button
                  onClick={clearAll}
                  className="font-mono text-[9px] text-[#a8b2bd] underline-offset-2 transition-colors hover:text-[#5a6e82]"
                >
                  clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presentHoldings.map((ticker) => {
                  const isActive = activeHoldings.has(ticker);
                  const color = colorOf(ticker);
                  return (
                    <button
                      key={ticker}
                      onClick={() => toggleHolding(ticker)}
                      className="flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[10px] transition-all"
                      style={{
                        color: isActive ? color : "#a8b2bd",
                        background: isActive ? `${color}14` : "transparent",
                        border: `1px solid ${
                          isActive ? `${color}55` : "rgba(15,30,53,0.1)"
                        }`,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          backgroundColor: isActive
                            ? color
                            : "rgba(15,30,53,0.2)",
                        }}
                      />
                      {ticker}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Failed tickers note */}
          {failed.filter((t) => !BENCHMARK_TICKERS.includes(t as BenchmarkTicker)).length > 0 && (
            <p className="font-mono text-[9px] text-[#c8d0d8]">
              No 3Y data:{" "}
              {failed
                .filter(
                  (t) => !BENCHMARK_TICKERS.includes(t as BenchmarkTicker)
                )
                .join(", ")}
            </p>
          )}
        </div>
      )}

      <p className="mt-4 font-mono text-[9px] leading-[1.5] text-[#a8b2bd]">
        Normalized relative performance · not based on actual position size ·
        past performance does not guarantee future results
      </p>
    </div>
  );
}
