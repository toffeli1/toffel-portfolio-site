"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { HistoricalPoint } from "@/lib/types";
import type { PurchaseLot } from "@/lib/positionLots";

// ── types ─────────────────────────────────────────────────────────────────────

type Range = "1w" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y" | "max";

export interface EntryMarker {
  price: number;
  source: "confirmed" | "estimated";
}

export interface ExitMarker {
  date: string;     // "YYYY-MM-DD"
  reason?: string;  // e.g., "Reallocated / Valuation discipline"
}

interface PurchaseCluster {
  lots: PurchaseLot[];
  date: string;
  endDate: string;
  isCluster: boolean;
  isRecurring: boolean;
  totalAmount: number;
}

interface TooltipState {
  cluster: PurchaseCluster;
  x: number;
  y: number;
}

// ── constants ─────────────────────────────────────────────────────────────────

const RANGES: { key: Range; label: string }[] = [
  { key: "1w",  label: "1W"  },
  { key: "1m",  label: "1M"  },
  { key: "3m",  label: "3M"  },
  { key: "6m",  label: "6M"  },
  { key: "1y",  label: "1Y"  },
  { key: "3y",  label: "3Y"  },
  { key: "5y",  label: "5Y"  },
  { key: "max", label: "MAX" },
];

// ── formatters ────────────────────────────────────────────────────────────────

function formatXTick(timestamp: number, range: Range): string {
  const d = new Date(timestamp * 1000);
  if (range === "1w" || range === "1m" || range === "3m")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (range === "6m")
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  if (range === "max")
    return d.getFullYear().toString();
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatTooltipDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(v: number): string {
  return `$${v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLotDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ── clustering ────────────────────────────────────────────────────────────────

function makePurchaseCluster(lots: PurchaseLot[]): PurchaseCluster {
  return {
    lots,
    date: lots[0].date,
    endDate: lots[lots.length - 1].date,
    isCluster: lots.length > 1,
    isRecurring: lots.every((l) => l.isRecurring),
    totalAmount: lots.reduce((s, l) => s + l.amountUsd, 0),
  };
}

function clusterLots(lots: PurchaseLot[]): PurchaseCluster[] {
  const sorted = [...lots].sort(
    (a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
  );

  const clusters: PurchaseCluster[] = [];
  let i = 0;

  while (i < sorted.length) {
    const lot = sorted[i];

    if (lot.isRecurring) {
      const group: PurchaseLot[] = [lot];
      let j = i + 1;
      while (j < sorted.length && sorted[j].isRecurring) {
        group.push(sorted[j]);
        j++;
      }
      clusters.push(makePurchaseCluster(group));
      i = j;
    } else {
      const group: PurchaseLot[] = [lot];
      let j = i + 1;
      while (j < sorted.length && !sorted[j].isRecurring && sorted[j].date === lot.date) {
        group.push(sorted[j]);
        j++;
      }
      clusters.push(makePurchaseCluster(group));
      i = i + group.length;
    }
  }

  return clusters;
}

// ── chart data ────────────────────────────────────────────────────────────────

interface ChartPoint {
  t: number;
  c: number;
  dateLabel: string;
}

function findNearestPoint(date: string, chartData: ChartPoint[]): ChartPoint | null {
  if (chartData.length === 0) return null;
  const targetSec = parseLocalDate(date).getTime() / 1000;
  return chartData.reduce((closest, point) =>
    Math.abs(point.t - targetSec) < Math.abs(closest.t - targetSec) ? point : closest
  );
}

function formatAvgCostLabel(v: number): string {
  if (v >= 1000) return `avg cost  $${(v / 1000).toFixed(2)}k`;
  return `avg cost  $${v.toFixed(2)}`;
}

// ── component ─────────────────────────────────────────────────────────────────

export function PositionChart({
  ticker,
  entryMarker,
  purchaseLots,
  averageCost,
  exitMarker,
  defaultRange,
}: {
  ticker: string;
  entryMarker?: EntryMarker;
  purchaseLots?: PurchaseLot[];
  averageCost?: number;
  exitMarker?: ExitMarker;
  defaultRange?: Range;
}) {
  const [range, setRange] = useState<Range>(defaultRange ?? "1y");
  const [points, setPoints] = useState<HistoricalPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [markerTooltip, setMarkerTooltip] = useState<TooltipState | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const chartData = useMemo(
    (): ChartPoint[] =>
      (points ?? []).map((p) => ({
        t: p.t,
        c: p.c,
        dateLabel: formatTooltipDate(p.t),
      })),
    [points, range]  // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── legacy single entry marker ─────────────────────────────────────────────

  const entryPoint = useMemo(() => {
    if (purchaseLots || !entryMarker || chartData.length === 0) return null;
    return chartData.reduce((closest, point) =>
      Math.abs(point.c - entryMarker.price) < Math.abs(closest.c - entryMarker.price)
        ? point
        : closest
    );
  }, [entryMarker, purchaseLots, chartData]);

  // ── exit marker ───────────────────────────────────────────────────────────

  const exitPoint = useMemo(() => {
    if (!exitMarker || chartData.length === 0) return null;
    return findNearestPoint(exitMarker.date, chartData);
  }, [exitMarker, chartData]);

  // ── purchase clusters ──────────────────────────────────────────────────────

  const visibleClusters = useMemo(() => {
    if (!purchaseLots || chartData.length === 0) return [];
    const rangeStart = chartData[0].t;
    return clusterLots(purchaseLots).filter(
      (c) => parseLocalDate(c.date).getTime() / 1000 >= rangeStart
    );
  }, [purchaseLots, chartData]);

  // ── y-range for event line bottoms ─────────────────────────────────────────

  const lineBottom = useMemo(() => {
    if (chartData.length === 0) return 0;
    const values = chartData.map((p) => p.c);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min - (max - min) * 0.25;
  }, [chartData]);

  // ── chart appearance ───────────────────────────────────────────────────────

  const firstC = chartData[0]?.c ?? 0;
  const lastC = chartData[chartData.length - 1]?.c ?? 0;
  const isUp = lastC >= firstC;
  const lineColor =
    chartData.length >= 2 ? (isUp ? "#15542e" : "#8b1a1a") : "#1a3a5c";
  const gradId = `chart-grad-${ticker}`;

  // ── dot hover handlers ─────────────────────────────────────────────────────

  const handleDotEnter = (cluster: PurchaseCluster, idx: number) =>
    (e: React.MouseEvent) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMarkerTooltip({ cluster, x: e.clientX - rect.left, y: e.clientY - rect.top });
      setHoveredIdx(idx);
    };

  const handleDotLeave = () => {
    setMarkerTooltip(null);
    setHoveredIdx(null);
  };

  return (
    <div
      ref={cardRef}
      className="rounded-2xl px-6 pt-6 pb-4"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
        position: "relative",
      }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7a8799]">
            Price Chart
          </p>
          {purchaseLots && purchaseLots.length > 0 && (
            <p className="font-mono text-[9px] text-[#a8b2bd]">
              ◎&ensp;purchase events
            </p>
          )}
          {averageCost && (
            <p className="font-mono text-[9px] text-[#a8b2bd]">
              — avg cost
            </p>
          )}
          {!purchaseLots && entryMarker && (
            <p className="font-mono text-[9px] text-[#a8b2bd]">
              ◎&ensp;
              {entryMarker.source === "confirmed" ? "confirmed entry" : "estimated entry"}
            </p>
          )}
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

      {/* Chart body */}
      <div style={{ height: 300 }}>
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
              margin={{ top: 16, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tick={{
                  fill: "#a8b2bd",
                  fontSize: 9,
                  fontFamily: "var(--font-geist-mono)",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
                tickFormatter={(v: number) => formatXTick(v, range)}
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
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`
                }
                domain={["auto", "auto"]}
                width={52}
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
                formatter={(value: unknown) => [
                  <span
                    key="price"
                    style={{
                      color: "#0f1e35",
                      fontSize: 13,
                      fontFamily: "var(--font-geist-mono)",
                      fontWeight: 600,
                    }}
                  >
                    {formatPrice(Number(value))}
                  </span>,
                  "",
                ]}
                itemStyle={{ padding: 0 }}
                separator=""
              />

              <Area
                type="monotone"
                dataKey="c"
                stroke={lineColor}
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
                isAnimationActive={false}
              />

              {/* Average cost reference line */}
              {averageCost && (
                <ReferenceLine
                  y={averageCost}
                  stroke="#1a3a5c"
                  strokeOpacity={0.22}
                  strokeWidth={1}
                  strokeDasharray="3 5"
                  label={{
                    value: formatAvgCostLabel(averageCost),
                    position: "insideTopRight",
                    fontSize: 8,
                    fontFamily: "var(--font-geist-mono)",
                    fill: "#a8b2bd",
                    dy: -5,
                  }}
                />
              )}

              {/* Event lines — rendered behind dots */}
              {visibleClusters.map((cluster, idx) => {
                const point = findNearestPoint(cluster.date, chartData);
                if (!point) return null;
                const isHighlighted = hoveredIdx === idx;
                const isDimmed = hoveredIdx !== null && !isHighlighted;
                return (
                  <ReferenceLine
                    key={`evtline-${idx}`}
                    segment={[
                      { x: point.t, y: lineBottom },
                      { x: point.t, y: point.c },
                    ]}
                    ifOverflow="visible"
                    stroke="#0f1e35"
                    strokeOpacity={
                      isHighlighted
                        ? 0.38
                        : isDimmed
                        ? 0.04
                        : cluster.isRecurring
                        ? 0.09
                        : 0.16
                    }
                    strokeDasharray={cluster.isRecurring ? undefined : "2 4"}
                    strokeWidth={cluster.isRecurring ? 0.75 : 1}
                  />
                );
              })}

              {/* Legacy single entry marker */}
              {entryPoint && !purchaseLots && (
                <ReferenceDot
                  x={entryPoint.t}
                  y={entryPoint.c}
                  r={5}
                  fill="none"
                  stroke="#7a8799"
                  strokeWidth={1.5}
                  label={{
                    value:
                      entryMarker?.source === "confirmed" ? "Entry" : "Est. entry",
                    position: "top",
                    fontSize: 9,
                    fontFamily: "var(--font-geist-mono)",
                    fill: "#7a8799",
                    offset: 8,
                  }}
                />
              )}

              {/* Purchase dots — rendered on top of event lines */}
              {visibleClusters.map((cluster, idx) => {
                const point = findNearestPoint(cluster.date, chartData);
                if (!point) return null;
                const isHighlighted = hoveredIdx === idx;
                const isDimmed = hoveredIdx !== null && !isHighlighted;
                const onEnter = handleDotEnter(cluster, idx);

                return (
                  <ReferenceDot
                    key={`dot-${idx}`}
                    x={point.t}
                    y={point.c}
                    r={0}
                    fill="none"
                    stroke="none"
                    shape={((props: { cx?: number; cy?: number }) => {
                      const cx = props.cx ?? 0;
                      const cy = props.cy ?? 0;
                      const dotR = cluster.isRecurring
                        ? 3
                        : cluster.isCluster
                        ? 5.5
                        : 4.5;
                      const dotFill = cluster.isRecurring
                        ? "rgba(15,30,53,0.38)"
                        : cluster.isCluster
                        ? "#0f1e35"
                        : "#1a3a5c";
                      const baseOpacity = cluster.isRecurring ? 0.55 : 0.78;
                      const opacity = isDimmed
                        ? 0.1
                        : isHighlighted
                        ? 1
                        : baseOpacity;

                      return (
                        <g style={{ opacity }}>
                          {/* Transparent hit area */}
                          <rect
                            x={cx - 10}
                            y={cy - dotR - 6}
                            width={20}
                            height={dotR * 2 + 12}
                            fill="transparent"
                            style={{ cursor: "default" }}
                            onMouseEnter={onEnter}
                            onMouseLeave={handleDotLeave}
                          />
                          {/* Hover ring */}
                          {isHighlighted && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={dotR + 5}
                              fill="none"
                              stroke="#1a3a5c"
                              strokeWidth={1}
                              strokeOpacity={0.22}
                              style={{ pointerEvents: "none" }}
                            />
                          )}
                          {/* Main dot */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHighlighted ? dotR + 0.5 : dotR}
                            fill={dotFill}
                            style={{ pointerEvents: "none" }}
                          />
                          {/* ×N label for same-date multi-lot clusters */}
                          {cluster.isCluster && !cluster.isRecurring && (
                            <text
                              x={cx}
                              y={cy - dotR - 4}
                              textAnchor="middle"
                              fontSize={7}
                              fontFamily="var(--font-geist-mono)"
                              fill="#0f1e35"
                              fillOpacity={0.42}
                              style={{ pointerEvents: "none" }}
                            >
                              ×{cluster.lots.length}
                            </text>
                          )}
                        </g>
                      );
                    }) as never}
                  />
                );
              })}
              {/* Exit marker — vertical line + × dot */}
              {exitPoint && (
                <>
                  <ReferenceLine
                    segment={[
                      { x: exitPoint.t, y: lineBottom },
                      { x: exitPoint.t, y: exitPoint.c },
                    ]}
                    ifOverflow="visible"
                    stroke="#8b2530"
                    strokeOpacity={0.45}
                    strokeWidth={1.25}
                  />
                  <ReferenceDot
                    x={exitPoint.t}
                    y={exitPoint.c}
                    r={0}
                    fill="none"
                    stroke="none"
                    shape={((props: { cx?: number; cy?: number }) => {
                      const cx = props.cx ?? 0;
                      const cy = props.cy ?? 0;
                      const r = 5;
                      return (
                        <g>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r + 4}
                            fill="transparent"
                            style={{ pointerEvents: "none" }}
                          />
                          <line
                            x1={cx - r}
                            y1={cy - r}
                            x2={cx + r}
                            y2={cy + r}
                            stroke="#8b2530"
                            strokeWidth={1.75}
                            strokeOpacity={0.8}
                            style={{ pointerEvents: "none" }}
                          />
                          <line
                            x1={cx + r}
                            y1={cy - r}
                            x2={cx - r}
                            y2={cy + r}
                            stroke="#8b2530"
                            strokeWidth={1.75}
                            strokeOpacity={0.8}
                            style={{ pointerEvents: "none" }}
                          />
                          <text
                            x={cx}
                            y={cy - r - 5}
                            textAnchor="middle"
                            fontSize={8}
                            fontFamily="var(--font-geist-mono)"
                            fill="#8b2530"
                            fillOpacity={0.65}
                            style={{ pointerEvents: "none" }}
                          >
                            Exited
                          </text>
                        </g>
                      );
                    }) as never}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Estimated entry footnote */}
      {!purchaseLots && entryMarker?.source === "estimated" && entryPoint && (
        <p className="mt-3 font-mono text-[9px] text-[#a8b2bd]">
          Estimated entry dates are inferred from the known entry price and
          historical price alignment. Not a confirmed purchase date.
        </p>
      )}

      {/* Purchase marker tooltip overlay */}
      {markerTooltip && (
        <PurchaseTooltip state={markerTooltip} cardRef={cardRef} />
      )}
    </div>
  );
}

// ── Purchase marker tooltip ───────────────────────────────────────────────────

function PurchaseTooltip({
  state,
  cardRef,
}: {
  state: TooltipState;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { cluster, x, y } = state;
  const cardWidth = cardRef.current?.offsetWidth ?? 600;
  const tooltipWidth = 224;
  const left = x + 16 + tooltipWidth > cardWidth ? x - tooltipWidth - 16 : x + 16;
  const top = Math.max(y - 20, 8);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        zIndex: 60,
        pointerEvents: "none",
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.10)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(15,30,53,0.10)",
        fontFamily: "var(--font-geist-mono)",
        width: tooltipWidth,
      }}
    >
      <p
        style={{
          color: "#7a8799",
          fontSize: 10,
          marginBottom: 8,
          letterSpacing: "0.04em",
        }}
      >
        {cluster.isRecurring
          ? `${formatLotDate(cluster.date)} – ${formatLotDate(cluster.endDate)}`
          : formatLotDate(cluster.date)}
        {cluster.isCluster && !cluster.isRecurring && (
          <span style={{ color: "#a8b2bd", marginLeft: 6 }}>
            · {cluster.lots.length} lots
          </span>
        )}
      </p>

      {cluster.isRecurring ? (
        <>
          <p style={{ color: "#0f1e35", fontWeight: 600, fontSize: 13 }}>
            $
            {cluster.totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p style={{ color: "#a8b2bd", fontSize: 10, marginTop: 3 }}>
            {cluster.lots.length} recurring buys · $
            {cluster.lots[0].amountUsd.toFixed(0)} each
          </p>
        </>
      ) : (
        cluster.lots.map((lot, i) => (
          <div
            key={i}
            style={{
              marginTop: i > 0 ? 8 : 0,
              paddingTop: i > 0 ? 8 : 0,
              borderTop: i > 0 ? "1px solid rgba(15,30,53,0.06)" : "none",
            }}
          >
            <p style={{ color: "#0f1e35", fontWeight: 600, fontSize: 13 }}>
              ${lot.amountUsd.toFixed(2)}
            </p>
            <p style={{ color: "#7a8799", fontSize: 10, marginTop: 2 }}>
              {lot.shares.toFixed(4)} sh&ensp;·&ensp;$
              {lot.pricePerShare.toFixed(2)}/sh
            </p>
            {lot.isPartial && (
              <p style={{ color: "#b0bac5", fontSize: 9, marginTop: 2 }}>
                Post-sale remainder
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
