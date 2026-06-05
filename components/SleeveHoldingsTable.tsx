"use client";

import Link from "next/link";
import type { SleeveHolding } from "@/data/sleeveHoldings";
import { etfProfiles } from "@/data/etfConstituents";
import { ClickableRow } from "./ClickableRow";
import { useQuotes } from "./QuotesProvider";
import { getAvgCost, computeReturnPct } from "@/lib/costBasis";
import { deriveSleeveHoldings } from "@/lib/portfolioCalculations";
import WeightStatusBadge from "./WeightStatusBadge";
import TickerLogo from "./TickerLogo";

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
        <span className="font-mono text-[12px] animate-pulse" style={{ color: "#5a6e82" }}>···</span>
      ) : avgCost === null ? (
        <span className="font-mono text-[11px]" style={{ color: "#5a6e82" }}>No cost basis</span>
      ) : liveReturn !== null ? (
        <span
          className="font-mono text-[12px] font-semibold tabular-nums"
          style={{ color: liveReturn >= 0 ? "#15542e" : "#8b1a1a" }}
        >
          {liveReturn >= 0 ? "+" : ""}{liveReturn.toFixed(2)}%
        </span>
      ) : (
        <span className="font-mono text-[12px]" style={{ color: "#5a6e82" }}>—</span>
      )}
      {!loading && q?.changePercent != null && (
        <span className="font-mono text-[9px] tabular-nums" style={{ color: "#5a6e82" }}>
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
  const { quotes } = useQuotes();
  const derived = deriveSleeveHoldings(
    holdings,
    quotes ?? null,
    (ticker) => getAvgCost(ticker, sleeve)
  );
  const derivedByTicker = new Map(derived.map((d) => [d.ticker, d]));

  // Bar-scaling: normalize against the largest derived weight in the sleeve
  // so the longest bar fills its track regardless of total summing to 100%.
  const maxBarPct = Math.max(...derived.map((d) => d.portfolioPct), 1);

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
            {["Position", "Weight", "Return", "Category", "Type"].map((h) => (
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
                {/* Position: logo + ticker + company + short subtitle */}
                <td className="px-5 py-5">
                  <div className="flex items-start gap-3">
                    <TickerLogo ticker={h.ticker} name={h.company} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
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
                        <span className="text-[13px] font-medium text-[#0f1e35]">
                          {h.company}
                        </span>
                      </div>
                      {h.thesis && (
                        <p className="mt-0.5 max-w-[320px] text-[11px] leading-[1.55] text-[#5a6e82]">
                          {h.thesis}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Weight */}
                <td className="px-5 py-5">
                  {(() => {
                    const d = derivedByTicker.get(h.ticker);
                    const pct = d?.portfolioPct ?? h.portfolioWeightPct;
                    return (
                      <>
                        <WeightBar pct={pct} max={maxBarPct} color={typeColor} />
                        {d?.weightStatus && d.weightStatus !== "No target" && (
                          <div className="mt-1.5">
                            <WeightStatusBadge status={d.weightStatus} />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </td>

                {/* Return % */}
                <td className="px-5 py-5">
                  <ReturnCell ticker={h.ticker} sleeve={sleeve} />
                </td>

                {/* Category: subcategory becomes the single visible category label */}
                <td className="px-5 py-5">
                  {h.subcategory && (
                    <span className="font-mono text-[11px] text-[#5a6e82]">
                      {h.subcategory}
                    </span>
                  )}
                </td>

                {/* Type */}
                <td className="px-5 py-5">
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
