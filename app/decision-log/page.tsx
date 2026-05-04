import Link from "next/link";
import { portfolios } from "@/data/portfolios";
import { decisionLog } from "@/data/decisionLog";

export const metadata = { title: "Decision Log — Portfolio" };

function formatDate(date: string): string {
  if (date.length === 7) {
    // "YYYY-MM"
    const [y, m] = date.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ACTION_COLOR: Record<string, string> = {
  "Buy":        "#1a4a2e",
  "Market buy": "#1a4a2e",
  "Trim":       "#7a4520",
  "Full exit":  "#8b2530",
};

export default function DecisionLogPage() {
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
                className="font-mono text-[11px] text-[#a8b2bd] transition-colors duration-150 hover:text-[#0f1e35]"
              >
                {p.title}
              </Link>
            ))}
            <Link
              href="/analytics"
              className="font-mono text-[11px] text-[#a8b2bd] transition-colors duration-150 hover:text-[#0f1e35]"
            >
              Analytics
            </Link>
            <Link
              href="/decision-log"
              className="font-mono text-[11px] text-[#0f1e35] transition-colors duration-150 hover:text-[#0f1e35]"
            >
              Decision Log
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Header */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Process
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
              Decision Log
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.75] text-[#3d4f66]">
              A record of portfolio decisions, trims, exits, and allocation changes used to evaluate process quality over time.
            </p>
          </div>
        </section>

        {/* Entries */}
        <section style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
            <div className="space-y-5">
              {decisionLog.map((entry, i) => {
                const actionColor = ACTION_COLOR[entry.action] ?? "#1a3a5c";
                const actionBg = `${actionColor}12`;
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-7"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(15,30,53,0.09)",
                      boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
                    }}
                  >
                    {/* Row 1: date + badges */}
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={entry.href}
                          className="font-mono text-[13px] font-semibold transition-opacity hover:opacity-70"
                          style={{ color: actionColor }}
                        >
                          {entry.ticker}
                        </Link>
                        <span className="text-[13px] text-[#3d4f66]">{entry.company}</span>
                        <span
                          className="rounded font-mono text-[8px] uppercase tracking-[0.18em]"
                          style={{
                            color: actionColor,
                            backgroundColor: actionBg,
                            padding: "3px 8px",
                          }}
                        >
                          {entry.action}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="rounded font-mono text-[8px] uppercase tracking-[0.15em]"
                          style={{
                            color: "#7a8799",
                            backgroundColor: "rgba(15,30,53,0.05)",
                            padding: "3px 8px",
                          }}
                        >
                          {entry.account}
                        </span>
                        <span className="font-mono text-[11px] text-[#a8b2bd]">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                    </div>

                    {/* Type */}
                    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8b2bd]">
                      {entry.type}
                    </p>

                    {/* Note */}
                    <p className="text-[13px] leading-[1.85] text-[#3d4f66]">{entry.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <p className="font-mono text-[10px] text-[#a8b2bd]">
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
