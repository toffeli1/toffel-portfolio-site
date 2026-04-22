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

const HOLDING_PALETTE = [
  "#2e7dd4", "#2e9a5e", "#c45c1b", "#7b4db0", "#1a8c8c",
  "#c07a1a", "#2e9a7a", "#8c2e5a", "#1a7a5c", "#5a9a1a",
  "#9b3a2a", "#2e5a9a", "#8c7a1a", "#5a1a8c", "#3e9b3e",
  "#4a8c2e", "#2e4a8c",
];

// ±4 days tolerance for aligning timestamps across tickers
const TOLERANCE_SECONDS = 4 * 86400;

// ── Types ─────────────────────────────────────────────────────────────────────

type Range = "1y" | "3y" | "5y" | "10y";

interface RangeConfig {
  key: Range;
  label: string;
  useLog: boolean;
}

const RANGE_CONFIGS: RangeConfig[] = [
  { key: "1y",  label: "1Y",  useLog: false },
  { key: "3y",  label: "3Y",  useLog: false },
  { key: "5y",  label: "5Y",  useLog: true  },
  { key: "10y", label: "10Y", useLog: true  },
];

// Pre-computed log-scale tick candidates; filtered to the visible range at render time
const LOG_TICKS = [
  25, 40, 50, 60, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500,
  600, 700, 750, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000,
];

type ChartRow = {
  t: number;
  label: string;
  dateLabel: string;
  [ticker: string]: number | string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtXLabel(t: number, range: Range): string {
  const d = new Date(t * 1000);
  if (range === "1y" || range === "3y") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { year: "numeric" });
}

function fmtTooltipDate(t: number): string {
  return new Date(t * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtIndex(v: number): string {
  if (v >= 10000) return v.toFixed(0);
  if (v >= 1000) return v.toFixed(0);
  if (v >= 100) return v.toFixed(0);
  return v.toFixed(0);
}

async function fetchSeries(
  ticker: string,
  range: Range
): Promise<{ ticker: string; points: HistoricalPoint[] } | null> {
  try {
    const r = await fetch(`/api/history/${ticker}?range=${range}`);
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
    (p) => BENCHMARK_TICKERS.includes(p.dataKey as BenchmarkTicker) && p.value != null
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
        const isBench = BENCHMARK_TICKERS.includes(item.dataKey as BenchmarkTicker);
        const val = item.value;
        const gain = val != null ? val - 100 : null;
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
              }}
            >
              {val != null ? (
                <>
                  {fmtIndex(val)}
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 400,
                      marginLeft: 4,
                      color: gain != null && gain >= 0 ? "#1a4a2e" : "#8b2530",
                    }}
                  >
                    {gain != null ? (gain >= 0 ? "+" : "") + gain.toFixed(1) + "%" : ""}
                  </span>
                </>
              ) : (
                <span style={{ color: "#c8d0d8" }}>—</span>
              )}
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
  const [range, setRange] = useState<Range>("1y");
  const [seriesMap, setSeriesMap] = useState<Record<string, HistoricalPoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);
  const [activeHoldings, setActiveHoldings] = useState<Set<string>>(new Set());

  const useLog = RANGE_CONFIGS.find((r) => r.key === range)?.useLog ?? false;

  const holdingsOnly = useMemo(
    () => holdingTickers.filter((t) => !BENCHMARK_TICKERS.includes(t as BenchmarkTicker)),
    [holdingTickers]
  );

  const allFetchTickers = useMemo(
    () => [...new Set([...BENCHMARK_TICKERS, ...holdingsOnly])],
    [holdingsOnly]
  );

  const holdingColors = useMemo(() => {
    const map: Record<string, string> = {};
    holdingsOnly.forEach((t, i) => { map[t] = HOLDING_PALETTE[i % HOLDING_PALETTE.length]; });
    return map;
  }, [holdingsOnly]);

  const colorOf = useCallback(
    (ticker: string) => BENCHMARK_COLORS[ticker] ?? holdingColors[ticker] ?? "#a8b2bd",
    [holdingColors]
  );

  // Fetch all series whenever range or tickers change
  const fetchKey = `${allFetchTickers.join(",")}-${range}`;
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSeriesMap({});
    setFailed([]);
    setActiveHoldings(new Set());

    Promise.allSettled(allFetchTickers.map((t) => fetchSeries(t, range))).then(
      (results) => {
        if (cancelled) return;
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
      }
    );

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  // Build merged, normalized chart data and detect partial-history tickers
  const { chartData, presentBenchmarks, presentHoldings, partialHistory } =
    useMemo(() => {
      const presentKeys = Object.keys(seriesMap);
      const empty = {
        chartData: [] as ChartRow[],
        presentBenchmarks: [] as string[],
        presentHoldings: [] as string[],
        partialHistory: new Set<string>(),
      };
      if (presentKeys.length === 0) return empty;

      // Master timeline = VOO (longest available baseline); fallback to longest series
      const masterKey = seriesMap["VOO"]
        ? "VOO"
        : presentKeys.reduce((a, b) =>
            seriesMap[a].length >= seriesMap[b].length ? a : b
          );
      const masterPoints = seriesMap[masterKey];

      // Merge onto master timeline
      const rows: ChartRow[] = masterPoints.map((mp) => {
        const row: ChartRow = {
          t: mp.t,
          label: fmtXLabel(mp.t, range),
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

      // Normalize each ticker to 100 at its first non-null data point
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

      // Detect partial history: first non-null appears after >3% of the period
      const partialHistory = new Set<string>();
      const totalRows = rows.length;
      for (const ticker of [...presentBenchmarks, ...presentHoldings]) {
        const firstIdx = rows.findIndex((r) => r[ticker] != null);
        if (firstIdx > totalRows * 0.03) {
          partialHistory.add(ticker);
        }
      }

      return { chartData: rows, presentBenchmarks, presentHoldings, partialHistory };
    }, [seriesMap, holdingsOnly, range]);

  // Compute Y-axis domain for log scale; ensure benchmarks always fill the frame
  const yDomain = useMemo((): [number, number] | ["auto", "auto"] => {
    if (!useLog || chartData.length === 0) return ["auto", "auto"];

    // Collect all finite positive values from benchmarks (always) + active holdings
    const visibleTickers = [
      ...presentBenchmarks,
      ...presentHoldings.filter((t) => activeHoldings.has(t)),
    ];
    // Fall back to all holdings if nothing is active (for initial domain sizing)
    const sourceTickers =
      visibleTickers.length > 0
        ? visibleTickers
        : [...presentBenchmarks, ...presentHoldings];

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const row of chartData) {
      for (const t of sourceTickers) {
        const v = row[t];
        if (typeof v === "number" && v > 0 && isFinite(v)) {
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        }
      }
    }

    if (!isFinite(minVal) || !isFinite(maxVal)) return [50, 400];

    return [Math.max(1, Math.floor(minVal * 0.88)), Math.ceil(maxVal * 1.08)];
  }, [useLog, chartData, presentBenchmarks, presentHoldings, activeHoldings]);

  // Derive clean log-scale tick marks within the computed domain
  const logTicks = useMemo(() => {
    if (!useLog || yDomain[0] === "auto") return undefined;
    const [lo, hi] = yDomain as [number, number];
    return LOG_TICKS.filter((v) => v >= lo * 0.9 && v <= hi * 1.1);
  }, [useLog, yDomain]);

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

  const tooltipContent = useCallback(
    (props: object) => (
      <CustomTooltip
        {...(props as CustomTooltipProps)}
        activeHoldings={activeHoldings}
        colorOf={colorOf}
      />
    ),
    [activeHoldings, colorOf]
  );

  // Tickers that have partial history and are currently visible (either active or benchmark)
  const visiblePartial = useMemo(() => {
    const vis = [
      ...presentBenchmarks,
      ...presentHoldings.filter((t) => activeHoldings.has(t)),
    ];
    return vis.filter((t) => partialHistory.has(t));
  }, [presentBenchmarks, presentHoldings, activeHoldings, partialHistory]);

  const failedHoldings = failed.filter(
    (t) => !BENCHMARK_TICKERS.includes(t as BenchmarkTicker)
  );

  const rangeLabel = RANGE_CONFIGS.find((r) => r.key === range)?.label ?? range.toUpperCase();

  return (
    <div
      className="rounded-2xl px-6 pt-6 pb-5"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      {/* ── Header + timeframe selector ─────────────────────────────────────── */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7a8799]">
            {rangeLabel} Relative Performance
          </p>
          <p className="mt-1.5 font-mono text-[10px] text-[#a8b2bd]">
            Normalized to 100 at start of period · VOO &amp; QQQ as benchmarks ·{" "}
            {useLog ? "log scale" : "linear scale"} · click holdings below to overlay
          </p>
        </div>

        {/* Timeframe pill buttons */}
        <div
          className="flex shrink-0 items-center rounded-lg p-0.5"
          style={{ background: "rgba(15,30,53,0.05)" }}
        >
          {RANGE_CONFIGS.map(({ key, label }) => {
            const isActive = range === key;
            return (
              <button
                key={key}
                onClick={() => setRange(key)}
                className="rounded px-3 py-1 font-mono text-[10px] transition-all duration-150"
                style={{
                  color: isActive ? "#0f1e35" : "#a8b2bd",
                  background: isActive ? "#ffffff" : "transparent",
                  boxShadow: isActive
                    ? "0 1px 3px rgba(15,30,53,0.12)"
                    : "none",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chart ───────────────────────────────────────────────────────────── */}
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
                minTickGap={range === "10y" ? 60 : 80}
              />
              <YAxis
                scale={useLog ? "log" : "linear"}
                domain={yDomain}
                {...(logTicks ? { ticks: logTicks } : {})}
                allowDataOverflow={false}
                tick={{
                  fill: "#a8b2bd",
                  fontSize: 9,
                  fontFamily: "var(--font-geist-mono)",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtIndex}
                width={useLog ? 44 : 36}
              />

              {/* Baseline at 100 */}
              <ReferenceLine
                y={100}
                stroke="rgba(15,30,53,0.14)"
                strokeDasharray="4 3"
              />

              <Tooltip content={tooltipContent} />

              {/* Holdings — all rendered, inactive ones muted */}
              {presentHoldings.map((ticker) => {
                const isActive = activeHoldings.has(ticker);
                const isPartial = partialHistory.has(ticker);
                return (
                  <Line
                    key={ticker}
                    dataKey={ticker}
                    stroke={colorOf(ticker)}
                    strokeWidth={isActive ? 2 : 1}
                    strokeOpacity={isActive ? 1 : 0.18}
                    strokeDasharray={isPartial && isActive ? "5 3" : undefined}
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

      {/* ── Legend + controls ────────────────────────────────────────────────── */}
      {!loading && (
        <div className="mt-5 space-y-4">
          {/* Benchmark labels */}
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
                  className="font-mono text-[9px] text-[#a8b2bd] transition-colors hover:text-[#5a6e82]"
                >
                  select all
                </button>
                <span className="font-mono text-[9px] text-[#c8d0d8]">·</span>
                <button
                  onClick={clearAll}
                  className="font-mono text-[9px] text-[#a8b2bd] transition-colors hover:text-[#5a6e82]"
                >
                  clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {presentHoldings.map((ticker) => {
                  const isActive = activeHoldings.has(ticker);
                  const isPartial = partialHistory.has(ticker);
                  const color = colorOf(ticker);
                  return (
                    <button
                      key={ticker}
                      onClick={() => toggleHolding(ticker)}
                      title={
                        isPartial
                          ? `${ticker} — limited history in this timeframe`
                          : ticker
                      }
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
                          backgroundColor: isActive ? color : "rgba(15,30,53,0.2)",
                        }}
                      />
                      {ticker}
                      {isPartial && (
                        <span style={{ fontSize: 8, opacity: 0.6 }}>~</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Partial history note */}
          {visiblePartial.length > 0 && (
            <p className="font-mono text-[9px] leading-[1.6] text-[#b0bac5]">
              <span className="text-[#c8d0d8]">~</span>{" "}
              {visiblePartial.join(", ")}{" "}
              {visiblePartial.length === 1 ? "has" : "have"} a shorter trading
              history than this period — {visiblePartial.length === 1 ? "its" : "their"} line
              {visiblePartial.length === 1 ? " starts" : "s start"} at the first available
              data point, normalized to 100.
            </p>
          )}

          {/* Tickers with no data at all */}
          {failedHoldings.length > 0 && (
            <p className="font-mono text-[9px] text-[#c8d0d8]">
              No {rangeLabel} data available: {failedHoldings.join(", ")}
            </p>
          )}

          {/* Log-scale note */}
          {useLog && (
            <p className="font-mono text-[9px] text-[#c8d0d8]">
              Log scale — equal vertical distances represent equal percentage moves.
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
