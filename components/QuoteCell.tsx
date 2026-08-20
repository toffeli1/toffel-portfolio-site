"use client";

import { useQuotes } from "./QuotesProvider";

// NO-PRICE RULE: this module used to export `PriceCell` (a live `$price`) and
// `ChangeCell` (a daily change %). The site does not display security prices —
// live, delayed, per-share, or as a daily/intraday change — so both were
// removed rather than left unrendered: keeping them exported invites silent
// reintroduction later. Only the last-updated stamp remains, which reports
// market-data freshness without disclosing a price.
//
// Don't re-add a price-rendering export here without a deliberate decision.

export function LastUpdated() {
  const { loading, error, lastUpdated } = useQuotes();

  if (loading) return null;

  if (error && !lastUpdated) {
    return (
      <span className="font-mono text-[10px]" style={{ color: "#5a6e82" }}>
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
      <span className="font-mono text-[10px]" style={{ color: "#5a6e82" }}>
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
    <span className="font-mono text-[10px]" style={{ color: "#5a6e82" }}>
      Updated&nbsp;{time}
    </span>
  );
}
