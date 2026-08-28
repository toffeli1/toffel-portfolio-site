import Link from "next/link";
import { notFound } from "next/navigation";
import { etfProfiles } from "@/data/etfConstituents";
import { ChartWrapper } from "@/components/ChartWrapper";
import { fmtPortfolioDate } from "@/lib/config";
import Eyebrow from "@/components/Eyebrow";
import { Tag } from "@/components/Tag";
import { INK, HAIRLINE, CARD } from "@/lib/theme";

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
  return {
    title: `${profile.ticker} ${profile.fullName}`,
    description: `${profile.ticker} ${profile.fullName}: look-through composition, sector exposure, and portfolio role.`,
  };
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
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden border-b"
          style={{ borderColor: HAIRLINE }}
        >
          <div className="absolute inset-0 hero-grid" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
            <div className="mb-5">
              <Tag>ETF</Tag>
            </div>
            <h1
              className="font-mono font-semibold leading-none tracking-tight"
              style={{ color: INK, fontSize: "clamp(2.4rem,6vw,4.5rem)" }}
            >
              {profile.ticker}
            </h1>
            <p
              className="font-display mt-5 font-semibold"
              style={{ color: INK, fontSize: "clamp(1.3rem,2.6vw,1.75rem)" }}
            >
              {profile.fullName}
            </p>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.75] text-[#5a6e82]">
              {profile.description}
            </p>
          </div>
        </section>

        {/* ── Performance Chart (percent change; no prices) ────────────────── */}
        <section
          className="border-b"
          style={{ borderColor: HAIRLINE }}
        >
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
{/* PRIVACY: purchaseLots, averageCost and entryMarker all carry real
                  per-share PRICES. ChartWrapper is a client component, so passing
                  them serialised those prices into the page payload — they showed
                  up in built HTML even though the chart renders percent-only.
                  Dropped: every ticker that has lot data is now registered and
                  308-redirects to /thesis/[ticker], so these legacy pages are
                  unreachable and lose nothing visible. Do not re-add a
                  price-bearing prop to a client chart. */}
            <ChartWrapper ticker={profile.ticker} />
          </div>
        </section>

        {/* ── Sector Breakdown (when sectorBreakdown is provided) ─────────── */}
        {profile.sectorBreakdown && profile.sectorBreakdown.length > 0 && (() => {
          const maxSectorWeight = Math.max(...profile.sectorBreakdown!.map((s) => s.weightPct));
          return (
            <section className="border-b" style={{ borderColor: HAIRLINE }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <div className="mb-8 flex items-end justify-between gap-6">
                  <Eyebrow className="">Sector Allocation</Eyebrow>
                  <p className="font-mono text-[9px] text-[#5a6e82]">
                    ETF allocation data as of {fmtPortfolioDate(profile.asOf)}. Representative only.
                  </p>
                </div>
                <div
                  className="overflow-x-auto"
                  style={CARD}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#f8f4ee", borderBottom: `1px solid ${HAIRLINE}` }}>
                        {["Sector", "VOO Weight"].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {profile.sectorBreakdown!.map((s, i) => (
                        <tr
                          key={s.sector}
                          style={i < profile.sectorBreakdown!.length - 1 ? { borderBottom: `1px solid ${HAIRLINE}` } : undefined}
                        >
                          <td className="px-5 py-4 text-[13px] text-[#2d3d52]">{s.sector}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-40 overflow-hidden rounded-full" style={{ background: "rgba(15,30,53,0.07)", height: 3 }}>
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${(s.weightPct / maxSectorWeight) * 100}%`, backgroundColor: "#1a3a5c", opacity: 0.6 }}
                                />
                              </div>
                              <span className="font-mono text-[11px] tabular-nums text-[#5a6e82]">
                                {s.weightPct.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── Top Holdings (when individual constituents are available) ──────── */}
        {profile.constituents.length > 0 && (
          <section className="border-b" style={{ borderColor: HAIRLINE }}>
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <div className="mb-8 flex items-end justify-between gap-6">
                <Eyebrow className="">Top Holdings</Eyebrow>
                <p className="max-w-md font-mono text-[9px] leading-[1.55] text-[#5a6e82]">
                  ETF allocation data as of {fmtPortfolioDate(profile.asOf)}.{profile.constituentsNote ? ` ${profile.constituentsNote}` : ""}
                </p>
              </div>
              <div
                className="overflow-x-auto" style={CARD}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f8f4ee", borderBottom: `1px solid ${HAIRLINE}` }}>
                      {["#", "Ticker", "Company", "Weight", "Sector"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.constituents.map((c, i) => (
                      <tr
                        key={c.ticker}
                        style={i < profile.constituents.length - 1 ? { borderBottom: `1px solid ${HAIRLINE}` } : undefined}
                      >
                        <td className="px-5 py-4 font-mono text-[10px] tabular-nums text-[#5a6e82]">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-5 py-4 font-mono text-[12px] font-bold text-[#0f1e35]">
                          {c.ticker}
                        </td>
                        <td className="px-5 py-4 text-[13px] text-[#2d3d52]">{c.company}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 overflow-hidden rounded-full" style={{ background: "rgba(15,30,53,0.07)", height: 3 }}>
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
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5a6e82] transition-colors hover:text-[#0f1e35]"
            >
              ← Portfolio
            </Link>
            <p className="font-mono text-[10px] text-[#5a6e82]">
              For informational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
