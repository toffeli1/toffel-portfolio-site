import DecisionLogByCompany from "@/components/DecisionLogByCompany";
import {
  decisionsByCompany,
  pendingWeightEventCount,
  realRationaleEventCount,
  totalEventCount,
} from "@/data/decisions";
import { portfolioStrategy } from "@/data/portfolioStrategy";

export const metadata = {
  title: "Decision Log",
  description:
    "A record of portfolio decisions, trims, exits, and allocation changes used to evaluate process quality over time.",
};

export default function DecisionLogPage() {
  const blocks = decisionsByCompany();
  const pendingCount = pendingWeightEventCount();
  const realRationaleCount = realRationaleEventCount();
  const totalEvents = totalEventCount();

  // Single source for every count below: the merged, company-grouped event
  // list (data/decisions.ts), the same model the legend and company blocks
  // read from. A raw count of data/decisionLog.ts rows would disagree with
  // it, since that file doesn't include lifecycle-reconstructed Initiate /
  // Re-enter events and doesn't merge same-day or grouped rows into one
  // decision. Initiate and Re-enter both count as Buys/Adds: opening or
  // reopening a position is a buy either way.
  const allEvents = blocks.flatMap((b) => b.events);
  const buys  = allEvents.filter((e) => e.action === "Add" || e.action === "Initiate" || e.action === "Re-enter").length;
  const risk  = allEvents.filter((e) => e.action === "Trim" || e.action === "Rebalance").length;
  const exits = allEvents.filter((e) => e.action === "Exit").length;

  // DecisionLogByCompany is a client component, so whatever it receives as
  // `blocks` gets serialised into the page payload for hydration, regardless
  // of what its own NODE_ENV check chooses to render. A dev-only prompt has
  // to be stripped HERE, on the server, before it ever crosses that boundary,
  // or the raw text ships to every visitor even though the UI hides it.
  // Deleting the keys outright, not just blanking their values: React's RSC
  // serialisation encodes an explicit `undefined` value as a literal
  // "$undefined" string, so setting isPlaceholder/placeholderPrompt to
  // undefined still leaves the field NAME sitting in the payload.
  const isProd = process.env.NODE_ENV === "production";
  const publicBlocks = isProd
    ? blocks.map((b) => ({
        ...b,
        events: b.events.map((e) => {
          const { isPlaceholder: _isPlaceholder, placeholderPrompt: _placeholderPrompt, ...rest } = e;
          return rest;
        }),
      }))
    : blocks;

  const stats = [
    { label: "Companies", value: blocks.length },
    { label: "Total Decisions", value: totalEvents },
    { label: "Buys / Adds",     value: buys,  color: "#1a4a2e" },
    { label: "Risk Management", value: risk,  color: "#7a4520" },
    { label: "Exits",           value: exits, color: "#8b2530" },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2]">

      <main>
        {/* Header + stats */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-4xl px-6 py-14 lg:px-12">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Process
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
              Decision Log
            </h1>
            <p className="mt-3 max-w-lg text-[14px] leading-[1.75] text-[#3d4f66]">
              A record of portfolio decisions, trims, exits, and allocation changes used to evaluate process quality over time.
            </p>

            {/* Summary stats */}
            <div className="mt-8 flex flex-wrap gap-3">
              {stats.map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-baseline gap-2 rounded-xl px-4 py-3"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(15,30,53,0.09)",
                  }}
                >
                  <span
                    className="font-mono text-[18px] font-bold tabular-nums"
                    style={{ color: color ?? "#0f1e35" }}
                  >
                    {value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5a6e82]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Permanent Portfolio Strategy ─────────────────────────────────
            Pinned above the company blocks. Not a dated trade — it is the
            standing rationale every entry below sits underneath. */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
            <div
              className="rounded-2xl px-7 py-7"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,30,53,0.09)",
                boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
              }}
            >
              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-[#7a8799]">
                Standing rationale
              </p>
              <h2 className="mb-5 text-[19px] font-semibold tracking-tight text-[#0f1e35]">
                {portfolioStrategy.heading}
              </h2>
              <div className="max-w-2xl space-y-4">
                {portfolioStrategy.body.map((para, i) => (
                  <p key={i} className="text-[14px] leading-[1.85] text-[#2d3d52]">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/*
          TODO(isaac): July 2026 restructuring note. This is a DRAFT written
          for you to approve or edit, not final copy; it has not been
          verified against a specific external event (brokerage transfer,
          account consolidation, etc.) beyond what the ledger shows, which is
          16 of 19 exits recorded to month-resolution only. Read it, correct
          anything wrong, and only then fold it into a StrategyNote-shaped
          constant the same way data/portfolioStrategy.ts does and delete this
          block and the dev-only section below.
        */}
        {process.env.NODE_ENV !== "production" && (
          <section className="border-b" style={{ borderColor: "#c98a4b" }}>
            <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
              <div
                className="rounded-2xl px-7 py-7"
                style={{ background: "#fdf1e7", border: "1px dashed #c98a4b" }}
              >
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-[#7a4520]">
                  TODO — dev only, not shown in production, draft awaiting approval
                </p>
                <h2 className="mb-3 text-[19px] font-semibold tracking-tight text-[#7a4520]">
                  July 2026 Restructuring Note
                </h2>
                <p className="max-w-2xl text-[13px] leading-[1.8] text-[#7a4520]">
                  Sixteen positions show a July 2026 exit with no exact date. That is not
                  sixteen decisions made in one month, it is sixteen positions whose exit dates
                  were never recorded and which surfaced together in the July tracker snapshot.
                  I cannot tell you what day most of them closed. The tail was small
                  speculative names I could not have defended in detail, and the capital went
                  into fewer, larger positions in August. The record keeping is the failure
                  here, and it is why this log exists now.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Decisions, grouped by company ──────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              By company
            </p>
            <DecisionLogByCompany
              blocks={publicBlocks}
              pendingCount={pendingCount}
              realRationaleCount={realRationaleCount}
              totalCount={totalEvents}
            />
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-12">
          <p className="font-mono text-[10px] text-[#5a6e82]">
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
