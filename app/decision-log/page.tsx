import DecisionLogByCompany from "@/components/DecisionLogByCompany";
import Eyebrow from "@/components/Eyebrow";
import {
  decisionsByCompany,
  pendingWeightEventCount,
  realRationaleEventCount,
  totalEventCount,
} from "@/data/decisions";
import { portfolioStrategy } from "@/data/portfolioStrategy";
import { INK, BODY, MUTED, HAIRLINE, CARD, ACCENT, AMBER, NEGATIVE, SECTION_Y } from "@/lib/theme";

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
    { label: "Buys / Adds",     value: buys,  color: ACCENT },
    { label: "Risk Management", value: risk,  color: AMBER },
    { label: "Exits",           value: exits, color: NEGATIVE },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>

      <main>
        {/* Header + stats */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-4xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-3">Process</Eyebrow>
            <h1 className="font-display text-[32px] font-semibold tracking-tight" style={{ color: INK }}>
              Decision Log
            </h1>
            <p className="mt-3 max-w-lg text-[14px] leading-[1.75]" style={{ color: BODY }}>
              A record of portfolio decisions, trims, exits, and allocation changes used to evaluate process quality over time.
            </p>

            {/* Summary stats */}
            <div
              className="mt-8 grid grid-cols-2 divide-x divide-y border-y sm:grid-cols-5 sm:divide-y-0"
              style={{ borderColor: HAIRLINE }}
            >
              {stats.map(({ label, value, color }) => (
                <div key={label} className="px-5 py-4 first:pl-0">
                  <span
                    className="block font-mono font-semibold leading-none tracking-tight"
                    style={{ color: color ?? INK, fontSize: "1.5rem" }}
                  >
                    {value}
                  </span>
                  <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
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
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-4xl px-6 ${SECTION_Y} lg:px-12`}>
            <div className="px-7 py-7" style={CARD}>
              <Eyebrow className="mb-1">Standing rationale</Eyebrow>
              <h2 className="font-display mb-5 text-[20px] font-semibold tracking-tight" style={{ color: INK }}>
                {portfolioStrategy.heading}
              </h2>
              <div className="max-w-2xl space-y-4">
                {portfolioStrategy.body.map((para, i) => (
                  <p key={i} className="text-[14px] leading-[1.85]" style={{ color: BODY }}>
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
          <section className="border-b" style={{ borderColor: AMBER }}>
            <div className={`mx-auto max-w-4xl px-6 ${SECTION_Y} lg:px-12`}>
              <div
                className="px-7 py-7"
                style={{ background: "#fdf1e7", border: `1px dashed ${AMBER}`, borderRadius: 10 }}
              >
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: AMBER }}>
                  TODO — dev only, not shown in production, draft awaiting approval
                </p>
                <h2 className="font-display mb-3 text-[20px] font-semibold tracking-tight" style={{ color: AMBER }}>
                  July 2026 Restructuring Note
                </h2>
                <p className="max-w-2xl text-[13px] leading-[1.8]" style={{ color: AMBER }}>
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
          <div className={`mx-auto max-w-4xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-8">By company</Eyebrow>
            <DecisionLogByCompany
              blocks={publicBlocks}
              pendingCount={pendingCount}
              realRationaleCount={realRationaleCount}
              totalCount={totalEvents}
            />
          </div>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-12">
          <p className="font-mono text-[10px]" style={{ color: MUTED }}>
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
