import Link from "next/link";
import { notFound } from "next/navigation";
import TickerLogo from "@/components/TickerLogo";
import MetricChart from "@/components/MetricChart";
import ValuationPanel from "@/components/ValuationPanel";
import { getCompany } from "@/data/companies";
import { weightFor } from "@/data/portfolioState";
import { getThesis } from "@/data/thesis";
import { thesisTickers } from "@/lib/routes";
import { fmtPortfolioDate } from "@/lib/config";
import { portfolioState } from "@/data/portfolioState";

// ─── Company thesis page ──────────────────────────────────────────────────────
// The single canonical research route. Investments and the Decision Log both
// link here through lib/routes.ts, so there is one page per company rather than
// the old /positions | /etfs | /archive split.
//
// Renders: logo, name, ticker, current portfolio weight, optional headline, the
// written analysis, the company's own chart plan, and relative valuation.
//
// Deliberately absent: prices of any kind, share counts, cost basis, position
// return, and Core/Satellite/Speculative-style sizing labels. The header shows
// portfolio weight and nothing else numeric about the position.

const ACCENT = "#1a4a2e";
const INK = "#0f1e35";
const BODY = "#2d3d52";
const MUTED = "#5a6e82";
const FAINT = "#7a8799";

export function generateStaticParams() {
  return thesisTickers().map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const t = ticker.toUpperCase();
  const company = getCompany(t);
  const thesis = getThesis(t);
  if (!company || !thesis) return {};
  const kind = thesis.historical ? "Historical position" : "Investment thesis";
  return {
    title: `${company.name} (${t}): ${kind}`,
    description:
      thesis.headline ??
      thesis.sections[0]?.body[0]?.slice(0, 155) ??
      `${kind} for ${company.name}.`,
  };
}

export default async function ThesisPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const t = ticker.toUpperCase();
  const company = getCompany(t);
  const thesis = getThesis(t);
  if (!company || !thesis) notFound();

  const isActive = company.status === "active";
  const weightPct = isActive ? weightFor(t) : undefined;

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <main>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div
            style={{
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${ACCENT}30 15%, ${ACCENT}60 50%, ${ACCENT}30 85%, transparent 100%)`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span
                className="rounded font-mono text-[9px] uppercase tracking-[0.2em]"
                style={{
                  color: thesis.historical ? "#8b2530" : ACCENT,
                  backgroundColor: thesis.historical ? "rgba(139,37,48,0.08)" : `${ACCENT}14`,
                  padding: "4px 12px",
                }}
              >
                {thesis.historical ? "Historical position" : "Investment thesis"}
              </span>
              <span
                className="rounded px-3 py-1 font-mono text-[9px]"
                style={{ border: "1px solid rgba(15,30,53,0.1)", color: FAINT }}
              >
                {company.kind}
              </span>
              {company.theme && (
                <span
                  className="rounded px-3 py-1 font-mono text-[9px]"
                  style={{ border: "1px solid rgba(15,30,53,0.1)", color: FAINT }}
                >
                  {company.theme}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              {/* Identity */}
              <div className="min-w-0">
                <div className="flex items-center gap-4">
                  <TickerLogo ticker={t} name={company.name} size="lg" />
                  <h1
                    className="font-bold leading-[0.88] tracking-[-0.03em]"
                    style={{ color: INK, fontSize: "clamp(3.2rem,8vw,7rem)" }}
                  >
                    {t}
                  </h1>
                </div>
                <p
                  className="mt-5 font-medium"
                  style={{ color: "#3d4f66", fontSize: "clamp(1.1rem,2.5vw,1.5rem)" }}
                >
                  {company.name}
                </p>
                {thesis.headline && (
                  <p
                    className="mt-5 max-w-2xl text-[15px] leading-[1.75]"
                    style={{ color: BODY }}
                  >
                    {thesis.headline}
                  </p>
                )}
              </div>

              {/* Portfolio weight — the only position-level number on this page. */}
              <div className="shrink-0">
                {weightPct !== undefined ? (
                  <div
                    className="rounded-2xl px-8 py-6"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(15,30,53,0.09)",
                      boxShadow: "0 1px 8px rgba(15,30,53,0.05)",
                    }}
                  >
                    <p
                      className="mb-2 font-mono text-[9px] uppercase tracking-[0.28em]"
                      style={{ color: MUTED }}
                    >
                      Portfolio weight
                    </p>
                    <p
                      className="font-mono font-bold leading-none tracking-tight"
                      style={{ color: ACCENT, fontSize: "clamp(2.2rem,4vw,3rem)" }}
                    >
                      {weightPct.toFixed(2)}%
                    </p>
                    <p className="mt-2 font-mono text-[9px]" style={{ color: FAINT }}>
                      As of {fmtPortfolioDate(portfolioState.asOf)}
                    </p>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl px-8 py-6"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(15,30,53,0.09)",
                      boxShadow: "0 1px 8px rgba(15,30,53,0.05)",
                    }}
                  >
                    <p
                      className="mb-2 font-mono text-[9px] uppercase tracking-[0.28em]"
                      style={{ color: MUTED }}
                    >
                      Portfolio weight
                    </p>
                    <p className="font-mono text-[15px]" style={{ color: FAINT }}>
                      Not currently held
                    </p>
                  </div>
                )}
              </div>
            </div>

            {company.fundMandate && (
              <p className="mt-8 max-w-2xl text-[14px] leading-[1.75]" style={{ color: MUTED }}>
                {company.fundMandate}
              </p>
            )}
          </div>
        </section>

        {/* ── Historical notice ───────────────────────────────────────────── */}
        {thesis.historical && (
          <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-12">
              <p className="max-w-3xl font-mono text-[11px] leading-[1.7]" style={{ color: MUTED }}>
                This position has been exited. The analysis below is kept as a record of
                the reasoning at the time and is not maintained as current research.{" "}
                <Link href="/decision-log" className="underline" style={{ color: ACCENT }}>
                  See the Decision Log
                </Link>{" "}
                for the full decision history.
              </p>
            </div>
          </section>
        )}

        {/* ── Analysis ────────────────────────────────────────────────────── */}
        {/* Placeholder sections (isPlaceholder: true) are dev-only prompts
            awaiting Isaac's answer — never shipped to production. */}
        {thesis.sections
          .filter((section) => !section.isPlaceholder || process.env.NODE_ENV !== "production")
          .map((section, i) => (
            <section
              key={i}
              className="border-b"
              style={{
                borderColor: section.isPlaceholder ? "#c98a4b" : "rgba(15,30,53,0.08)",
                borderStyle: section.isPlaceholder ? "dashed" : "solid",
                background: section.isPlaceholder ? "#fdf1e7" : undefined,
              }}
            >
              <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
                <p
                  className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: section.isPlaceholder ? "#7a4520" : FAINT }}
                >
                  {section.isPlaceholder ? `TODO — ${section.heading}` : section.heading}
                </p>
                <div className="max-w-3xl space-y-5">
                  {section.body.map((para, j) => (
                    <p
                      key={j}
                      className="text-[15px] leading-[1.85]"
                      style={{ color: section.isPlaceholder ? "#7a4520" : BODY }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}

        {/* ── Reported financials ─────────────────────────────────────────── */}
        {thesis.charts.length > 0 && (
          <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: FAINT }}
                >
                  Reported financials
                </p>
                {thesis.dataThrough && (
                  <p className="font-mono text-[9px]" style={{ color: MUTED }}>
                    {thesis.dataThrough}
                  </p>
                )}
              </div>
              {/* Chart set is per company — see CHART_PLAN in data/thesis/index.ts.
                  Metrics that failed the SEC pipeline's trust gates are absent
                  rather than shown stale. */}
              <div className="grid gap-5 sm:grid-cols-2">
                {thesis.charts.map((series, i) => (
                  <MetricChart key={`${series.label}-${i}`} series={series} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Relative valuation + peers ──────────────────────────────────── */}
        <ValuationPanel ticker={t} valuation={thesis.valuation} />

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6">
                <Link
                  href="/portfolio/investments"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:text-[#0f1e35]"
                  style={{ color: MUTED }}
                >
                  ← Investments
                </Link>
                <Link
                  href="/decision-log"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:text-[#0f1e35]"
                  style={{ color: MUTED }}
                >
                  Decision Log
                </Link>
              </div>
              <p className="font-mono text-[10px]" style={{ color: MUTED }}>
                For informational purposes only. Not financial advice.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
