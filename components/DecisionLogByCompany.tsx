"use client";

import { useState } from "react";
import Link from "next/link";
import TickerLogo from "./TickerLogo";
import { Tag } from "./Tag";
import type { CompanyDecisions, DecisionEvent } from "@/data/decisions";
import { INK, BODY, MUTED, FAINT, HAIRLINE, CARD, ACCENT, AMBER, NEGATIVE } from "@/lib/theme";

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
  Add: ACCENT,
  Initiate: ACCENT,
  "Re-enter": ACCENT,
  Trim: AMBER,
  Rebalance: AMBER,
  Exit: NEGATIVE,
};

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
      <Tag variant="dashed" title={event.weightPendingReason ?? "Awaiting transaction-level history; not estimated."}>
        % of book pending
      </Tag>
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
  const statusColor = block.status === "active" ? ACCENT : NEGATIVE;

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
    <div className="px-6 py-5" style={CARD}>
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
        <Tag variant="solid" color={statusColor}>{block.statusLabel}</Tag>
      </div>

      {/* Decisions, oldest first */}
      <div className="mt-5 space-y-4">
        {block.events.map((e, i) => (
          <div
            key={`${e.startDate}-${i}`}
            className="pt-4"
            style={{ borderTop: `1px solid ${HAIRLINE}` }}
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
              <Tag color={ACTION_COLOR[e.action] ?? "#1a3a5c"}>{e.actionLabel}</Tag>
              <WeightTransition event={e} />
            </div>
            {e.hasRealRationale ? (
              <p className="max-w-3xl text-[13px] leading-[1.8]" style={{ color: BODY }}>
                {e.rationale}
              </p>
            ) : (
              <Tag variant="dashed" title="No dated, decision-specific note survives for this event; only the transaction itself is on record.">
                no contemporaneous rationale
              </Tag>
            )}
            {e.isPlaceholder && process.env.NODE_ENV !== "production" && (
              <div
                className="mt-3 px-4 py-3"
                style={{ background: "#fdf1e7", border: `1px dashed ${AMBER}`, borderRadius: 8 }}
              >
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: AMBER }}>
                  TODO, dev only, not shown in production
                </p>
                <p className="text-[12px] leading-[1.7]" style={{ color: AMBER }}>
                  {e.placeholderPrompt}
                </p>
              </div>
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
  realRationaleCount,
  totalCount,
}: {
  blocks: CompanyDecisions[];
  pendingCount: number;
  realRationaleCount: number;
  totalCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = blocks.filter((b) => {
    if (filter === "all") return true;
    if (filter === "held") return b.status === "active";
    return b.status === "exited" || b.status === "unknown";
  });

  return (
    <div>
      {/* Disclosure, stated up front rather than left implicit: what the two
          tags below mean, and how much of the log is written versus recorded. */}
      <div className="mb-8 border-l-2 pl-5" style={{ borderColor: HAIRLINE }}>
        <p className="font-mono text-[10px] leading-[1.7]" style={{ color: MUTED }}>
          <span style={{ color: INK }}>{realRationaleCount} of {totalCount} decisions</span>{" "}
          carry a written, decision-specific rationale below. The rest show a
          &ldquo;no contemporaneous rationale&rdquo; tag: the trade is on record, but no dated
          note explaining it survived.
          {pendingCount > 0 && (
            <>
              {" "}{pendingCount} decision{pendingCount === 1 ? "" : "s"}{" "}also do not yet
              show a &ldquo;% of book&rdquo; transition, tagged &ldquo;pending&rdquo;
              rather than estimated, since computing those needs transaction-level
              history and dated portfolio values this dataset does not contain.
            </>
          )}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="font-mono text-[11px] transition-colors"
              style={{
                padding: "8px 14px",
                borderRadius: 4,
                background: active ? INK : "transparent",
                color: active ? "#ffffff" : FAINT,
                border: `1px solid ${active ? INK : HAIRLINE}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {visible.map((b) => (
          <CompanyBlock key={b.ticker} block={b} />
        ))}
      </div>
    </div>
  );
}
