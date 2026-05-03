import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolios, getPortfolio } from "@/data/portfolios";
import { holdings } from "@/data/holdings";
import { rothIraHoldings, etfsSleeveHoldings } from "@/data/sleeveHoldings";
import { etfProfiles } from "@/data/etfConstituents";
import { QuotesProvider } from "@/components/QuotesProvider";
import { LiveReturnBadge } from "@/components/LiveReturnBadge";
import HoldingsTable from "@/components/HoldingsTable";
import SleeveHoldingsTable from "@/components/SleeveHoldingsTable";
import BreakdownPanel from "@/components/BreakdownPanel";
import { BenchmarkComparisonWrapper } from "@/components/BenchmarkComparisonWrapper";
import { RetirementCalculatorWrapper } from "@/components/RetirementCalculatorWrapper";
import { getPreviousHoldingsBySleeve } from "@/data/previousHoldings";

export function generateStaticParams() {
  return portfolios.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPortfolio(slug);
  if (!p) return {};
  return { title: `${p.title} — Portfolio` };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portfolio = getPortfolio(slug);
  if (!portfolio) notFound();

  if (portfolio.type === "retail") return <RetailView />;
  if (portfolio.type === "roth-ira") return <RothIraView />;
  if (portfolio.type === "etfs") return <EtfsView />;
  return notFound();
}

// ── Shared nav elements ───────────────────────────────────────────────────────

function OverviewLink() {
  return (
    <Link
      href="/"
      className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
    >
      ← Overview
    </Link>
  );
}

function SleeveFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
          >
            ← Overview
          </Link>
          <p className="font-mono text-[10px] text-[#a8b2bd]">
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Individual Brokerage view ─────────────────────────────────────────────────

function RetailView() {
  const color = "#1a3a5c";
  const etfPct = holdings.filter(h => h.category === "ETFs").reduce((s, h) => s + h.portfolioPct, 0);
  const equityPct = holdings.filter(h => h.category === "Equities").reduce((s, h) => s + h.portfolioPct, 0);

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
          <OverviewLink />
          <span className="hidden font-mono text-[11px] text-[#a8b2bd] sm:block">
            Individual Brokerage
          </span>
        </div>
      </nav>

      <main>
        {/* Header */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div
            style={{
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${color}30 15%, ${color}60 50%, ${color}30 85%, transparent 100%)`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color }}
            >
              Taxable Account&ensp;·&ensp;Active Research
            </p>
            <h1
              className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
              style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
            >
              Individual Brokerage
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.7] text-[#3d4f66]">
              Taxable brokerage account focused on ETF-based market exposure,
              semiconductor cyclicality, Bitcoin exposure, and select high-conviction
              individual equities.
            </p>
            <p className="mt-2 font-mono text-[11px] text-[#7a8799]">
              {holdings.length} active holdings&ensp;·&ensp;ETF-based market exposure&ensp;·&ensp;Select individual equities
            </p>

            {/* Summary pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: `ETFs ${etfPct.toFixed(1)}%` },
                { label: `Equity ${equityPct.toFixed(1)}%` },
                { label: `${holdings.length} holdings` },
              ].map((p) => (
                <span
                  key={p.label}
                  className="rounded px-3 py-1 font-mono text-[10px] text-[#5a6e82]"
                  style={{ border: "1px solid rgba(15,30,53,0.09)" }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Holdings table */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Holdings
            </p>
            <HoldingsTable holdings={holdings} showCategory />
          </div>
        </section>
      </main>

      <SleeveFooter />
    </div>
  );
}

// ── Roth IRA view ─────────────────────────────────────────────────────────────

function RothIraView() {
  const color = "#1a4a2e";

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
          <OverviewLink />
          <span className="hidden font-mono text-[11px] text-[#a8b2bd] sm:block">
            Retirement Account
          </span>
        </div>
      </nav>

      <QuotesProvider>
        <main>
          {/* Header */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div
              style={{
                height: "2px",
                background: `linear-gradient(90deg, transparent 0%, ${color}30 15%, ${color}60 50%, ${color}30 85%, transparent 100%)`,
              }}
            />
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
              <p
                className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color }}
              >
                Account View
              </p>
              <div className="flex items-end justify-between gap-8">
                <div className="min-w-0">
                  <h1
                    className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
                    style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
                  >
                    Retirement Account
                  </h1>
                  <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-[#3d4f66]">
                    Roth IRA · Long-Term Compounding · Tax-Advantaged Growth
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className="font-mono font-bold leading-none tracking-tight"
                    style={{ color, fontSize: "clamp(3.5rem,5.5vw,5rem)" }}
                  >
                    {rothIraHoldings.length}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                    positions
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Holdings table */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Holdings
              </p>
              <SleeveHoldingsTable holdings={rothIraHoldings} sleeve="roth-ira" />
            </div>
          </section>

          {/* Previous Holdings */}
          {getPreviousHoldingsBySleeve("roth-ira").length > 0 && (
            <section
              className="border-b"
              style={{ borderColor: "rgba(15,30,53,0.08)" }}
            >
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Previous Holdings
                </p>
                <p className="mb-10 font-mono text-[10px] text-[#a8b2bd]">
                  Archived positions — research records with full exit analysis.
                </p>
                <div className="divide-y" style={{ borderColor: "rgba(15,30,53,0.07)" }}>
                  {getPreviousHoldingsBySleeve("roth-ira").map((h) => {
                    const [fy, fm, fd] = h.ownedFrom.split("-").map(Number);
                    const [ty, tm, td] = h.ownedTo.split("-").map(Number);
                    const from = new Date(fy, fm - 1, fd).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                    const to = new Date(ty, tm - 1, td).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <Link
                        key={h.ticker}
                        href={`/archive/${h.ticker}`}
                        className="group flex items-center justify-between gap-6 py-5 transition-colors"
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-[15px] font-semibold text-[#0f1e35] transition-colors group-hover:text-[#1a4a2e]">
                            {h.ticker}
                          </span>
                          <span className="hidden text-[13px] text-[#5a6e82] sm:block">
                            {h.company}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-6">
                          <span className="hidden font-mono text-[10px] text-[#a8b2bd] sm:block">
                            {from} → {to}
                          </span>
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: "#8b2530", opacity: 0.7 }}
                          >
                            {h.exitType}
                          </span>
                          <span className="font-mono text-[10px] text-[#a8b2bd] transition-colors group-hover:text-[#0f1e35]">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Breakdown */}
          <section
            className="border-b"
            style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Portfolio Composition
              </p>
              <BreakdownPanel holdings={rothIraHoldings} />
            </div>
          </section>

          {/* Benchmark comparison */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Relative Performance
              </p>
              <p className="mb-8 font-mono text-[10px] text-[#a8b2bd]">
                Normalized price performance vs. VOO and QQQ benchmarks.
              </p>
              <BenchmarkComparisonWrapper
                holdingTickers={rothIraHoldings.map((h) => h.ticker)}
              />
            </div>
          </section>

          {/* Retirement Calculator */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
              <RetirementCalculatorWrapper />
            </div>
          </section>
        </main>
      </QuotesProvider>

      <SleeveFooter />
    </div>
  );
}

// ── ETFs view ─────────────────────────────────────────────────────────────────

function EtfsView() {
  const color = "#8b2530";

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
          <OverviewLink />
          <span className="hidden font-mono text-[11px] text-[#a8b2bd] sm:block">
            ETF Exposure
          </span>
        </div>
      </nav>

      <QuotesProvider>
        <main>
          {/* Header */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div
              style={{
                height: "2px",
                background: `linear-gradient(90deg, transparent 0%, ${color}30 15%, ${color}60 50%, ${color}30 85%, transparent 100%)`,
              }}
            />
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
              <p
                className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color }}
              >
                Exposure View
              </p>
              <div className="flex items-end justify-between gap-8">
                <div>
                  <h1
                    className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
                    style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
                  >
                    ETF Exposure
                  </h1>
                  <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-[#3d4f66]">
                    Index Funds · Thematic ETFs · Portfolio Look-Through
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className="font-mono font-bold leading-none tracking-tight"
                    style={{ color, fontSize: "clamp(3.5rem,5.5vw,5rem)" }}
                  >
                    {etfsSleeveHoldings.length}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                    ETFs
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ETF cards */}
          <section
            className="border-b"
            style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Holdings
              </p>
              <div className="grid gap-5 md:grid-cols-3">
                {etfsSleeveHoldings.map((h) => {
                  const profile = etfProfiles[h.ticker];
                  return (
                    <div
                      key={h.ticker}
                      className="flex flex-col rounded-2xl p-8"
                      style={{
                        background: "#ffffff",
                        border: "1px solid rgba(15,30,53,0.09)",
                        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
                      }}
                    >
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <p
                          className="font-mono text-[9px] uppercase tracking-[0.22em]"
                          style={{ color }}
                        >
                          {h.subcategory}
                        </p>
                        <LiveReturnBadge ticker={h.ticker} sleeve="etfs" />
                      </div>

                      <p className="mt-3 font-mono text-[2rem] font-bold leading-none tracking-tight text-[#0f1e35]">
                        {h.ticker}
                      </p>
                      <p className="mt-1.5 text-[13px] text-[#5a6e82]">{h.company}</p>

                      {/* Portfolio weight */}
                      <div className="mt-4 flex items-center gap-2.5">
                        <div
                          className="flex-1 overflow-hidden rounded-full"
                          style={{ background: "rgba(15,30,53,0.07)", height: 3 }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${h.portfolioWeightPct}%`,
                              backgroundColor: color,
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-[#7a8799]">
                          {h.portfolioWeightPct.toFixed(1)}%
                        </span>
                      </div>

                      {h.thesis && (
                        <p className="mt-4 text-[12px] leading-[1.65] text-[#7a8799]">
                          {h.thesis}
                        </p>
                      )}

                      {profile && (
                        <Link
                          href={`/etfs/${h.ticker}`}
                          className="mt-auto pt-5 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
                        >
                          View Holdings →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ETFs breakdown */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Portfolio Composition
              </p>
              <BreakdownPanel holdings={etfsSleeveHoldings} />
            </div>
          </section>

          {/* 3Y benchmark comparison */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                3Y Relative Performance
              </p>
              <p className="mb-8 font-mono text-[10px] text-[#a8b2bd]">
                Normalized price performance over the last 3 years, with VOO and
                QQQ as benchmarks.
              </p>
              <BenchmarkComparisonWrapper
                holdingTickers={etfsSleeveHoldings.map((h) => h.ticker)}
              />
            </div>
          </section>
        </main>
      </QuotesProvider>

      <SleeveFooter />
    </div>
  );
}
