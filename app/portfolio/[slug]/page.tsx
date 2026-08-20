import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolios, getPortfolio } from "@/data/portfolios";
import { holdings } from "@/data/holdings";
import { etfProfiles } from "@/data/etfConstituents";
import { PORTFOLIO_UPDATED_AT, fmtPortfolioDate } from "@/lib/config";
import SleeveDashboard from "@/components/SleeveDashboard";
import InvestmentSection from "@/components/InvestmentSection";
import { investmentPublicData } from "@/data/investmentPerformance";

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
  if (portfolio.type === "investments") return <InvestmentsView />;
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
// Unpublished: no portfolio entry has type "retail" anymore (see
// data/portfolios.ts), so this is unreachable from any route and is not
// included in generateStaticParams. Left in place, unreferenced, per request.

// Archived for now — flip to true to restore the 2028 Roth Fund sleeve section.
const SHOW_2028_SLEEVE = false;

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

        {/* 2027 Roth Fund — visual sleeve dashboard */}
        {fund2027.length > 0 && (
          <section>
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <SleeveDashboard
                label="Sleeve View"
                title="2027 Roth Fund"
                subtitle="Taxable brokerage sleeve used for future Roth funding."
                layout="side-by-side"
                holdings={fund2027.map((h) => ({
                  ticker: h.ticker,
                  name: h.company,
                  href: h.ticker in etfProfiles ? `/etfs/${h.ticker}` : `/positions/${h.ticker}`,
                  portfolioWeightPct: h.portfolioPct,
                }))}
              />
            </div>
          </section>
        )}

        {/* 2028 Roth Fund — visual sleeve dashboard. ARCHIVED via SHOW_2028_SLEEVE. */}
        {SHOW_2028_SLEEVE && fund2028.length > 0 && (
          <section>
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <SleeveDashboard
                label="Sleeve View"
                title="2028 Roth Fund"
                subtitle="Growth-focused sleeve with high-conviction ideas and long-term potential."
                layout="side-by-side"
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

// ── Investments view ───────────────────────────────────────────────────────────

function InvestmentsView() {
  const color = "#1a4a2e";

  return (
    <div className="min-h-screen bg-[#faf7f2]">
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
                  Investments
                </h1>
                <p className="mt-2 max-w-xl font-mono text-[10px] leading-[1.5] text-[#5a6e82]">
                  Manually maintained snapshot of portfolio weights and returns — no live pricing. As of {fmtPortfolioDate(investmentPublicData.as_of)}.
                </p>
                <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-[#3d4f66]">
                  Long-Term Compounding
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="font-mono font-bold leading-none tracking-tight"
                  style={{ color, fontSize: "clamp(3.5rem,5.5vw,5rem)" }}
                >
                  {investmentPublicData.holdings.length}
                </p>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#5a6e82]">
                  positions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Holdings, weighting, and returns — percentage-only snapshot from
            data/toffel_investments_public.json. No dollar amounts, ever.
            Performance KPIs live on /performance. */}
        <InvestmentSection data={investmentPublicData} />
      </main>

      <SleeveFooter />
    </div>
  );
}
