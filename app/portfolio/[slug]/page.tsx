import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolios, getPortfolio } from "@/data/portfolios";
import { holdings, type Holding } from "@/data/holdings";
import { rothIraHoldings } from "@/data/sleeveHoldings";
import { getSleeveThesis } from "@/data/sleeveTheses";
import { PORTFOLIO_UPDATED_AT, fmtPortfolioDate } from "@/lib/config";
import { QuotesProvider } from "@/components/QuotesProvider";
import TickerLogo from "@/components/TickerLogo";
import SleeveDashboard from "@/components/SleeveDashboard";
import SleeveHoldingsTable from "@/components/SleeveHoldingsTable";
import BreakdownPanel from "@/components/BreakdownPanel";
import { BenchmarkComparisonWrapper } from "@/components/BenchmarkComparisonWrapper";
import { RetirementCalculatorWrapper } from "@/components/RetirementCalculatorWrapper";
import { getPreviousHoldingsBySleeve } from "@/data/previousHoldings";
import RothThemeChart from "@/components/RothThemeChart";

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
  return {
    title: p.title,
    description: p.description,
  };
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
  return notFound();
}

// ── Shared nav elements ───────────────────────────────────────────────────────

function SleeveFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5a6e82] transition-colors hover:text-[#0f1e35]"
          >
            ← Overview
          </Link>
          <p className="font-mono text-[10px] text-[#5a6e82]">
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
  const fund2027 = holdings.filter((h) => h.sleeve === "2027 Roth Fund");
  const fund2028 = holdings.filter((h) => h.sleeve === "2028 Roth Fund");

  return (
    <div className="min-h-screen bg-[#faf7f2]">
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
              Taxable Account
            </p>
            <h1
              className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
              style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
            >
              Individual Brokerage
            </h1>
            <p className="mt-2 max-w-xl font-mono text-[10px] leading-[1.5] text-[#5a6e82]">
              Weights and returns are sleeve-scoped. As of {fmtPortfolioDate(PORTFOLIO_UPDATED_AT)}.
            </p>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.7] text-[#3d4f66]">
              Taxable brokerage account organized into funding sleeves used to
              build future Roth IRA contributions.
            </p>
          </div>
        </section>

        {/* 2027 Roth Fund box */}
        {fund2027.length > 0 && (
          <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
              <FundBox
                title="2027 Roth Fund"
                subtitle="Taxable brokerage sleeve used for future Roth funding"
                holdings={fund2027}
              />
            </div>
          </section>
        )}

        {/* 2028 Roth Fund — visual sleeve dashboard */}
        {fund2028.length > 0 && (
          <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <SleeveDashboard
                label="Sleeve View"
                title="2028 Roth Fund"
                subtitle="Growth-focused sleeve with high-conviction ideas and long-term potential."
                holdings={fund2028.map((h) => ({
                  ticker: h.ticker,
                  name: h.company,
                  href: `/positions/${h.ticker}`,
                  portfolioWeightPct: h.portfolioPct,
                }))}
              />
            </div>
          </section>
        )}
      </main>

      <SleeveFooter />
    </div>
  );
}

// ── 2027 Roth Fund box ────────────────────────────────────────────────────────
// Public-safe holdings card. Renders only ticker, name, shares, weight, return,
// and purchase date. Never renders averageCost, dollar values, or market value.

function fmtPurchaseDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FundBox({
  title,
  subtitle,
  holdings,
}: {
  title: string;
  subtitle: string;
  holdings: Holding[];
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      {/* Box header */}
      <div
        className="px-7 py-6"
        style={{ borderBottom: "1px solid rgba(15,30,53,0.07)" }}
      >
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
          Funding sleeve
        </p>
        <h2 className="text-[22px] font-bold leading-none tracking-tight text-[#0f1e35]">
          {title}
        </h2>
        <p className="mt-2 text-[12.5px] text-[#5a6e82]">{subtitle}</p>
      </div>

      {/* Holdings table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr style={{ background: "#f8f4ee", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
              <th className="px-5 py-3 text-left font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a8799]">Ticker</th>
              <th className="px-5 py-3 text-left font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a8799]">Name</th>
              <th className="px-5 py-3 text-right font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a8799]">Weight</th>
              <th className="px-5 py-3 text-right font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a8799]">Total Return</th>
              <th className="px-5 py-3 text-right font-mono text-[9px] uppercase tracking-[0.18em] text-[#7a8799]">Purchased</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => {
              const isLast = i === holdings.length - 1;
              const isPos = h.returnPct >= 0;
              return (
                <tr
                  key={h.sourceKey}
                  style={
                    isLast
                      ? undefined
                      : { borderBottom: "1px solid rgba(15,30,53,0.05)" }
                  }
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <TickerLogo ticker={h.ticker} name={h.company} size="sm" />
                      <Link
                        href={`/positions/${h.ticker}`}
                        className="font-mono text-[12px] font-bold hover:underline"
                        style={{ color: "#1a3a5c" }}
                      >
                        {h.ticker}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[13px] text-[#2d3d52]">{h.company}</p>
                    {(() => {
                      const t = getSleeveThesis(h.sourceKey);
                      return t?.roleInPortfolio ? (
                        <p className="mt-0.5 text-[10.5px] leading-[1.5] text-[#7a8799]">
                          {t.roleInPortfolio}
                        </p>
                      ) : null;
                    })()}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-[12px] tabular-nums text-[#3d4f66]">
                    {h.portfolioPct.toFixed(2)}%
                  </td>
                  <td
                    className="px-5 py-4 text-right font-mono text-[12px] font-semibold tabular-nums"
                    style={{ color: isPos ? "#1a4a2e" : "#8b2530" }}
                  >
                    {isPos ? "+" : ""}{h.returnPct.toFixed(2)}%
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-[11px] text-[#5a6e82]">
                    {fmtPurchaseDate(h.purchaseDate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Roth IRA view ─────────────────────────────────────────────────────────────

function RothIraView() {
  const color = "#1a4a2e";

  return (
    <div className="min-h-screen bg-[#faf7f2]">
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
                    Roth Retirement Account
                  </h1>
                  <p className="mt-2 max-w-xl font-mono text-[10px] leading-[1.5] text-[#5a6e82]">
                    Weights use manually recorded share counts and delayed market prices when available, with fallback weights when pricing is unavailable. As of {fmtPortfolioDate(PORTFOLIO_UPDATED_AT)}.
                  </p>
                  <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-[#3d4f66]">
                    Roth IRA · Long-Term Compounding · Tax-Advantaged Growth
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className="font-mono font-bold leading-none tracking-tight"
                    style={{ color, fontSize: "clamp(3.5rem,5.5vw,5rem)" }}
                  >
                    {rothIraHoldings.filter((h) => h.portfolioWeightPct > 0).length}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#5a6e82]">
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
                <p className="mb-10 font-mono text-[10px] text-[#5a6e82]">
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
                          <span className="hidden font-mono text-[10px] text-[#5a6e82] sm:block">
                            {from} → {to}
                          </span>
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: "#8b2530", opacity: 0.7 }}
                          >
                            {h.exitType}
                          </span>
                          <span className="font-mono text-[10px] text-[#5a6e82] transition-colors group-hover:text-[#0f1e35]">
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

          {/* Theme composition + Breakdown */}
          <section
            className="border-b"
            style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Account Themes
              </p>
              <RothThemeChart holdings={rothIraHoldings} />
              <div className="mt-16">
                <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Portfolio Composition
                </p>
                <BreakdownPanel holdings={rothIraHoldings} />
              </div>
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
              <p className="mb-8 font-mono text-[10px] text-[#5a6e82]">
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

