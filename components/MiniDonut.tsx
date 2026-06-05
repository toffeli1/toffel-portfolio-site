"use client";

// Compact donut card. Title, small donut, and a vertical legend with %.
// Used for category breakdowns (Theme / Market Cap / Asset Type) under the
// main portfolio weighting donut on the Roth IRA page.

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface DonutSlice {
  name: string;
  value: number;
}

const COLORS = ["#1a2845", "#7a8da3", "#a5b7c9", "#abc1b1", "#cdd182", "#c5a572"];

export default function MiniDonut({
  title,
  data,
}: {
  title: string;
  data: DonutSlice[];
}) {
  const slices = data.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));

  return (
    <div
      className="flex flex-col rounded-2xl p-6"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
        {title}
      </p>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={1.5}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
              labelLine={false}
            >
              {slices.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-1.5">
        {slices.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.color }}
                aria-hidden
              />
              <span className="truncate text-[11.5px] text-[#3d4f66]">{s.name}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#7a8799]">
              {s.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
