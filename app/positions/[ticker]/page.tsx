import Link from "next/link";
import { notFound } from "next/navigation";
import { holdings } from "@/data/holdings";
import { rothIraHoldings, etfsSleeveHoldings } from "@/data/sleeveHoldings";
import { positionDetails } from "@/data/positionDetails";
import type { Scenario, TrimEvent } from "@/data/positionDetails";
import { etfProfiles } from "@/data/etfConstituents";
import { PositionQuoteProvider } from "@/components/PositionQuoteProvider";
import { PriceCell, ChangeCell, LastUpdated } from "@/components/QuoteCell";
import { LiveReturnBadge } from "@/components/LiveReturnBadge";
import { ChartWrapper } from "@/components/ChartWrapper";
import { ReturnSinceSection } from "@/components/ReturnSinceSection";
import { positionLots, positionAverageCost } from "@/lib/positionLots";

// ── Types ────────────────────────────────────────────────────────────────────

interface SleeveOwnership {
  slug: string;
  title: string;
  color: string;
  weightPct: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildSleeveOwnerships(ticker: string): SleeveOwnership[] {
  const result: SleeveOwnership[] = [];

  const retail = holdings.find((h) => h.ticker === ticker);
  if (retail) {
    result.push({
      slug: "retail-with-friends",
      title: "Speculative Individual Stocks",
      color: "#1a3a5c",
      weightPct: retail.portfolioPct,
    });
  }

  const roth = rothIraHoldings.find((h) => h.ticker === ticker);
  if (roth) {
    result.push({
      slug: "roth-ira",
      title: "Roth IRA",
      color: "#1a4a2e",
      weightPct: roth.portfolioWeightPct,
    });
  }

  const etfSleeve = etfsSleeveHoldings.find((h) => h.ticker === ticker);
  if (etfSleeve) {
    result.push({
      slug: "etfs",
      title: "ETFs",
      color: "#8b2530",
      weightPct: etfSleeve.portfolioWeightPct,
    });
  }

  return result;
}

// ── Static generation ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  const retailTickers = holdings.map((h) => h.ticker);

  // Roth IRA tickers that don't have their own ETF detail page (/etfs/ route).
  const rothTickers = rothIraHoldings
    .filter((h) => !(h.ticker in etfProfiles))
    .map((h) => h.ticker);

  const unique = [...new Set([...retailTickers, ...rothTickers])];
  return unique.map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const retail = holdings.find((h) => h.ticker === ticker);
  const sleeve = rothIraHoldings.find((h) => h.ticker === ticker)
    ?? etfsSleeveHoldings.find((h) => h.ticker === ticker);
  const company = retail?.company ?? sleeve?.company;
  if (!company) return {};
  return { title: `${ticker} — ${company}` };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PositionPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;

  // Gather data from all sources.
  const retailHolding = holdings.find((h) => h.ticker === ticker);
  const rothHolding = rothIraHoldings.find((h) => h.ticker === ticker);
  const etfSleeveHolding = etfsSleeveHoldings.find((h) => h.ticker === ticker);
  const sleeveHolding = rothHolding ?? etfSleeveHolding;

  if (!retailHolding && !sleeveHolding) notFound();

  const detail = positionDetails[ticker];
  const sleeveOwnerships = buildSleeveOwnerships(ticker);

  // Unified metadata — prefer sleeve data for structured fields.
  const company = retailHolding?.company ?? sleeveHolding!.company;
  const thesis = retailHolding?.thesis ?? sleeveHolding?.thesis;
  const subcategory = sleeveHolding?.subcategory ?? retailHolding?.subcategory;
  const country = sleeveHolding?.country;
  const marketCap = sleeveHolding?.marketCap;
  const assetType = sleeveHolding?.assetType;

  // Primary sleeve (first ownership) drives back navigation and accent color.
  const primarySleeve = sleeveOwnerships[0];
  const accentColor = primarySleeve?.color ?? "#1a3a5c";

  // Chart ticker override.
  const chartTicker = detail?.chartSymbol ?? ticker;

  // Purchase lots take priority over the legacy single entry marker.
  const lots = positionLots[ticker];
  const avgCost = positionAverageCost[ticker];

  // Entry marker: only used when no per-lot data is available.
  const entryPrice =
    retailHolding?.purchase?.costBasis ?? sleeveHolding?.estimatedEntryPrice;
  const hasConfirmedDate = !!(
    retailHolding?.confirmedPurchaseDate ?? sleeveHolding?.confirmedPurchaseDate
  );
  const entryMarker = !lots && entryPrice
    ? ({ price: entryPrice, source: hasConfirmedDate ? "confirmed" : "estimated" } as const)
    : undefined;

  return (
    <div className="min-h-screen bg-[#faf7f2]">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(250,247,242,0.94)",
          borderBottom: "1px solid rgba(15,30,53,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <Link
            href={primarySleeve ? `/portfolio/${primarySleeve.slug}` : "/"}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
          >
            ← {primarySleeve?.title ?? "Overview"}
          </Link>
          <span className="hidden font-mono text-[11px] text-[#a8b2bd] sm:block">
            {ticker}&ensp;·&ensp;{company}
          </span>
        </div>
      </nav>

      <PositionQuoteProvider ticker={ticker}>
        <main>

          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <section
            className="relative overflow-hidden border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="absolute inset-0 hero-grid" />

            <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">

              {/* Overline badges */}
              <div className="mb-8 flex flex-wrap items-center gap-2">
                {assetType && (
                  <span
                    className="rounded-full font-mono text-[9px] uppercase tracking-[0.2em]"
                    style={{
                      color: accentColor,
                      backgroundColor: `${accentColor}14`,
                      padding: "4px 12px",
                    }}
                  >
                    {assetType}
                  </span>
                )}
                {subcategory && (
                  <span
                    className="rounded px-3 py-1 font-mono text-[9px] text-[#7a8799]"
                    style={{ border: "1px solid rgba(15,30,53,0.1)" }}
                  >
                    {subcategory}
                  </span>
                )}
                {country && (
                  <span
                    className="rounded px-3 py-1 font-mono text-[9px] text-[#7a8799]"
                    style={{ border: "1px solid rgba(15,30,53,0.1)" }}
                  >
                    {country}
                  </span>
                )}
                {marketCap && (
                  <span
                    className="rounded px-3 py-1 font-mono text-[9px] text-[#7a8799]"
                    style={{ border: "1px solid rgba(15,30,53,0.1)" }}
                  >
                    {marketCap}
                  </span>
                )}
              </div>

              {/* Ticker + company + live quote */}
              <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">

                {/* Left: identity */}
                <div>
                  <h1
                    className="font-bold leading-[0.88] tracking-[-0.03em] text-[#0f1e35]"
                    style={{ fontSize: "clamp(4.5rem,10vw,9rem)" }}
                  >
                    {ticker}
                  </h1>
                  <p
                    className="mt-5 font-medium text-[#3d4f66]"
                    style={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)" }}
                  >
                    {company}
                  </p>
                </div>

                {/* Right: live quote + sleeve summary */}
                <div className="flex shrink-0 flex-col gap-4">

                  {/* Live quote card */}
                  <div
                    className="rounded-2xl px-8 py-7"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(15,30,53,0.09)",
                      boxShadow: "0 1px 8px rgba(15,30,53,0.05)",
                    }}
                  >
                    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#a8b2bd]">
                      Live Quote
                    </p>
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[2rem] font-bold leading-none text-[#0f1e35]">
                        <PriceCell ticker={ticker} />
                      </span>
                      <ChangeCell ticker={ticker} />
                    </div>
                    {avgCost && (
                      <div
                        className="mt-4 pt-4"
                        style={{ borderTop: "1px solid rgba(15,30,53,0.07)" }}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8b2bd]">
                              Avg Cost
                            </p>
                            <p className="font-mono text-sm font-medium text-[#0f1e35]">
                              ${avgCost.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8b2bd]">
                              Total Return
                            </p>
                            <LiveReturnBadge ticker={ticker} avgCost={avgCost} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: "1px solid rgba(15,30,53,0.07)" }}
                    >
                      <LastUpdated />
                    </div>
                  </div>

                  {/* In Your Sleeves */}
                  {sleeveOwnerships.length > 0 && (
                    <div
                      className="rounded-2xl px-8 py-6"
                      style={{
                        background: "#ffffff",
                        border: "1px solid rgba(15,30,53,0.09)",
                        boxShadow: "0 1px 8px rgba(15,30,53,0.05)",
                      }}
                    >
                      <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-[#a8b2bd]">
                        In Your Sleeves
                      </p>
                      <div className="space-y-3">
                        {sleeveOwnerships.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/portfolio/${s.slug}`}
                            className="flex items-center justify-between gap-8 group"
                          >
                            <span
                              className="font-mono text-[10px] uppercase tracking-[0.15em] transition-colors group-hover:opacity-70"
                              style={{ color: s.color }}
                            >
                              {s.title}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-[11px] tabular-nums text-[#3d4f66]">
                                {s.weightPct.toFixed(1)}%
                              </span>
                              <LiveReturnBadge ticker={ticker} sleeve={s.slug} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </section>

          {/* ── Chart ─────────────────────────────────────────────────────── */}
          <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
              <ChartWrapper ticker={chartTicker} entryMarker={entryMarker} purchaseLots={lots} averageCost={avgCost} />
            </div>
          </section>

          {/* ── Return Since Purchase ─────────────────────────────────────── */}
          {retailHolding?.purchase && (
            <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
              <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
                <ReturnSinceSection
                  ticker={ticker}
                  purchase={retailHolding.purchase}
                />
              </div>
            </section>
          )}

          {/* ── Position Changes ──────────────────────────────────────────── */}
          {detail?.trimEvents && detail.trimEvents.length > 0 && (
            <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Position Changes
                </p>
                <div className="space-y-5">
                  {detail.trimEvents.map((event, i) => (
                    <TrimEventCard key={i} event={event} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Why I Own It ──────────────────────────────────────────────── */}
          {(detail?.whyIOwnIt || detail?.whyThisSleeve) && (
            <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Why I Own It
                </p>
                {detail.whyIOwnIt && (
                  <p className="max-w-2xl text-[15px] leading-[1.85] text-[#2d3d52]">
                    {detail.whyIOwnIt}
                  </p>
                )}
                {detail.whyThisSleeve && (
                  <div className="mt-8">
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                      Why This Sleeve
                    </p>
                    <p className="max-w-2xl text-[14px] leading-[1.8] text-[#5a6e82]">
                      {detail.whyThisSleeve}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Investment Thesis ─────────────────────────────────────────── */}
          {(thesis || detail?.longDescription) && (
            <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Investment Thesis
                </p>
                <p className="max-w-2xl text-[15px] leading-[1.85] text-[#2d3d52]">
                  {detail?.longDescription ?? thesis}
                </p>
                {detail?.thesisP2 && (
                  <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[#2d3d52]">
                    {detail.thesisP2}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ── Scenario Analysis ─────────────────────────────────────────── */}
          {(detail?.bullCase || detail?.baseCase || detail?.bearCase) && (
            <section
              className="border-b"
              style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
            >
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Scenario Analysis
                </p>
                <div className="grid gap-5 md:grid-cols-3">
                  {detail.bullCase && (
                    <ScenarioCard type="bull" scenario={detail.bullCase} />
                  )}
                  {detail.baseCase && (
                    <ScenarioCard type="base" scenario={detail.baseCase} />
                  )}
                  {detail.bearCase && (
                    <ScenarioCard type="bear" scenario={detail.bearCase} />
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── Key Risks ─────────────────────────────────────────────────── */}
          {detail?.risks && detail.risks.length > 0 && (
            <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Key Risks
                </p>
                <ol className="max-w-2xl space-y-5">
                  {detail.risks.map((risk, i) => (
                    <li key={i} className="flex gap-5">
                      <span
                        className="mt-0.5 shrink-0 font-mono text-[10px] tabular-nums"
                        style={{ color: "#a8b2bd" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[13px] leading-[1.75] text-[#3d4f66]">
                        {risk}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* ── What I'm Watching ────────────────────────────────────────── */}
          {detail?.watchList && detail.watchList.length > 0 && (
            <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  What I&apos;m Watching
                </p>
                <ul className="max-w-2xl space-y-4">
                  {detail.watchList.map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: accentColor, opacity: 0.5 }}
                      />
                      <p className="text-[13px] leading-[1.75] text-[#3d4f66]">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

        </main>
      </PositionQuoteProvider>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex items-center justify-between">
            <Link
              href={primarySleeve ? `/portfolio/${primarySleeve.slug}` : "/"}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
            >
              ← {primarySleeve?.title ?? "Overview"}
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDetailDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Trim event card ────────────────────────────────────────────────────────────

const EVENT_TYPE_LABEL: Record<TrimEvent["type"], string> = {
  partial_trim:      "Partial trim",
  add:               "Add",
  recurring_add:     "Recurring",
  pending_stop_loss: "Pending stop-loss",
};

function TrimEventCard({ event }: { event: TrimEvent }) {
  return (
    <div
      className="max-w-2xl rounded-2xl p-7"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-8">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
            {formatDetailDate(event.date)}
          </p>
          {event.pricePerShare !== undefined && (
            <p className="font-mono text-[13px] font-semibold text-[#0f1e35]">
              ${event.pricePerShare.toFixed(2)}/sh
            </p>
          )}
        </div>
        <span
          className="shrink-0 rounded font-mono text-[8px] uppercase tracking-[0.18em]"
          style={{
            color: "#5a6e82",
            backgroundColor: "rgba(15,30,53,0.05)",
            padding: "3px 8px",
          }}
        >
          {EVENT_TYPE_LABEL[event.type]}
        </span>
      </div>
      <p className="text-[13px] leading-[1.85] text-[#3d4f66]">
        {event.explanation}
      </p>
      {event.inferred && (
        <p className="mt-4 font-mono text-[9px] text-[#b0bac5]">
          Inferred from transaction history. Not a stated investment decision.
        </p>
      )}
    </div>
  );
}

// ── Scenario card ──────────────────────────────────────────────────────────────

const SCENARIO_META = {
  bull: { label: "Bull Case", color: "#1a4a2e", border: "rgba(26,74,46,0.2)" },
  base: { label: "Base Case", color: "#1a3a5c", border: "rgba(26,58,92,0.2)" },
  bear: { label: "Bear Case", color: "#8b2530", border: "rgba(139,37,48,0.2)" },
} as const;

function ScenarioCard({
  type,
  scenario,
}: {
  type: keyof typeof SCENARIO_META;
  scenario: Scenario;
}) {
  const meta = SCENARIO_META[type];

  return (
    <div
      className="flex flex-col rounded-2xl p-7"
      style={{
        background: "#ffffff",
        border: `1px solid ${meta.border}`,
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <p
        className="mb-4 font-mono text-[9px] uppercase tracking-[0.3em]"
        style={{ color: meta.color }}
      >
        {meta.label}
      </p>

      <h3 className="mb-3 text-[16px] font-semibold leading-tight text-[#0f1e35]">
        {scenario.title}
      </h3>

      <p className="mb-6 text-[12px] leading-[1.75] text-[#5a6e82]">
        {scenario.summary}
      </p>

      {scenario.assumptions.length > 0 && (
        <ul className="mt-auto space-y-3">
          {scenario.assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-[6px] h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color, opacity: 0.6 }}
              />
              <p className="text-[11px] leading-[1.65] text-[#5a6e82]">{a}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
