import Link from "next/link";
import { notFound } from "next/navigation";
import { etfProfiles } from "@/data/etfConstituents";
import { ChartWrapper } from "@/components/ChartWrapper";
import { positionLots, positionAverageCost } from "@/lib/positionLots";

export function generateStaticParams() {
  return Object.keys(etfProfiles).map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const profile = etfProfiles[ticker];
  if (!profile) return {};
  return { title: `${profile.ticker} — ${profile.fullName}` };
}

export default async function EtfDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const profile = etfProfiles[ticker];
  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-[#faf7f2]">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(250,247,242,0.94)",
          borderBottom: "1px solid rgba(15,30,53,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <Link
            href="/portfolio/etfs"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
          >
            ← ETFs
          </Link>
          <span className="hidden font-mono text-[11px] text-[#a8b2bd] sm:block">
            {profile.ticker}&ensp;·&ensp;{profile.fullName}
          </span>
        </div>
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden border-b"
          style={{ borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="absolute inset-0 hero-grid" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
            <div className="mb-5">
              <span
                className="rounded px-3 py-1 font-mono text-[9px] text-[#7a8799]"
                style={{ border: "1px solid rgba(15,30,53,0.1)" }}
              >
                ETF
              </span>
            </div>
            <h1
              className="font-bold leading-[0.88] tracking-[-0.03em] text-[#0f1e35]"
              style={{ fontSize: "clamp(4.5rem,10vw,9rem)" }}
            >
              {profile.ticker}
            </h1>
            <p
              className="mt-5 font-medium text-[#3d4f66]"
              style={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)" }}
            >
              {profile.fullName}
            </p>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.75] text-[#5a6e82]">
              {profile.description}
            </p>
          </div>
        </section>

        {/* ── Price Chart ──────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
            <ChartWrapper
              ticker={profile.ticker}
              purchaseLots={positionLots[profile.ticker]}
              averageCost={positionAverageCost[profile.ticker]}
            />
          </div>
        </section>

        {/* ── Top Holdings ─────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <div className="mb-8 flex items-end justify-between gap-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Top Holdings
              </p>
              <p className="font-mono text-[9px] text-[#a8b2bd]">
                {profile.constituentsNote}
              </p>
            </div>

            <div
              className="overflow-x-auto rounded-2xl"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,30,53,0.09)",
                boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
              }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      background: "#f8f4ee",
                      borderBottom: "1px solid rgba(15,30,53,0.07)",
                    }}
                  >
                    {["#", "Ticker", "Company", "Weight", "Sector"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profile.constituents.map((c, i) => (
                    <tr
                      key={c.ticker}
                      style={
                        i < profile.constituents.length - 1
                          ? { borderBottom: "1px solid rgba(15,30,53,0.05)" }
                          : undefined
                      }
                    >
                      <td className="px-5 py-4 font-mono text-[10px] tabular-nums text-[#a8b2bd]">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-4 font-mono text-[12px] font-bold text-[#0f1e35]">
                        {c.ticker}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#2d3d52]">
                        {c.company}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-20 overflow-hidden rounded-full"
                            style={{ background: "rgba(15,30,53,0.07)", height: 3 }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(c.weightPct / profile.constituents[0].weightPct) * 100}%`,
                                backgroundColor: "#1a3a5c",
                                opacity: 0.6,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[11px] tabular-nums text-[#5a6e82]">
                            {c.weightPct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-[#7a8799]">
                        {c.sector ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex items-center justify-between">
            <Link
              href="/portfolio/etfs"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
            >
              ← ETFs
            </Link>
            <p className="font-mono text-[10px] text-[#a8b2bd]">
              For informational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
