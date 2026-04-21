"use client";

import { useQuotes } from "./QuotesProvider";

function Dash() {
  return <span className="font-mono select-none" style={{ color: "#a8b2bd" }}>—</span>;
}

function Dots() {
  return <span className="font-mono select-none" style={{ color: "#a8b2bd" }}>···</span>;
}

export function PriceCell({ ticker }: { ticker: string }) {
  const { quotes, loading } = useQuotes();

  if (loading) return <Dots />;

  const q = quotes[ticker];
  if (!q || q.price === null) return <Dash />;

  return (
    <span className="font-mono text-sm font-medium" style={{ color: "#0f1e35" }}>
      $
      {q.price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

export function ChangeCell({ ticker }: { ticker: string }) {
  const { quotes, loading } = useQuotes();

  if (loading) return <Dots />;

  const q = quotes[ticker];
  if (!q || q.changePercent === null) return <Dash />;

  const positive = q.changePercent >= 0;

  return (
    <span
      className="font-mono text-sm font-medium tabular-nums"
      style={{ color: positive ? "#15542e" : "#8b1a1a" }}
    >
      {positive ? "+" : ""}
      {q.changePercent.toFixed(2)}%
    </span>
  );
}

export function LastUpdated() {
  const { loading, lastUpdated } = useQuotes();

  if (loading || !lastUpdated) return null;

  const time = lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span className="font-mono text-[10px]" style={{ color: "#a8b2bd" }}>
      Updated&nbsp;{time}
    </span>
  );
}
