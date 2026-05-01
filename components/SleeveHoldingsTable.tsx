"use client";

import Link from "next/link";
import type { SleeveHolding } from "@/data/sleeveHoldings";
import { etfProfiles } from "@/data/etfConstituents";
import { ClickableRow } from "./ClickableRow";
import { useQuotes } from "./QuotesProvider";
import { getAvgCost, computeReturnPct } from "@/lib/costBasis";

// ── type styles ───────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  Equity: "#1a3a5c",
  ETF: "#1a4a2e",
  "Crypto-linked ETF": "#8b2530",
};

const TYPE_BG: Record<string, string> = {
  Equity: "rgba(26,58,92,0.08)",
  ETF: "rgba(26,74,46,0.08)",
  "Crypto-linked ETF": "rgba(139,37,48,0.08)",
};

// ── sub-components ────────────────────────────────────────────────────────────

function ReturnCell({ ticker, sleeve }: { ticker: string; sleeve: string }) {
  const { quotes, loading } = useQuotes();
  const q = quotes[ticker];
  const avgCost = getAvgCost(ticker, sleeve);

  const currentPrice = q?.price ?? null;
  const liveReturn =
    avgCost !== null && currentPrice !== null
      ? computeReturnPct(avgCost, currentPrice)
      : null;

  return (
    <div className="flex flex-col gap-0.5">
      {loading && q === undefined ? (
        <span className="font-mono text-[12px] animate-pulse" style={{ color: "#a8b2bd" }}>···</span>
      ) : avgCost === null ? (
        <span className="font-mono text-[11px]" style={{ color: "#a8b2bd" }}>No cost basis</span>
      ) : liveReturn !== null ? (
        <span
          className="font-mono text-[12px] font-semibold tabular-nums"
          style={{ color: liveReturn >= 0 ? "#15542e" : "#8b1a1a" }}
        >
          {liveReturn >= 0 ? "+" : ""}{liveReturn.toFixed(2)}%
        </span>
      ) : (
        <span className="font-mono text-[12px]" style={{ color: "#a8b2bd" }}>—</span>
      )}
      {!loading && q?.changePercent != null && (
        <span className="font-mono text-[9px] tabular-nums" style={{ color: "#a8b2bd" }}>
          {q.changePercent >= 0 ? "+" : ""}{q.changePercent.toFixed(2)}% today
        </span>
      )}
    </div>
  );
}

function Tag({
  label,
  color,
  bg,
}: {
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="inline-block whitespace-nowrap rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
      style={{
        color: color ?? "#7a8799",
        background: bg ?? "transparent",
        border: bg ? "none" : "1px solid rgba(15,30,53,0.1)",
      }}
    >
      {label}
    </span>
  );
}

// ── WeightBar ─────────────────────────────────────────────────────────────────

function WeightBar({
  pct,
  max,
  color,
}: {
  pct: number;
  max: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-16 overflow-hidden rounded-full"
        style={{ background: "rgba(15,30,53,0.07)", height: 3 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${(pct / max) * 100}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-[#7a8799]">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ── SleeveHoldingsTable ───────────────────────────────────────────────────────

export default function SleeveHoldingsTable({
  holdings,
  sleeve,
}: {
  holdings: SleeveHolding[];
  sleeve: string;
}) {
  const totalWeight = holdings.reduce((s, h) => s + h.portfolioWeightPct, 0) || 1;
  const maxWeight = Math.max(...holdings.map((h) => h.portfolioWeightPct / totalWeight * 100), 1);

  return (
    <div
      className="overflow-x-auto rounded-2xl"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              background: "#f8f4ee",
              borderBottom: "1px solid rgba(15,30,53,0.07)",
            }}
          >
            {[
              "Ticker",
              "Company",
              "Weight",
              "Return",
              "Subcategory",
              "Country",
              "Mkt Cap",
              "Type",
            ].map((h) => (
              <th
                key={h}
                className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, i) => {
            const hasEtfDetail = h.ticker in etfProfiles;
            const typeColor = TYPE_COLOR[h.assetType];
            const typeBg = TYPE_BG[h.assetType];
            const isLast = i === holdings.length - 1;
            const href = hasEtfDetail
              ? `/etfs/${h.ticker}`
              : `/positions/${h.ticker}`;

            return (
              <ClickableRow
                key={h.ticker}
                href={href}
                style={
                  isLast
                    ? undefined
                    : { borderBottom: "1px solid rgba(15,30,53,0.05)" }
                }
                hoverStyle={{ background: "rgba(15,30,53,0.025)" }}
              >
                {/* Ticker */}
                <td className="px-5 py-4">
                  {hasEtfDetail ? (
                    <Link
                      href={`/etfs/${h.ticker}`}
                      className="font-mono text-[12px] font-bold hover:underline"
                      style={{ color: typeColor }}
                    >
                      {h.ticker}
                    </Link>
                  ) : (
                    <span
                      className="font-mono text-[12px] font-bold"
                      style={{ color: typeColor }}
                    >
                      {h.ticker}
                    </span>
                  )}
                </td>

                {/* Company + optional thesis tooltip */}
                <td className="px-5 py-4">
                  <p className="text-[13px] text-[#2d3d52]">{h.company}</p>
                  {h.thesis && (
                    <p className="mt-0.5 max-w-[220px] text-[10px] leading-[1.5] text-[#a8b2bd]">
                      {h.thesis}
                    </p>
                  )}
                </td>

                {/* Weight */}
                <td className="px-5 py-4">
                  <WeightBar
                    pct={h.portfolioWeightPct / totalWeight * 100}
                    max={maxWeight}
                    color={typeColor}
                  />
                  {h.notes && (
                    <p className="mt-0.5 font-mono text-[9px] text-[#a8b2bd]">
                      {h.notes}
                    </p>
                  )}
                </td>

                {/* Return % */}
                <td className="px-5 py-4">
                  <ReturnCell ticker={h.ticker} sleeve={sleeve} />
                </td>

                {/* Subcategory */}
                <td className="px-5 py-4">
                  {h.subcategory && (
                    <span className="font-mono text-[11px] text-[#5a6e82]">
                      {h.subcategory}
                    </span>
                  )}
                </td>

                {/* Country */}
                <td className="px-5 py-4">
                  {h.country && <Tag label={h.country} />}
                </td>

                {/* Market Cap */}
                <td className="px-5 py-4">
                  {h.marketCap && <Tag label={h.marketCap} />}
                </td>

                {/* Type */}
                <td className="px-5 py-4">
                  <Tag label={h.assetType} color={typeColor} bg={typeBg} />
                </td>
              </ClickableRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
