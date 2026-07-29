import Link from "next/link";
import type { PerformanceResult } from "@/lib/perf";
import derivedRaw from "@/data/performanceDerived.json";
import {
  performanceHoldings,
  isFlaggedConcentration,
  CONCENTRATION_CAP_PCT,
} from "@/data/performanceHoldings";
import PerformanceEquityCurve from "@/components/PerformanceEquityCurve";
import PerformanceMonthlyBars from "@/components/PerformanceMonthlyBars";

export const metadata = {
  title: "Performance",
  description:
    "Time-weighted return vs. VOO since inception, monthly returns, risk statistics, and the current book.",
};

const derived = derivedRaw as PerformanceResult;

const ACCENT = "#1a4a2e";
const NAVY = "#1a3a5c";
const POSITIVE = "#15542e";
const NEGATIVE = "#8b1a1a";

const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid rgba(15,30,53,0.09)",
  boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
} as const;

function fmtSignedPct(n: number, digits = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function fmtSignedPts(n: number, digits = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)} pts`;
}

function toneColor(n: number): string {
  return n >= 0 ? POSITIVE : NEGATIVE;
}

function fmtMonthDate(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
      {children}
    </p>
  );
}

function Stat({
  label,
  value,
  color,
  sub,
  size = "lg",
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
  size?: "lg" | "md";
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-[#5a6e82]">{label}</p>
      <p
        className="font-mono font-bold tabular-nums"
        style={{
          fontSize: size === "lg" ? "clamp(1.6rem,3.2vw,2.3rem)" : "clamp(1.3rem,2.4vw,1.6rem)",
          color: color ?? "#0f1e35",
        }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 font-mono text-[10px] leading-[1.5] text-[#7a8799]">{sub}</p>}
    </div>
  );
}

export default function PerformancePage() {
  const {
    n,
    inceptionDate,
    asOfDate,
    cumulativeTWRPct,
    annualizedEquivalentPct,
    annualizedVolPct,
    drawdown,
    bestMonth,
    worstMonth,
    hitRateFraction,
    sortino,
    sharpe,
    benchmarkFullWindow,
    alphaFullWindowPts,
    alphaThroughPriorMonthPts,
    priorMonthDate,
    cumulativeSeries,
    monthComparison,
  } = derived;

  const sortedPositions = [...performanceHoldings.positions].sort((a, b) => b.weightPct - a.weightPct);
  const themeTotals = new Map<string, number>();
  for (const p of sortedPositions) {
    themeTotals.set(p.theme, (themeTotals.get(p.theme) ?? 0) + p.weightPct);
  }
  const themes = [...themeTotals.entries()].sort((a, b) => b[1] - a[1]);
  const maxThemeWeight = Math.max(...themes.map(([, w]) => w), 1);
  const flaggedTickers = sortedPositions.filter(isFlaggedConcentration);

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div
            style={{
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${ACCENT}30 15%, ${ACCENT}60 50%, ${ACCENT}30 85%, transparent 100%)`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Process
            </p>
            <h1
              className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
              style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
            >
              Performance
            </h1>
            <p className="mt-2 max-w-xl font-mono text-[10px] leading-[1.5] text-[#5a6e82]">
              Since inception {fmtMonthDate(inceptionDate)} · {n} monthly observations through{" "}
              {fmtMonthDate(asOfDate)}.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
              <Stat
                label="Portfolio (TWR)"
                value={fmtSignedPct(cumulativeTWRPct)}
                color={toneColor(cumulativeTWRPct)}
                sub="Cumulative, time-weighted, since inception"
              />
              <Stat
                label="VOO (Total Return)"
                value={fmtSignedPct(benchmarkFullWindow.totalReturnProxyPct)}
                color={NAVY}
                sub="Price return + assumed dividend yield"
              />
              <Stat
                label="Spread vs. VOO"
                value={fmtSignedPts(alphaFullWindowPts)}
                color={toneColor(alphaFullWindowPts)}
                sub="Portfolio TWR minus benchmark total return"
              />
            </div>
          </div>
        </section>

        {/* ── Equity curve ────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <SectionLabel>Cumulative Growth vs. Benchmark</SectionLabel>
            <div className="rounded-2xl p-6 sm:p-8" style={CARD_STYLE}>
              <p className="mb-6 font-mono text-[10px] text-[#5a6e82]">
                Both series indexed to 100 at inception ({fmtMonthDate(inceptionDate)}). The shaded band
                marks the account&apos;s drawdown window.
              </p>
              <PerformanceEquityCurve
                series={cumulativeSeries}
                drawdownPeakDate={drawdown.peakDate}
                drawdownTroughDate={drawdown.troughDate}
              />
            </div>
          </div>
        </section>

        {/* ── Monthly returns ─────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <SectionLabel>Monthly Returns</SectionLabel>
            <div className="rounded-2xl p-6 sm:p-8" style={CARD_STYLE}>
              <p className="mb-6 font-mono text-[10px] text-[#5a6e82]">
                Every month shown, including the down months — {worstMonth ? fmtMonthDate(worstMonth.date) : ""}{" "}
                is not omitted.
              </p>
              <PerformanceMonthlyBars rows={monthComparison} />
            </div>
          </div>
        </section>

        {/* ── Risk panel ──────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <SectionLabel>Risk</SectionLabel>

            <div className="rounded-2xl p-8" style={CARD_STYLE}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <Stat
                  label="Annualized Volatility"
                  value={`${annualizedVolPct.toFixed(2)}%`}
                  sub="Sample std. dev. of monthly returns × √12"
                />
                <Stat
                  label="Max Drawdown"
                  value={fmtSignedPct(drawdown.maxDrawdownPct, 2)}
                  color={NEGATIVE}
                  sub={`${fmtMonthDate(drawdown.peakDate)} peak → ${fmtMonthDate(drawdown.troughDate)} trough`}
                />
              </div>

              <div className="mt-10 h-px" style={{ background: "rgba(15,30,53,0.07)" }} />

              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
                <Stat
                  size="md"
                  label="Best Month"
                  value={fmtSignedPct(bestMonth.returnPct, 2)}
                  color={POSITIVE}
                  sub={fmtMonthDate(bestMonth.date)}
                />
                <Stat
                  size="md"
                  label="Worst Month"
                  value={fmtSignedPct(worstMonth.returnPct, 2)}
                  color={NEGATIVE}
                  sub={fmtMonthDate(worstMonth.date)}
                />
                <Stat size="md" label="Hit Rate" value={hitRateFraction} sub="Positive months / total" />
              </div>

              <div className="mt-10 h-px" style={{ background: "rgba(15,30,53,0.07)" }} />

              {/* Sortino / Sharpe — deliberately subordinate: small text, never a
                  headline stat card, always shown with n and (for Sharpe) a 95% CI. */}
              <div className="mt-8 space-y-2 rounded-xl p-5" style={{ background: "rgba(15,30,53,0.02)" }}>
                <p className="font-mono text-[11px] text-[#3d4f66]">
                  Sortino {sortino.sortinoAnnualized.toFixed(2)} (n={sortino.n})
                </p>
                <p className="font-mono text-[11px] text-[#3d4f66]">
                  Sharpe {sharpe.sharpeAnnualized.toFixed(2)} (n={sharpe.n}, 95% CI {sharpe.ciLow.toFixed(1)} to{" "}
                  {sharpe.ciHigh.toFixed(1)})
                </p>
                <p className="mt-2 font-mono text-[9px] leading-[1.6] text-[#7a8799]">
                  Risk-adjusted ratios need roughly 30 monthly observations before the point estimate
                  stabilizes. At n={sharpe.n}, these are directional at best — shown with their interval
                  rather than emphasized.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Current book ────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <SectionLabel>Current Book</SectionLabel>
            <p className="mb-8 font-mono text-[10px] leading-[1.6] text-[#5a6e82]">
              As of {fmtMonthDate(performanceHoldings.asOf)}. {performanceHoldings.asOfNote}
            </p>

            {flaggedTickers.length > 0 && (
              <div
                className="mb-6 rounded-xl px-5 py-4"
                style={{ background: "rgba(139,26,26,0.05)", border: "1px solid rgba(139,26,26,0.15)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: NEGATIVE }}>
                  Above {CONCENTRATION_CAP_PCT.toFixed(0)}% single-name cap
                </p>
                <p className="mt-1 font-mono text-[11px] text-[#3d4f66]">
                  {flaggedTickers.map((p) => `${p.ticker} (${p.weightPct.toFixed(1)}%)`).join(", ")}
                </p>
              </div>
            )}

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* Positions table */}
              <div className="overflow-x-auto rounded-2xl" style={CARD_STYLE}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f8f4ee", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
                      <th className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                        Ticker
                      </th>
                      <th className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                        Theme
                      </th>
                      <th className="px-5 py-3.5 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                        Weight
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPositions.map((p, i) => {
                      const flagged = isFlaggedConcentration(p);
                      return (
                        <tr
                          key={p.ticker}
                          style={
                            i === sortedPositions.length - 1
                              ? undefined
                              : { borderBottom: "1px solid rgba(15,30,53,0.05)" }
                          }
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {p.researchUrl ? (
                                <Link
                                  href={p.researchUrl}
                                  className="inline-block font-mono text-[12px] font-bold transition-opacity hover:opacity-70"
                                  style={{
                                    color: ACCENT,
                                    backgroundColor: "rgba(26,74,46,0.08)",
                                    padding: "4px 10px",
                                    borderRadius: "5px",
                                  }}
                                >
                                  {p.ticker}
                                </Link>
                              ) : (
                                <span
                                  className="inline-block font-mono text-[12px] font-bold"
                                  style={{
                                    color: ACCENT,
                                    backgroundColor: "rgba(26,74,46,0.08)",
                                    padding: "4px 10px",
                                    borderRadius: "5px",
                                  }}
                                >
                                  {p.ticker}
                                </span>
                              )}
                              {flagged && (
                                <span
                                  className="font-mono text-[8px] uppercase tracking-[0.1em]"
                                  style={{ color: NEGATIVE }}
                                >
                                  &gt;{CONCENTRATION_CAP_PCT.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-[#5a6e82]">{p.theme}</td>
                          <td className="px-5 py-3.5 text-right font-mono text-[12px] font-semibold tabular-nums text-[#0f1e35]">
                            {p.weightPct.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Theme breakdown */}
              <div className="rounded-2xl p-6" style={CARD_STYLE}>
                <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#7a8799]">
                  By Theme
                </p>
                <div className="space-y-3">
                  {themes.map(([theme, weight]) => (
                    <div key={theme}>
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className="font-mono text-[10px] text-[#3d4f66]">{theme}</span>
                        <span className="font-mono text-[10px] tabular-nums text-[#7a8799]">
                          {weight.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(15,30,53,0.06)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(weight / maxThemeWeight) * 100}%`, background: ACCENT }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Methodology and disclosure ──────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16 lg:px-12">
            <SectionLabel>Methodology &amp; Disclosure</SectionLabel>
            <div className="space-y-5 text-[13.5px] leading-[1.85] text-[#3d4f66]">
              <p>
                Returns are time-weighted (linked monthly Modified Dietz), which removes the effect of
                deposits and the broker contribution match so the figure reflects investment performance
                rather than how much was added. Performance inception is August 1, 2025; the account was
                funded in July 2025 through a transfer from a prior custodian plus contributions. Figures
                cover {n} monthly observations through {fmtMonthDate(asOfDate)}.
              </p>
              <p>
                The benchmark is the Vanguard S&amp;P 500 ETF (VOO). Portfolio returns are total return
                with dividends reinvested. The benchmark is shown as price return with an approximate
                dividend adjustment of about 1.2% per year, so the comparison is close to but not exactly
                like for like. Risk-free rate is assumed at 4.0% for ratio calculations.
              </p>
              <p>
                Risk-adjusted ratios (Sharpe, Sortino) are shown with sample size and a 95% confidence
                interval because an {n}-month history is too short for a stable point estimate. They will
                become more meaningful as the record lengthens.
              </p>
              <p>
                This page is a personal investment track record maintained for transparency. It is not
                investment advice and not a solicitation. Past performance does not predict future
                results.
              </p>
              <p className="font-mono text-[10px] leading-[1.6] text-[#7a8799]">
                Annualized-equivalent (partial-year extrapolation): {fmtSignedPct(annualizedEquivalentPct)}.
                {alphaThroughPriorMonthPts !== undefined && priorMonthDate && (
                  <>
                    {" "}Alpha vs. VOO through {fmtMonthDate(priorMonthDate)} (fully statement-verified,
                    excluding the current month&apos;s approximate benchmark quote):{" "}
                    {fmtSignedPts(alphaThroughPriorMonthPts)}.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <p className="font-mono text-[10px] text-[#5a6e82]">
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
