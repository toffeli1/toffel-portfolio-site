"use client";

import { useState } from "react";
import Link from "next/link";
import TickerLogo from "./TickerLogo";
import type { CompanyDecisions, DecisionEvent } from "@/data/decisions";

// ─── Decision Log, grouped by company ─────────────────────────────────────────
// One block per ticker; decisions run chronologically inside it. Replaces the
// single reverse-chronological feed, where reading one position's arc meant
// scrolling past every other name.
//
// Clicking a company's logo (or name) opens its thesis page — the same
// lib/routes.ts resolver Investments uses, so exited names land on their
// historical thesis page rather than a dead link.
//
// Weight transitions render as "pending" when real values aren't available.
// That is deliberate: see the weights note in data/decisions.ts.

type Filter = "all" | "held" | "exited";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All companies" },
  { key: "held", label: "Currently held" },
  { key: "exited", label: "Exited" },
];

const ACTION_COLOR: Record<string, string> = {
  Add: "#1a4a2e",
  Initiate: "#1a4a2e",
  Trim: "#7a4520",
  Rebalance: "#7a4520",
  Exit: "#8b2530",
};

const INK = "#0f1e35";
const BODY = "#2d3d52";
const MUTED = "#5a6e82";
const FAINT = "#7a8799";

function formatDate(date: string): string {
  if (date.length === 7) {
    const [y, m] = date.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Jul 28 – Aug 10, 2026" for combined multi-day events. */
function formatRange(e: DecisionEvent): string {
  if (!e.endDate) return formatDate(e.startDate);
  return `${formatDate(e.startDate)} – ${formatDate(e.endDate)}`;
}

function WeightTransition({ event }: { event: DecisionEvent }) {
  const hasOld = event.oldWeightPct !== undefined;
  const hasNew = event.newWeightPct !== undefined;

  // Partially known: a genuine initiation has a real 0.00% opening weight, but
  // the closing weight needs the portfolio-value reconstruction. Show what is
  // known and mark only the missing half pending — collapsing the whole thing
  // to "pending" would throw away real information.
  if (hasOld && !hasNew) {
    return (
      <span className="font-mono text-[11px] tabular-nums" style={{ color: INK }}>
        {event.oldWeightPct!.toFixed(2)}%
        <span style={{ color: FAINT }}> → </span>
        <span
          style={{ color: FAINT, borderBottom: "1px dashed rgba(15,30,53,0.25)" }}
          title="Awaiting portfolio-value reconstruction; not estimated."
        >
          pending
        </span>
      </span>
    );
  }

  const known = hasOld && hasNew;
  if (!known) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded font-mono text-[9px] uppercase tracking-[0.12em]"
        style={{
          color: FAINT,
          border: "1px dashed rgba(15,30,53,0.18)",
          padding: "3px 8px",
        }}
        title={event.weightPendingReason ?? "Awaiting transaction-level history; not estimated."}
      >
        % of book pending
      </span>
    );
  }

  return (
    <span
      className="font-mono text-[11px] tabular-nums"
      style={{ color: INK }}
      title={
        event.priorCloseDate && event.endCloseDate
          ? `% of securities book. Valued at the ${event.priorCloseDate} close and the ${event.endCloseDate} close.`
          : undefined
      }
    >
      {event.oldWeightPct!.toFixed(2)}%
      <span style={{ color: FAINT }}> → </span>
      {event.newWeightPct!.toFixed(2)}%
    </span>
  );
}

function CompanyBlock({ block }: { block: CompanyDecisions }) {
  const href = `/thesis/${block.ticker}`;
  const linkable = block.status !== "unknown";

  const identity = (
    <div className="flex min-w-0 items-center gap-3.5">
      <TickerLogo ticker={block.ticker} name={block.company} size="md" />
      <div className="min-w-0">
        <p className="font-mono text-[13px] font-semibold" style={{ color: INK }}>
          {block.ticker}
        </p>
        <p className="truncate text-[12px]" style={{ color: MUTED }}>
          {block.company}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      {/* Block header: logo + name + current status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {linkable ? (
          <Link
            href={href}
            className="inline-flex min-w-0 transition-opacity hover:opacity-70"
            aria-label={`${block.company} (${block.ticker}) thesis`}
          >
            {identity}
          </Link>
        ) : (
          identity
        )}
        <span
          className="rounded font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{
            color: block.status === "active" ? "#1a4a2e" : "#8b2530",
            background:
              block.status === "active" ? "rgba(26,74,46,0.08)" : "rgba(139,37,48,0.08)",
            padding: "4px 10px",
          }}
        >
          {block.statusLabel}
        </span>
      </div>

      {/* Decisions, oldest first */}
      <div className="mt-5 space-y-4">
        {block.events.map((e, i) => (
          <div
            key={`${e.startDate}-${i}`}
            className="pt-4"
            style={{ borderTop: "1px solid rgba(15,30,53,0.06)" }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-[10px]" style={{ color: MUTED }}>
                {formatRange(e)}
              </span>
              {e.dateApproximate && (
                <span
                  className="font-mono text-[9px]"
                  style={{ color: FAINT }}
                  title="Source records the month but not the exact day."
                >
                  month-resolution
                </span>
              )}
              <span
                className="rounded font-mono text-[9px] uppercase tracking-[0.14em]"
                style={{
                  color: ACTION_COLOR[e.action] ?? "#1a3a5c",
                  border: `1px solid ${ACTION_COLOR[e.action] ?? "#1a3a5c"}33`,
                  padding: "2px 8px",
                }}
              >
                {e.actionLabel}
              </span>
              <WeightTransition event={e} />
            </div>
            {e.rationale && (
              <p className="max-w-3xl text-[13px] leading-[1.8]" style={{ color: BODY }}>
                {e.rationale}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DecisionLogByCompany({
  blocks,
  pendingCount,
}: {
  blocks: CompanyDecisions[];
  pendingCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = blocks.filter((b) => {
    if (filter === "all") return true;
    if (filter === "held") return b.status === "active";
    return b.status === "exited" || b.status === "unknown";
  });

  return (
    <div>
      {/* Pending-data disclosure. Stated up front rather than left implicit. */}
      {pendingCount > 0 && (
        <div
          className="mb-8 rounded-xl px-5 py-4"
          style={{ background: "#f8f4ee", border: "1px solid rgba(15,30,53,0.08)" }}
        >
          <p className="font-mono text-[10px] leading-[1.7]" style={{ color: MUTED }}>
            <span style={{ color: INK }}>Allocation history pending.</span>{" "}
            {pendingCount} decision{pendingCount === 1 ? "" : "s"} do not yet show a
            &ldquo;% of book&rdquo; transition. Computing those correctly needs
            transaction-level history and dated portfolio values that this dataset
            does not contain, so they are marked pending rather than estimated.
          </p>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="rounded-full font-mono text-[11px] transition-colors"
              style={{
                padding: "10px 16px",
                background: active ? "#111111" : "transparent",
                color: active ? "#ffffff" : FAINT,
                border: `1px solid ${active ? "#111111" : "rgba(15,30,53,0.15)"}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        {visible.map((b) => (
          <CompanyBlock key={b.ticker} block={b} />
        ))}
      </div>
    </div>
  );
}
