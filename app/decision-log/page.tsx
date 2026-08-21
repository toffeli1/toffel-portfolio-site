import { decisionLog } from "@/data/decisionLog";
import DecisionLogByCompany from "@/components/DecisionLogByCompany";
import { decisionsByCompany, pendingWeightEventCount } from "@/data/decisions";
import { portfolioStrategy } from "@/data/portfolioStrategy";

export const metadata = {
  title: "Decision Log",
  description:
    "A record of portfolio decisions, trims, exits, and allocation changes used to evaluate process quality over time.",
};

export default function DecisionLogPage() {
  // Action vocabulary mirrors DecisionLogFeed filters: Add → Buys/Adds,
  // Trim/Rebalance → Risk Management, Exit → Exits.
  const total = decisionLog.length;
  const buys  = decisionLog.filter((e) => e.action === "Add").length;
  const risk  = decisionLog.filter((e) => e.action === "Trim" || e.action === "Rebalance").length;
  const exits = decisionLog.filter((e) => e.action === "Exit").length;

  const blocks = decisionsByCompany();
  const pendingCount = pendingWeightEventCount();

  const stats = [
    { label: "Companies", value: blocks.length },
    { label: "Total Decisions", value: total },
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

        {/* ── Decisions, grouped by company ──────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              By company
            </p>
            <DecisionLogByCompany blocks={blocks} pendingCount={pendingCount} />
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
