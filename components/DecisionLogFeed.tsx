"use client";

import { useState } from "react";
import Link from "next/link";
import type { DecisionEntry } from "@/data/decisionLog";

type Filter = "all" | "buy" | "risk" | "exit";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",  label: "All" },
  { key: "buy",  label: "Buys / Adds" },
  { key: "risk", label: "Risk Management" },
  { key: "exit", label: "Exits" },
];

function matchesFilter(entry: DecisionEntry, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "buy")  return entry.action === "Buy" || entry.action === "Market buy";
  if (filter === "risk") return entry.action === "Trim";
  if (filter === "exit") return entry.action === "Full exit";
  return true;
}

const ACCENT: Record<string, string> = {
  "Buy":        "#1a4a2e",
  "Market buy": "#1a4a2e",
  "Trim":       "#7a4520",
  "Full exit":  "#8b2530",
};

function formatDate(date: string): string {
  if (date.length === 7) {
    const [y, m] = date.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function DecisionLogFeed({ entries }: { entries: DecisionEntry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = entries.filter((e) => matchesFilter(e, filter));

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="rounded-full font-mono text-[11px] transition-colors"
              style={{
                padding: "5px 14px",
                background: active ? "#0f1e35" : "transparent",
                color: active ? "#ffffff" : "#7a8799",
                border: `1px solid ${active ? "#0f1e35" : "rgba(15,30,53,0.15)"}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Entry cards */}
      <div className="space-y-4">
        {visible.map((entry, i) => {
          const accent = ACCENT[entry.action] ?? "#1a3a5c";
          const pos = entry.returnPct !== undefined && entry.returnPct >= 0;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,30,53,0.09)",
                boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
                borderLeft: `4px solid ${accent}`,
              }}
            >
              <div className="px-7 py-6">
                {/* Top row: ticker + company + action badge + return */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={entry.href}
                      className="font-mono text-[15px] font-bold transition-opacity hover:opacity-70"
                      style={{ color: accent }}
                    >
                      {entry.ticker}
                    </Link>
                    <span className="text-[14px] font-medium text-[#0f1e35]">
                      {entry.company}
                    </span>
                    <span
                      className="rounded font-mono text-[9px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        color: accent,
                        background: `${accent}14`,
                        padding: "3px 9px",
                      }}
                    >
                      {entry.action}
                    </span>
                  </div>
                  {/* Return pill */}
                  {entry.returnPct !== undefined && (
                    <span
                      className="rounded font-mono text-[11px] font-semibold tabular-nums"
                      style={{
                        padding: "3px 10px",
                        color: pos ? "#1a4a2e" : "#8b2530",
                        background: pos ? "rgba(26,74,46,0.08)" : "rgba(139,37,48,0.08)",
                      }}
                    >
                      {pos ? "+" : ""}{entry.returnPct.toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* Meta row: type + date + account */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span
                    className="rounded font-mono text-[9px] uppercase tracking-[0.16em] text-[#7a8799]"
                    style={{
                      background: "rgba(15,30,53,0.05)",
                      padding: "2px 8px",
                    }}
                  >
                    {entry.type}
                  </span>
                  <span className="font-mono text-[11px] text-[#a8b2bd]">
                    {formatDate(entry.date)}
                  </span>
                  <span className="font-mono text-[11px] text-[#a8b2bd]">·</span>
                  <span className="font-mono text-[11px] text-[#a8b2bd]">
                    {entry.account}
                  </span>
                </div>

                {/* Note */}
                <p className="text-[14px] leading-[1.85] text-[#3d4f66]">{entry.note}</p>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <p className="font-mono text-[12px] text-[#a8b2bd]">No entries for this filter.</p>
        )}
      </div>
    </div>
  );
}
