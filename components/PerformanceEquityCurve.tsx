"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

const GREEN = "#1a4a2e";
const NAVY = "#1a3a5c";
const MUTED = "#5a6e82";
const MONO = "var(--font-geist-mono)";

interface Point {
  date: string;
  portfolioIndex: number;
  benchmarkIndex: number;
}

function fmtDate(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export default function PerformanceEquityCurve({
  series,
  drawdownPeakDate,
  drawdownTroughDate,
}: {
  series: Point[];
  drawdownPeakDate: string;
  drawdownTroughDate: string;
}) {
  const data = series.map((p) => ({ ...p, label: fmtDate(p.date) }));

  return (
    <div>
      <div style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: MUTED, fontSize: 9, fontFamily: MONO }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => v.toFixed(0)}
            />
            <ReferenceArea
              x1={fmtDate(drawdownPeakDate)}
              x2={fmtDate(drawdownTroughDate)}
              fill="#8b1a1a"
              fillOpacity={0.06}
              stroke="#8b1a1a"
              strokeOpacity={0.15}
              strokeDasharray="3 3"
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid rgba(15,30,53,0.12)",
                borderRadius: 8,
                fontFamily: MONO,
                fontSize: 11,
              }}
              formatter={(value: unknown, name: unknown) => [
                `${(value as number).toFixed(1)}`,
                name === "portfolioIndex" ? "Portfolio" : "VOO (total return)",
              ]}
              labelFormatter={(label: unknown) => String(label)}
            />
            <Line
              type="monotone"
              dataKey="benchmarkIndex"
              name="benchmarkIndex"
              stroke={NAVY}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="portfolioIndex"
              name="portfolioIndex"
              stroke={GREEN}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-[2.5px] w-4 rounded" style={{ background: GREEN }} />
          <span className="font-mono text-[10px]" style={{ color: GREEN }}>Portfolio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-[2.5px] w-4 rounded" style={{ background: NAVY }} />
          <span className="font-mono text-[10px]" style={{ color: NAVY }}>VOO (total return)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: "#8b1a1a", opacity: 0.15, border: "1px dashed rgba(139,26,26,0.4)" }}
          />
          <span className="font-mono text-[10px] text-[#5a6e82]">Drawdown window</span>
        </div>
      </div>

      {/* Accessible table fallback for the chart above */}
      <div className="mt-6 overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
        <table className="w-full text-left" aria-label="Cumulative portfolio and benchmark index by month">
          <caption className="sr-only">
            Portfolio and VOO total-return cumulative index, both indexed to 100 at inception, by month.
          </caption>
          <thead>
            <tr style={{ background: "rgba(15,30,53,0.03)", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
              {["Month", "Portfolio Index", "VOO Index"].map((h) => (
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
                <td className="px-3 py-1.5 font-mono text-[10px] text-[#0f1e35]">{row.portfolioIndex.toFixed(1)}</td>
                <td className="px-3 py-1.5 font-mono text-[10px] text-[#5a6e82]">{row.benchmarkIndex.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
