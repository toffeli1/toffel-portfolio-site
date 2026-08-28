import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolios, getPortfolio } from "@/data/portfolios";
import { holdings } from "@/data/holdings";
import { etfProfiles } from "@/data/etfConstituents";
import { PORTFOLIO_UPDATED_AT, fmtPortfolioDate } from "@/lib/config";
import SleeveDashboard from "@/components/SleeveDashboard";
import InvestmentSection from "@/components/InvestmentSection";
import { portfolioState, activePositionCount } from "@/data/portfolioState";
import Eyebrow from "@/components/Eyebrow";
import { INK, MUTED, BODY, HAIRLINE, ACCENT, SECTION_Y } from "@/lib/theme";

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
    <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:opacity-70"
            style={{ color: MUTED }}
          >
            ← Overview
          </Link>
          <p className="font-mono text-[10px]" style={{ color: MUTED }}>
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
  const fund2027 = holdings.filter((h) => h.sleeve === "2027 Roth Fund");
  const fund2028 = holdings.filter((h) => h.sleeve === "2028 Roth Fund");

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <main>
        {/* Header */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-7xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-3">Taxable Account</Eyebrow>
            <h1
              className="font-display font-semibold leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2.25rem,4vw,3.5rem)", color: INK }}
            >
              Individual Brokerage
            </h1>
            <p className="mt-3 max-w-xl font-mono text-[10px] leading-[1.5]" style={{ color: MUTED }}>
              Weights and returns are sleeve-scoped. As of {fmtPortfolioDate(PORTFOLIO_UPDATED_AT)}.
            </p>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.7]" style={{ color: BODY }}>
              Taxable brokerage account organized into funding sleeves used to
              build future Roth IRA contributions.
            </p>
          </div>
        </section>

        {/* 2027 Roth Fund — visual sleeve dashboard */}
        {fund2027.length > 0 && (
          <section>
            <div className={`mx-auto max-w-7xl px-6 ${SECTION_Y} lg:px-12`}>
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
            <div className={`mx-auto max-w-7xl px-6 ${SECTION_Y} lg:px-12`}>
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
  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <main>
        {/* Header */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-7xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-3">Account View</Eyebrow>
            <div className="flex items-end justify-between gap-8">
              <div className="min-w-0">
                <h1
                  className="font-display font-semibold leading-[0.95] tracking-tight"
                  style={{ fontSize: "clamp(2.25rem,4vw,3.5rem)", color: INK }}
                >
                  Investments
                </h1>
                <p className="mt-3 max-w-xl font-mono text-[10px] leading-[1.5]" style={{ color: MUTED }}>
                  Manually maintained snapshot of portfolio weights and returns, with no live pricing. As of {fmtPortfolioDate(portfolioState.asOf)}.
                </p>
                <p className="mt-4 max-w-lg text-[14px] leading-[1.7]" style={{ color: BODY }}>
                  Long-Term Compounding
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="font-mono font-semibold leading-none tracking-tight"
                  style={{ color: ACCENT, fontSize: "clamp(3rem,5vw,4.25rem)" }}
                >
                  {activePositionCount}
                </p>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
                  positions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Holdings, weighting, and returns — percentage-only snapshot from
            data/toffel_investments_public.json. No dollar amounts, ever.
            Performance KPIs live on /performance. */}
        <InvestmentSection />
      </main>

      <SleeveFooter />
    </div>
  );
}
