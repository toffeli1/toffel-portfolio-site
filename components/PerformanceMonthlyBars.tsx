"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const GREEN = "#1a4a2e";
const NAVY = "#1a3a5c";
const MUTED = "#5a6e82";
const MONO = "var(--font-geist-mono)";

interface Row {
  date: string;
  portfolioReturnPct: number;
  benchmarkReturnPct: number;
}

function fmtDate(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function fmtSigned(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export default function PerformanceMonthlyBars({ rows }: { rows: Row[] }) {
  const data = rows.map((r) => ({ ...r, label: fmtDate(r.date) }));

  return (
    <div>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine y={0} stroke="rgba(15,30,53,0.2)" />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(15,30,53,0.12)",
                borderRadius: 8,
                fontFamily: MONO,
                fontSize: 11,
              }}
              formatter={(value: unknown, name: unknown) => [
                fmtSigned(value as number),
                name === "portfolioReturnPct" ? "Portfolio" : "VOO (price)",
              ]}
            />
            <Bar dataKey="portfolioReturnPct" name="portfolioReturnPct" fill={GREEN} radius={[2, 2, 0, 0]} maxBarSize={18} />
            <Bar dataKey="benchmarkReturnPct" name="benchmarkReturnPct" fill={NAVY} radius={[2, 2, 0, 0]} maxBarSize={18} fillOpacity={0.55} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: GREEN }} />
          <span className="font-mono text-[10px]" style={{ color: GREEN }}>Portfolio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: NAVY, opacity: 0.55 }} />
          <span className="font-mono text-[10px]" style={{ color: NAVY }}>VOO (price return)</span>
        </div>
      </div>

      {/* Accessible table fallback for the chart above */}
      <div className="mt-6 overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
        <table className="w-full text-left" aria-label="Monthly portfolio and benchmark returns">
          <caption className="sr-only">Monthly portfolio return (Modified Dietz) vs. VOO monthly price return.</caption>
          <thead>
            <tr style={{ background: "rgba(15,30,53,0.03)", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
              {["Month", "Portfolio", "VOO (price)"].map((h) => (
                <th key={h} className="px-3 py-2 font-mono text-[8px] uppercase tracking-[0.18em] text-[#5a6e82]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.date} style={{ borderBottom: i < data.length - 1 ? "1px solid rgba(15,30,53,0.05)" : undefined }}>
                <td className="px-3 py-1.5 font-mono text-[10px] text-[#0f1e35]">{row.label}</td>
                <td
                  className="px-3 py-1.5 font-mono text-[10px] font-semibold"
                  style={{ color: row.portfolioReturnPct >= 0 ? "#15542e" : "#8b1a1a" }}
                >
                  {fmtSigned(row.portfolioReturnPct)}
                </td>
                <td
                  className="px-3 py-1.5 font-mono text-[10px]"
                  style={{ color: row.benchmarkReturnPct >= 0 ? "#15542e" : "#8b1a1a" }}
                >
                  {fmtSigned(row.benchmarkReturnPct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
