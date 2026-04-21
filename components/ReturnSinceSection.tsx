"use client";

import { useQuotes } from "./QuotesProvider";
import { ReturnChartWrapper } from "./ReturnChartWrapper";
import type { Purchase } from "@/data/holdings";

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
}: {
  ticker: string;
  purchase: Purchase;
}) {
  const { quotes, loading } = useQuotes();
  const q = quotes[ticker];
  const currentPrice = q?.price ?? null;

  const totalGainLoss =
    currentPrice !== null
      ? (currentPrice - purchase.costBasis) * purchase.shares
      : null;
  const returnPct =
    currentPrice !== null
      ? ((currentPrice - purchase.costBasis) / purchase.costBasis) * 100
      : null;
  const currentValue =
    currentPrice !== null ? currentPrice * purchase.shares : null;
  const isUp = returnPct !== null ? returnPct >= 0 : true;

  const dash = (
    <span style={{ color: "#a8b2bd" }}>—</span>
  );
  const dots = (
    <span className="animate-pulse" style={{ color: "#a8b2bd" }}>···</span>
  );

  return (
    <>
      {/* Stats card */}
      <div
        className="rounded-2xl p-8"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(15,30,53,0.09)",
          boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
        }}
      >
        <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
          Return Since Purchase
        </p>

        <div className="grid grid-cols-2 gap-x-10 gap-y-7 sm:grid-cols-4">
          <Stat label="Purchase Price" value={fmt$(purchase.costBasis)} />
          <Stat
            label="Current Price"
            value={
              loading ? dots : currentPrice !== null ? fmt$(currentPrice) : dash
            }
          />
          <Stat
            label="Total Return"
            value={
              loading ? dots : returnPct !== null ? fmtPct(returnPct) : dash
            }
            highlight={!loading && returnPct !== null}
            positive={isUp}
          />
          <Stat
            label="Gain / Loss"
            value={
              loading ? dots : totalGainLoss !== null ? fmt$(totalGainLoss) : dash
            }
            highlight={!loading && totalGainLoss !== null}
            positive={isUp}
          />
        </div>

        <div
          className="my-7 h-px"
          style={{ background: "rgba(15,30,53,0.07)" }}
        />

        <div className="grid grid-cols-3 gap-x-10 gap-y-5">
          <Stat label="Shares" value={purchase.shares.toFixed(2)} />
          <Stat label="Total Invested" value={fmt$(purchase.totalInvested)} />
          <Stat
            label="Current Value"
            value={
              loading ? dots : currentValue !== null ? fmt$(currentValue) : dash
            }
          />
        </div>
      </div>

      {/* % return chart */}
      <div className="mt-5">
        <ReturnChartWrapper ticker={ticker} costBasis={purchase.costBasis} />
      </div>
    </>
  );
}
