"use client";

import { useQuotes } from "./QuotesProvider";

function Dots() {
  return (
    <span
      className="font-mono animate-pulse select-none"
      style={{ color: "#a8b2bd" }}
    >
      ···
    </span>
  );
}

function Unavailable({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      className="font-mono select-none"
      style={{
        color: "#a8b2bd",
        fontSize: size === "lg" ? "1rem" : undefined,
      }}
    >
      Unavailable
    </span>
  );
}

export function PriceCell({ ticker }: { ticker: string }) {
  const { quotes, loading, error } = useQuotes();

  if (loading) return <Dots />;

  const q = quotes[ticker];
  if (!q || q.price === null) {
    return <Unavailable size="lg" />;
  }

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
  if (!q || q.changePercent === null) return null;

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
  const { loading, error, lastUpdated } = useQuotes();

  if (loading) return null;

  if (error && !lastUpdated) {
    return (
      <span className="font-mono text-[10px]" style={{ color: "#a8b2bd" }}>
        Market data unavailable
      </span>
    );
  }

  if (error && lastUpdated) {
    const time = lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <span className="font-mono text-[10px]" style={{ color: "#a8b2bd" }}>
        Last updated&nbsp;{time}&ensp;·&ensp;Retrying
      </span>
    );
  }

  if (!lastUpdated) return null;

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
