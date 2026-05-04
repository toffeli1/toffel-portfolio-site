import Link from "next/link";
import { portfolios } from "@/data/portfolios";
import { decisionLog } from "@/data/decisionLog";
import DecisionLogFeed from "@/components/DecisionLogFeed";

export const metadata = { title: "Decision Log — Portfolio" };

export default function DecisionLogPage() {
  const total = decisionLog.length;
  const buys  = decisionLog.filter((e) => e.action === "Buy" || e.action === "Market buy").length;
  const risk  = decisionLog.filter((e) => e.action === "Trim").length;
  const exits = decisionLog.filter((e) => e.action === "Full exit").length;

  const stats = [
    { label: "Total Decisions", value: total },
    { label: "Buys / Adds",     value: buys,  color: "#1a4a2e" },
    { label: "Risk Management", value: risk,  color: "#7a4520" },
    { label: "Exits",           value: exits, color: "#8b2530" },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(250,247,242,0.94)",
          borderBottom: "1px solid rgba(15,30,53,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
          >
            Portfolio
          </Link>
          <div className="hidden items-center gap-8 sm:flex">
            {portfolios.map((p) => (
              <Link
                key={p.slug}
                href={`/portfolio/${p.slug}`}
                className="font-mono text-[11px] text-[#111111] transition-opacity duration-150 hover:opacity-50"
              >
                {p.title}
              </Link>
            ))}
            <Link
              href="/analytics"
              className="font-mono text-[11px] text-[#111111] transition-opacity duration-150 hover:opacity-50"
            >
              Analytics
            </Link>
            <Link
              href="/decision-log"
              className="font-mono text-[11px] font-semibold text-[#111111] transition-opacity duration-150"
            >
              Decision Log
            </Link>
          </div>
        </div>
      </nav>

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
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a8b2bd]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feed */}
        <section>
          <div className="mx-auto max-w-4xl px-6 py-10 lg:px-12">
            <DecisionLogFeed entries={decisionLog} />
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-12">
          <p className="font-mono text-[10px] text-[#a8b2bd]">
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
