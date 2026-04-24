"use client";

import { useQuotes } from "./QuotesProvider";
import { ReturnChartWrapper } from "./ReturnChartWrapper";
import type { Purchase, Holding } from "@/data/holdings";
import { holdings as allHoldings } from "@/data/holdings";

function fmt$(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

interface StatProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  positive?: boolean;
}

function Stat({ label, value, highlight, positive }: StatProps) {
  const valueColor = highlight
    ? positive
      ? "#15542e"
      : "#8b1a1a"
    : "#0f1e35";
  return (
    <div>
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[#a8b2bd]">
        {label}
      </p>
      <p
        className="font-mono font-bold tabular-nums"
        style={{ fontSize: "clamp(1.1rem,2vw,1.4rem)", color: valueColor }}
      >
        {value}
      </p>
    </div>
  );
}

export function ReturnSinceSection({
  ticker,
  purchase,
  holdingsList,
}: {
  // legacy single position support
  ticker?: string;
  purchase?: Purchase;
  // new: render for a list of holdings; defaults to all holdings when provided
  holdingsList?: Holding[];
}) {
  const { quotes, loading } = useQuotes();

  const dash = <span style={{ color: "#a8b2bd" }}>—</span>;
  const dots = <span className="animate-pulse" style={{ color: "#a8b2bd" }}>···</span>;

  // Determine entries to render. Priority:
  // 1) explicit holdingsList prop
  // 2) single purchase + ticker (legacy)
  // 3) all holdings
  const entries: { ticker: string; purchasePrice: number | null; shares: number | null; totalInvested: number | null }[] =
    holdingsList && holdingsList.length > 0
      ? holdingsList.map((h) => {
          const purchasePrice = h.purchase?.costBasis ?? h.entryPrice ?? null;
          const shares = h.purchase?.shares ?? null;
          const totalInvested = shares !== null && purchasePrice !== null ? shares * purchasePrice : (h.purchase?.totalInvested ?? null);
          return { ticker: h.ticker, purchasePrice, shares, totalInvested };
        })
      : purchase && ticker
      ? [
          {
            ticker: ticker,
            purchasePrice: purchase.costBasis ?? null,
            shares: purchase.shares ?? null,
            totalInvested: purchase.totalInvested ?? null,
          },
        ]
      : allHoldings.map((h) => {
          const purchasePrice = h.purchase?.costBasis ?? h.entryPrice ?? null;
          const shares = h.purchase?.shares ?? null;
          const totalInvested = shares !== null && purchasePrice !== null ? shares * purchasePrice : (h.purchase?.totalInvested ?? null);
          return { ticker: h.ticker, purchasePrice, shares, totalInvested };
        });

  return (
    <>
      {/* Render one card per entry */}
      <div className="space-y-6">
        {entries.map((e) => {
          const q = quotes[e.ticker];
          const currentPrice = q?.price ?? null;

          const totalReturnPct =
            currentPrice !== null && e.purchasePrice !== null
              ? ((currentPrice / e.purchasePrice) - 1) * 100
              : null;

          const currentValue =
            currentPrice !== null && e.shares !== null ? e.shares * currentPrice : null;

          const isUp = totalReturnPct !== null ? totalReturnPct >= 0 : true;

          return (
            <div
              key={e.ticker}
              className="rounded-2xl p-8"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,30,53,0.09)",
                boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
              }}
            >
              <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Return Since Purchase — {e.ticker}
              </p>

              <div className="grid grid-cols-2 gap-x-10 gap-y-7 sm:grid-cols-4">
                <Stat label="Purchase Price" value={e.purchasePrice !== null ? fmt$(e.purchasePrice) : dash} />
                <Stat
                  label="Current Price"
                  value={loading ? dots : currentPrice !== null ? fmt$(currentPrice) : dash}
                />
                <Stat
                  label="Total Return"
                  value={loading ? dots : totalReturnPct !== null ? fmtPct(totalReturnPct) : dash}
                  highlight={!loading && totalReturnPct !== null}
                  positive={isUp}
                />
                {/* removed dollar Gain / Loss as requested */}
              </div>

              <div className="my-7 h-px" style={{ background: "rgba(15,30,53,0.07)" }} />

              <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                <Stat label="Shares" value={e.shares !== null ? e.shares.toFixed(2) : dash} />
                <Stat label="Total Invested" value={e.totalInvested !== null ? fmt$(e.totalInvested) : dash} />
                <Stat
                  label="Current Value"
                  value={loading ? dots : currentValue !== null ? fmt$(currentValue) : dash}
                />
              </div>

              {/* chart only for single legacy purchase view */}
              {purchase && ticker && e.ticker === ticker && e.purchasePrice !== null && (
                <div className="mt-5">
                  <ReturnChartWrapper ticker={ticker} costBasis={e.purchasePrice} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
