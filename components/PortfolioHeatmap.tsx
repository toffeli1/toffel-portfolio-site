"use client";

// TradingView-style portfolio heatmap.
// Squarified treemap grouped by sector. Tile AREA encodes portfolio weight;
// tile COLOR encodes the selected-period return on a red→neutral→green scale.
// Reusable across sleeves — pass holdings (with a `sector`) + a sector order.
//
// Public-safe by construction: only ticker, name, weight %, and return %
// surface. No shares, dollar values, or cost basis.

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TICKER_LOGO_ASSETS } from "./TickerLogo";

// ── Public types ──────────────────────────────────────────────────────────────

export type HeatmapPeriod =
  | "sincePurchase"
  | "return12M"
  | "return6M"
  | "return3M"
  | "return1M";

export interface HeatmapHolding {
  ticker: string;
  name: string;
  /** Routes on click. Omit for a non-interactive tile. */
  href?: string;
  /** Portfolio weight %, drives tile area. */
  weightPct: number;
  /** Sector / category bucket. Tiles are grouped + sized within their sector. */
  sector: string;
  /** Period → return %. Missing periods render as flat/neutral. */
  returns: Partial<Record<HeatmapPeriod, number>>;
}

const PERIODS: { key: HeatmapPeriod; label: string; tag: string }[] = [
  { key: "sincePurchase", label: "Since Purchase", tag: "SINCE BUY" },
  { key: "return12M", label: "12M", tag: "12M" },
  { key: "return6M", label: "6M", tag: "6M" },
  { key: "return3M", label: "3M", tag: "3M" },
  { key: "return1M", label: "1M", tag: "1M" },
];

// Full-saturation return magnitude per period — longer windows compound to
// larger swings, so the color scale widens to keep contrast meaningful.
const SATURATION: Record<HeatmapPeriod, number> = {
  sincePurchase: 90,
  return12M: 80,
  return6M: 55,
  return3M: 40,
  return1M: 18,
};

// ── Color scale ─────────────────────────────────────────────────────────────

const NEUTRAL: [number, number, number] = [44, 51, 64]; // #2c3340 slate
const POS: [number, number, number] = [22, 160, 90]; // #16a05a green
const NEG: [number, number, number] = [193, 49, 62]; // #c1313e red

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function tileColor(ret: number | undefined, period: HeatmapPeriod): string {
  if (ret === undefined || !isFinite(ret)) {
    return `rgb(${NEUTRAL[0]},${NEUTRAL[1]},${NEUTRAL[2]})`;
  }
  const clamped = Math.max(-1, Math.min(1, ret / SATURATION[period]));
  // Ease so mild moves still read as tinted, not washed-out gray.
  const t = Math.sign(clamped) * Math.pow(Math.abs(clamped), 0.7);
  const [r, g, b] = mix(NEUTRAL, t >= 0 ? POS : NEG, Math.abs(t));
  return `rgb(${r},${g},${b})`;
}

function fmtPct(v: number | undefined): string {
  if (v === undefined || !isFinite(v)) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

// ── Squarified treemap ────────────────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface AreaItem<T> {
  area: number;
  data: T;
}
interface Placed<T> extends Rect {
  data: T;
}

function worstRatio<T>(row: AreaItem<T>[], side: number): number {
  const sum = row.reduce((s, r) => s + r.area, 0);
  const max = Math.max(...row.map((r) => r.area));
  const min = Math.min(...row.map((r) => r.area));
  const s2 = sum * sum;
  return Math.max((side * side * max) / s2, s2 / (side * side * min));
}

/** Squarified treemap (Bruls et al.). `items` are scaled so Σ area = w·h. */
function squarify<T>(items: AreaItem<T>[], rect: Rect): Placed<T>[] {
  const out: Placed<T>[] = [];
  const queue = [...items].sort((a, b) => b.area - a.area);
  let { x, y, w, h } = rect;

  let i = 0;
  while (i < queue.length) {
    const side = Math.min(w, h);
    let row: AreaItem<T>[] = [queue[i]];
    let j = i + 1;
    while (
      j < queue.length &&
      worstRatio(row, side) >= worstRatio([...row, queue[j]], side)
    ) {
      row.push(queue[j]);
      j++;
    }
    const rowArea = row.reduce((s, r) => s + r.area, 0);
    if (w >= h) {
      const rw = rowArea / h;
      let yy = y;
      for (const it of row) {
        const ih = it.area / rw;
        out.push({ x, y: yy, w: rw, h: ih, data: it.data });
        yy += ih;
      }
      x += rw;
      w -= rw;
    } else {
      const rh = rowArea / w;
      let xx = x;
      for (const it of row) {
        const iw = it.area / rh;
        out.push({ x: xx, y, w: iw, h: rh, data: it.data });
        xx += iw;
      }
      y += rh;
      h -= rh;
    }
    i = j;
  }
  return out;
}

function scaleToArea<T>(items: { value: number; data: T }[], rect: Rect): AreaItem<T>[] {
  const total = items.reduce((s, it) => s + it.value, 0);
  if (total <= 0) return [];
  const scale = (rect.w * rect.h) / total;
  return items.map((it) => ({ area: it.value * scale, data: it.data }));
}

// ── Layout assembly ───────────────────────────────────────────────────────────

interface SectorGroup {
  sector: string;
  total: number;
  holdings: HeatmapHolding[];
}

const SGAP = 6; // gap between sector blocks
const PAD = 6; // inner padding within a sector block
const HEADER = 24; // sector header strip
const TGAP = 4; // gap between tiles

interface LayoutResult {
  sectors: (Rect & { group: SectorGroup })[];
  tiles: Placed<HeatmapHolding>[];
}

function buildLayout(groups: SectorGroup[], width: number, height: number): LayoutResult {
  const sectorItems = scaleToArea(
    groups.map((g) => ({ value: g.total, data: g })),
    { x: 0, y: 0, w: width, h: height }
  );
  const sectorRects = squarify(sectorItems, { x: 0, y: 0, w: width, h: height });

  const sectors: (Rect & { group: SectorGroup })[] = [];
  const tiles: Placed<HeatmapHolding>[] = [];

  for (const sr of sectorRects) {
    const box: Rect = {
      x: sr.x + SGAP / 2,
      y: sr.y + SGAP / 2,
      w: Math.max(0, sr.w - SGAP),
      h: Math.max(0, sr.h - SGAP),
    };
    sectors.push({ ...box, group: sr.data });

    const inner: Rect = {
      x: box.x + PAD,
      y: box.y + HEADER,
      w: Math.max(0, box.w - PAD * 2),
      h: Math.max(0, box.h - HEADER - PAD),
    };
    if (inner.w <= 0 || inner.h <= 0) continue;

    const items = scaleToArea(
      sr.data.holdings.map((h) => ({ value: h.weightPct, data: h })),
      inner
    );
    tiles.push(...squarify(items, inner));
  }
  return { sectors, tiles };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PortfolioHeatmap({
  holdings,
  sectorOrder,
  defaultPeriod = "return12M",
  caption = "Size represents portfolio weight. Color represents selected-period return.",
}: {
  holdings: HeatmapHolding[];
  /** Optional sector ordering used to break ties / label groups consistently. */
  sectorOrder?: string[];
  defaultPeriod?: HeatmapPeriod;
  caption?: string;
}) {
  const [period, setPeriod] = useState<HeatmapPeriod>(defaultPeriod);
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(w);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const totalWeight = useMemo(
    () => holdings.reduce((s, h) => s + h.weightPct, 0),
    [holdings]
  );

  const groups = useMemo<SectorGroup[]>(() => {
    const map = new Map<string, SectorGroup>();
    for (const h of holdings) {
      let g = map.get(h.sector);
      if (!g) {
        g = { sector: h.sector, total: 0, holdings: [] };
        map.set(h.sector, g);
      }
      g.total += h.weightPct;
      g.holdings.push(h);
    }
    const order = sectorOrder ?? [];
    return [...map.values()].sort((a, b) => {
      const ai = order.indexOf(a.sector);
      const bi = order.indexOf(b.sector);
      if (ai !== -1 && bi !== -1) return ai - bi;
      return b.total - a.total;
    });
  }, [holdings, sectorOrder]);

  // Treemap height tuned per breakpoint so tiles stay legible on phones.
  const height = useMemo(() => {
    if (width <= 0) return 560;
    if (width < 560) return Math.round(width * 1.6);
    if (width < 900) return Math.round(width * 0.78);
    return Math.min(660, Math.round(width * 0.56));
  }, [width]);

  const layout = useMemo(
    () => (width > 0 ? buildLayout(groups, width, height) : null),
    [groups, width, height]
  );

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background:
          "radial-gradient(120% 120% at 50% 0%, #131a26 0%, #0c111a 55%, #0a0e15 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.30)",
      }}
    >
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 lg:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
          Portfolio Heatmap
        </p>
        <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/10">
          {PERIODS.map((p) => {
            const active = p.key === period;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 font-mono text-[10.5px] tracking-[0.06em] transition-colors ${
                  active
                    ? "bg-white/90 text-[#0c111a]"
                    : "text-white/55 hover:text-white/90"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Treemap canvas */}
      <div className="px-3 py-3 lg:px-4 lg:py-4">
        <div ref={ref} className="relative w-full" style={{ height }}>
          {layout?.sectors.map((s) => (
            <div
              key={s.group.sector}
              className="absolute rounded-xl"
              style={{
                left: s.x,
                top: s.y,
                width: s.w,
                height: s.h,
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-baseline justify-between gap-2 px-2.5 pt-1.5">
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                  {s.group.sector}
                </span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/35">
                  {((s.group.total / totalWeight) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}

          {layout?.tiles.map((t) => {
            const h = t.data;
            const ret = h.returns[period];
            const w = t.w - TGAP;
            const ht = t.h - TGAP;
            if (w <= 1 || ht <= 1) return null;
            const color = tileColor(ret, period);
            const logo = TICKER_LOGO_ASSETS[h.ticker.toUpperCase()];
            const showName = ht >= 76 && w >= 96;
            const showStats = ht >= 52 && w >= 60;
            const showLogo = !!logo && ht >= 92 && w >= 104;
            const tickerSize = w >= 140 && ht >= 96 ? 17 : w >= 80 ? 14 : 11.5;

            const inner = (
              <div
                className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg"
                style={{
                  background: `linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 42%), ${color}`,
                  border: "1px solid rgba(255,255,255,0.10)",
                  padding: showStats ? "7px 8px" : "4px 5px",
                }}
              >
                {showLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute bottom-1.5 right-1.5 h-7 w-7 object-contain opacity-[0.16] grayscale"
                  />
                )}
                <div className="relative flex items-baseline justify-between gap-1">
                  <span
                    className="font-mono font-semibold leading-none tracking-[0.04em] text-white"
                    style={{ fontSize: tickerSize }}
                  >
                    {h.ticker}
                  </span>
                  {showStats && (
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-white/70">
                      {h.weightPct.toFixed(2)}%
                    </span>
                  )}
                </div>

                {showName && (
                  <p className="relative mt-1 line-clamp-2 text-[11px] leading-tight text-white/75">
                    {h.name}
                  </p>
                )}

                {showStats && (
                  <div className="relative flex items-baseline gap-1.5">
                    <span
                      className="font-mono font-semibold tabular-nums text-white"
                      style={{ fontSize: tickerSize >= 17 ? 15 : 12 }}
                    >
                      {fmtPct(ret)}
                    </span>
                    {showName && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/45">
                        {PERIODS.find((p) => p.key === period)?.tag}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );

            const style: React.CSSProperties = {
              left: t.x + TGAP / 2,
              top: t.y + TGAP / 2,
              width: w,
              height: ht,
            };

            return h.href ? (
              <Link
                key={h.ticker}
                href={h.href}
                className="absolute transition-transform duration-150 hover:z-10 hover:scale-[1.015]"
                style={style}
                aria-label={`${h.name} (${h.ticker}) — ${h.weightPct.toFixed(2)}% weight, ${fmtPct(ret)} ${PERIODS.find((p) => p.key === period)?.label}`}
              >
                {inner}
              </Link>
            ) : (
              <div key={h.ticker} className="absolute" style={style}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legends */}
      <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p className="font-mono text-[10px] leading-relaxed text-white/40">{caption}</p>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/45">
            Losers
          </span>
          <span
            className="h-2.5 w-28 rounded-full"
            style={{
              background: `linear-gradient(90deg, rgb(${NEG.join(",")}), rgb(${NEUTRAL.join(",")}), rgb(${POS.join(",")}))`,
            }}
          />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/45">
            Gainers
          </span>
        </div>
      </div>
    </div>
  );
}
