"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { rothIraHoldings, type SleeveHolding } from "@/data/sleeveHoldings";
import { useQuotes } from "./QuotesProvider";
import { deriveSleeveHoldings } from "@/lib/portfolioCalculations";
import { getAvgCost } from "@/lib/costBasis";
import TickerLogo from "./TickerLogo";

// ── constants ─────────────────────────────────────────────────────────────────

const NAVY = "#1a3a5c";
const ROSE = "#8b2530";
const GREEN = "#1a4a2e";
const MUTED = "#7a8799";
const DIM = "#5a6e82";
const TEXT = "#0f1e35";
const BODY = "#2d3d52";
const BORDER = "rgba(15,30,53,0.08)";
const MONO = "var(--font-geist-mono)";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt1(n: number): string { return n.toFixed(1); }
function fmt2(n: number): string { return n.toFixed(2); }
function sign(n: number): string { return n >= 0 ? "+" : ""; }
function pp(n: number): string { return sign(n) + fmt2(n) + " pp"; }
function pct(n: number): string { return fmt1(n) + "%"; }

function computeAttribution(sleeve: SleeveHolding[]) {
  return sleeve
    .filter((h) => h.returnPct !== undefined)
    .map((h) => ({
      ticker: h.ticker,
      company: h.company,
      weight: h.portfolioWeightPct,
      returnPct: h.returnPct!,
      contribution: (h.portfolioWeightPct / 100) * h.returnPct!,
    }))
    .sort((a, b) => b.contribution - a.contribution);
}

function computeConcentration(weights: number[]) {
  const sorted = [...weights].sort((a, b) => b - a);
  const total = sorted.reduce((s, w) => s + w, 0);
  const normalized = sorted.map((w) => w / total);
  const hhi = normalized.reduce((s, w) => s + w * w, 0);
  const top1 = sorted[0] / total;
  const top3 = (sorted[0] + (sorted[1] ?? 0) + (sorted[2] ?? 0)) / total;
  return {
    hhi,
    effectiveN: 1 / hhi,
    top1Pct: top1 * 100,
    top3Pct: top3 * 100,
    n: weights.length,
  };
}

function groupWeights(
  items: { value: string | undefined; weight: number }[],
  fallback = "Other"
): { label: string; weight: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.value ?? fallback;
    map.set(key, (map.get(key) ?? 0) + item.weight);
  }
  return [...map.entries()]
    .map(([label, weight]) => ({ label, weight }))
    .sort((a, b) => b.weight - a.weight);
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em]"
      style={{ color: MUTED }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t" style={{ borderColor: BORDER }} />;
}

// Horizontal bar for exposure breakdowns
function ExposureBar({
  label,
  weight,
  maxWeight,
  color,
}: {
  label: string;
  weight: number;
  maxWeight: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-36 shrink-0 truncate font-mono text-[10px]"
        style={{ color: BODY }}
      >
        {label}
      </div>
      <div
        className="h-1.5 flex-1 rounded-full"
        style={{ background: "rgba(15,30,53,0.06)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${(weight / maxWeight) * 100}%`, background: color }}
        />
      </div>
      <div
        className="w-10 shrink-0 text-right font-mono text-[10px]"
        style={{ color: MUTED }}
      >
        {pct(weight)}
      </div>
    </div>
  );
}

function ExposureGroup({
  title,
  items,
  color,
}: {
  title: string;
  items: { label: string; weight: number }[];
  color: string;
}) {
  const max = items[0]?.weight ?? 1;
  return (
    <div>
      <p
        className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em]"
        style={{ color: DIM }}
      >
        {title}
      </p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <ExposureBar
            key={item.label}
            label={item.label}
            weight={item.weight}
            maxWeight={max}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}

// Concentration metrics card per sleeve
function ConcentrationCard({
  label,
  metrics,
  color,
}: {
  label: string;
  metrics: ReturnType<typeof computeConcentration>;
  color: string;
}) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: BORDER, background: "rgba(15,30,53,0.01)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ background: color }} />
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: MUTED }}>
          {label}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {[
          { label: "Positions", value: metrics.n.toString() },
          { label: "Effective N", value: fmt1(metrics.effectiveN) },
          { label: "HHI", value: fmt2(metrics.hhi) },
          { label: "Top-1 Weight", value: pct(metrics.top1Pct) },
          { label: "Top-3 Weight", value: pct(metrics.top3Pct) },
        ].map(({ label: l, value }) => (
          <div key={l}>
            <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: DIM }}>
              {l}
            </p>
            <p className="font-mono text-[13px] font-medium" style={{ color: TEXT }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Attribution chart (horizontal bars, one per sleeve)
function AttributionChart({
  title,
  data,
  color,
  returnLabel = "Est. contribution",
}: {
  title: string;
  data: ReturnType<typeof computeAttribution>;
  color: string;
  returnLabel?: string;
}) {
  const totalReturn = data.reduce((s, d) => s + d.contribution, 0);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p
          className="font-mono text-[9px] uppercase tracking-[0.22em]"
          style={{ color: DIM }}
        >
          {title}
        </p>
        <p className="font-mono text-[11px]" style={{ color: TEXT }}>
          {returnLabel}:{" "}
          <span style={{ color: totalReturn >= 0 ? color : ROSE }}>
            {pp(totalReturn)}
          </span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={data.length * 28 + 32}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 4, right: 56, top: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => fmt1(v) + " pp"}
            tick={{ fontFamily: MONO, fontSize: 9, fill: DIM }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="ticker"
            width={44}
            tick={{ fontFamily: MONO, fontSize: 10, fill: BODY }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: unknown) => {
              const n = typeof value === "number" ? value : 0;
              return [pp(n), "Contribution"] as [string, string];
            }}
            labelFormatter={(label: unknown) => {
              const ticker = String(label ?? "");
              const d = data.find((x) => x.ticker === ticker);
              return d
                ? `${d.company} · ${pct(d.weight)} @ ${sign(d.returnPct)}${pct(d.returnPct)}`
                : ticker;
            }}
            contentStyle={{
              background: "#faf7f2",
              border: "1px solid rgba(15,30,53,0.10)",
              borderRadius: 4,
              fontFamily: MONO,
              fontSize: 11,
            }}
            cursor={{ fill: "rgba(15,30,53,0.03)" }}
          />
          <ReferenceLine x={0} stroke="rgba(15,30,53,0.15)" strokeWidth={1} />
          <Bar dataKey="contribution" radius={[0, 2, 2, 0]} maxBarSize={16}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.contribution >= 0 ? color : ROSE}
                fillOpacity={0.82}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Compact return table below chart */}
      <div
        className="mt-3 overflow-x-auto rounded border"
        style={{ borderColor: BORDER }}
      >
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: "rgba(15,30,53,0.03)", borderBottom: `1px solid ${BORDER}` }}>
              {["Ticker", "Weight", "Return", "Contribution"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 font-mono text-[8px] uppercase tracking-[0.18em]"
                  style={{ color: DIM }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.ticker}
                style={{
                  borderBottom: idx < data.length - 1 ? `1px solid ${BORDER}` : undefined,
                }}
              >
                <td className="px-3 py-1.5 font-mono text-[10px] font-medium" style={{ color: TEXT }}>
                  <div className="flex items-center gap-2">
                    <TickerLogo ticker={row.ticker} size="sm" />
                    <span>{row.ticker}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 font-mono text-[10px]" style={{ color: MUTED }}>
                  {pct(row.weight)}
                </td>
                <td
                  className="px-3 py-1.5 font-mono text-[10px]"
                  style={{ color: row.returnPct >= 0 ? GREEN : ROSE }}
                >
                  {sign(row.returnPct)}{pct(row.returnPct)}
                </td>
                <td
                  className="px-3 py-1.5 font-mono text-[10px] font-medium"
                  style={{ color: row.contribution >= 0 ? color : ROSE }}
                >
                  {pp(row.contribution)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── main dashboard ─────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  // ── Weights: derived from live shares × price where available, else
  //    static fallback. Result is normalized to sum to 100% so downstream
  //    attribution / concentration / exposure math is well-conditioned.
  const { quotes } = useQuotes();
  const derivedHoldings = useMemo(
    () => deriveSleeveHoldings(rothIraHoldings, quotes ?? null, (t) => getAvgCost(t, "roth-ira")),
    [quotes]
  );
  const normalizedHoldings = useMemo(() => {
    const total = derivedHoldings.reduce((s, d) => s + d.portfolioPct, 0) || 1;
    return rothIraHoldings.map((h, i) => {
      const d = derivedHoldings[i];
      return {
        ...h,
        portfolioWeightPct: (d.portfolioPct / total) * 100,
        returnPct: d.returnPct ?? h.returnPct,
      };
    });
  }, [derivedHoldings]);

  // ── attribution ────────────────────────────────────────────────────────────
  const attribution = useMemo(() => computeAttribution(normalizedHoldings), [normalizedHoldings]);

  const estimatedReturn = attribution.reduce((s, d) => s + d.contribution, 0);

  // ── concentration ──────────────────────────────────────────────────────────
  const concentration = useMemo(
    () => computeConcentration(normalizedHoldings.map((h) => h.portfolioWeightPct)),
    [normalizedHoldings]
  );

  // ── exposure ───────────────────────────────────────────────────────────────
  const byGeo = useMemo(
    () => groupWeights(normalizedHoldings.map((h) => ({ value: h.country, weight: h.portfolioWeightPct }))),
    [normalizedHoldings]
  );
  const byMarketCap = useMemo(
    () =>
      groupWeights(
        normalizedHoldings.map((h) => ({
          value: h.marketCap ?? (h.assetType === "Crypto-linked ETF" ? "Crypto-linked" : undefined),
          weight: h.portfolioWeightPct,
        }))
      ),
    [normalizedHoldings]
  );
  const byAssetType = useMemo(
    () => groupWeights(normalizedHoldings.map((h) => ({ value: h.assetType, weight: h.portfolioWeightPct }))),
    [normalizedHoldings]
  );

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
          <SectionLabel>Overview</SectionLabel>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Estimated Contribution Since Entry",
                value: `${sign(estimatedReturn)}${fmt1(estimatedReturn)} pp`,
                positive: estimatedReturn >= 0,
                sub: "derived",
              },
              {
                label: "Positions",
                value: rothIraHoldings.length.toString(),
                sub: "holdings",
              },
              {
                label: "Effective N",
                value: fmt1(concentration.effectiveN),
                sub: `HHI ${fmt2(concentration.hhi)}`,
              },
            ].map(({ label, value, positive, sub }) => (
              <div
                key={label}
                className="rounded-lg border p-4"
                style={{ borderColor: BORDER }}
              >
                <p
                  className="mb-1 font-mono text-[8px] uppercase tracking-[0.18em]"
                  style={{ color: DIM }}
                >
                  {label}
                </p>
                <p
                  className="font-mono text-[15px] font-semibold"
                  style={{
                    color:
                      positive === true
                        ? NAVY
                        : positive === false
                        ? ROSE
                        : TEXT,
                  }}
                >
                  {value}
                </p>
                <p className="mt-0.5 font-mono text-[8px]" style={{ color: DIM }}>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Return attribution ─────────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
          <SectionLabel>Return Attribution</SectionLabel>
          <h2 className="mb-2 text-2xl font-bold tracking-tight" style={{ color: TEXT }}>
            Estimated Contribution Since Entry
          </h2>
          <p className="mb-3 max-w-2xl text-[13px] leading-[1.8]" style={{ color: MUTED }}>
            Each bar shows a holding&apos;s percentage-point contribution, calculated as
            current portfolio weight times return since entry.
          </p>
          <p className="mb-10 max-w-2xl text-[12px] italic leading-[1.7]" style={{ color: MUTED }}>
            Not a portfolio return. This estimate uses current weight and position-level
            return, not full time-weighted or money-weighted account history.
          </p>

          <div className="grid gap-14">
            <AttributionChart title="Investments" data={attribution} color={GREEN} />
          </div>
        </div>
      </section>

      {/* ── Exposure ───────────────────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ borderColor: BORDER, background: "#f3ede1" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
          <SectionLabel>Investments Exposure</SectionLabel>
          <h2 className="mb-10 text-2xl font-bold tracking-tight" style={{ color: TEXT }}>
            Geography · Market Cap · Asset Type
          </h2>

          <div className="grid gap-10 sm:grid-cols-3">
            <ExposureGroup
              title="By Geography"
              items={byGeo}
              color={GREEN}
            />
            <ExposureGroup
              title="By Market Cap"
              items={byMarketCap}
              color={NAVY}
            />
            <ExposureGroup
              title="By Asset Type"
              items={byAssetType}
              color="#5c3a1a"
            />
          </div>
        </div>
      </section>

      {/* ── Concentration metrics ───────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ borderColor: BORDER, background: "#f3ede1" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
          <SectionLabel>Concentration</SectionLabel>
          <h2 className="mb-2 text-2xl font-bold tracking-tight" style={{ color: TEXT }}>
            Diversification Metrics
          </h2>
          <p className="mb-10 max-w-2xl text-[13px] leading-[1.8]" style={{ color: MUTED }}>
            The Herfindahl-Hirschman Index (HHI) measures concentration: 1/N for equal weights,
            1.0 for a single holding. Effective N is 1/HHI — the equivalent number of equal-weight
            positions that would produce the same concentration level.
          </p>

          <div className="max-w-sm">
            <ConcentrationCard label="Investments" metrics={concentration} color={GREEN} />
          </div>
        </div>
      </section>

      {/* ── Methodology note ───────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
          <p className="font-mono text-[9px] leading-[1.8]" style={{ color: DIM }}>
            <span className="uppercase tracking-[0.18em]">Methodology</span> · Weights use
            manually recorded share counts and delayed market prices when available, with
            fallback weights when pricing is unavailable. Return figures are total return
            since entry as manually recorded. Weights reflect approximate intra-account
            allocation, not absolute dollar amounts.
          </p>
        </div>
      </section>
    </div>
  );
}
