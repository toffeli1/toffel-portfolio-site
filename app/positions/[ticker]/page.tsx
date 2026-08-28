import Link from "next/link";
import { notFound } from "next/navigation";
import { holdings } from "@/data/holdings";
import { rothIraHoldings } from "@/data/sleeveHoldings";
import { positionDetails } from "@/data/positionDetails";
import type { TrimEvent } from "@/data/positionDetails";
import { etfProfiles } from "@/data/etfConstituents";
import { PositionQuoteProvider } from "@/components/PositionQuoteProvider";
import { LiveReturnBadge } from "@/components/LiveReturnBadge";
import { ChartWrapper } from "@/components/ChartWrapper";
import TickerLogo from "@/components/TickerLogo";
import DerivedInvestmentWeight from "@/components/DerivedInvestmentWeight";
import Eyebrow from "@/components/Eyebrow";
import { Tag } from "@/components/Tag";
import { INK, BODY, MUTED, FAINT, HAIRLINE, CARD } from "@/lib/theme";
import {
  getPositionChanges,
  formatPositionChangeDate,
  positionChangeLabel,
  type PositionChangeCard,
} from "@/lib/positionChanges";

// ── Types ────────────────────────────────────────────────────────────────────

interface SleeveOwnership {
  /** URL routing slug — /portfolio/[slug]. */
  slug: string;
  /** Internal cost-basis/sleeve lookup key (getAvgCost, LiveReturnBadge) — distinct
   *  from `slug` and intentionally left as "roth-ira", matching the keys used
   *  throughout lib/costBasis.ts and data/sleeveHoldings.ts. Renaming this would
   *  silently break sleeve-specific cost-basis overrides (e.g. SMH). */
  costKey: string;
  title: string;
  color: string;
  weightPct: number;
  /** False when the sleeve's account page has been unpublished — renders as plain text, not a link. */
  isLive: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildSleeveOwnerships(ticker: string): SleeveOwnership[] {
  const result: SleeveOwnership[] = [];

  // The Individual Brokerage account page is unpublished (see data/portfolios.ts).
  // Still show sleeve membership for context, but not as a link to a 404.
  const retail = holdings.find((h) => h.ticker === ticker);
  if (retail) {
    result.push({
      slug: "retail-with-friends",
      costKey: "retail-with-friends",
      title: retail.sleeve,
      color: "#1a3a5c",
      weightPct: retail.portfolioPct,
      isLive: false,
    });
  }

  const investment = rothIraHoldings.find((h) => h.ticker === ticker);
  if (investment) {
    result.push({
      slug: "investments",
      costKey: "roth-ira",
      title: "Investments",
      color: "#1a4a2e",
      weightPct: investment.portfolioWeightPct,
      isLive: true,
    });
  }

  return result;
}

// ── Static generation ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  const retailTickers = holdings.map((h) => h.ticker);

  // Investments-account tickers that don't have their own ETF detail page (/etfs/ route).
  const investmentTickers = rothIraHoldings
    .filter((h) => !(h.ticker in etfProfiles))
    .map((h) => h.ticker);

  const unique = [...new Set([...retailTickers, ...investmentTickers])];
  return unique.map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const retail = holdings.find((h) => h.ticker === ticker);
  const sleeve = rothIraHoldings.find((h) => h.ticker === ticker);
  const company = retail?.company ?? sleeve?.company;
  const thesis = retail?.thesis ?? sleeve?.thesis;
  if (!company) return {};
  return {
    title: `${ticker} ${company}`,
    description: thesis ?? `${ticker} ${company}: position thesis and research.`,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PositionPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: rawTicker } = await params;
  // Defensive normalization — every other data store keys on uppercase tickers.
  const ticker = rawTicker.toUpperCase();

  // Gather data from all sources.
  const retailHolding = holdings.find((h) => h.ticker === ticker);
  const investmentHolding = rothIraHoldings.find((h) => h.ticker === ticker);
  const sleeveHolding = investmentHolding;

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

  // Lot/event data is no longer read here. It carries per-share prices, and this
  // page's chart is a client component — see the PRIVACY note at the chart.
  // Position Changes below derives from lib/positionChanges, which emits no prices.

  // Position Changes: derive from events when available so the section auto-
  // updates with every sell/trim. Fall back to legacy curated trimEvents for
  // tickers that don't have full transaction history yet.
  const derivedChanges = getPositionChanges(ticker);
  const useDerivedChanges = derivedChanges.length > 0;

  // Entry marker: only used when no per-lot data is available.
  // The entry-marker computation lived here and resolved to a per-share PRICE
  // (costBasis / estimatedEntryPrice) that was handed to the client chart.
  // Removed for the same reason as the lot props — see the PRIVACY note below.

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <PositionQuoteProvider ticker={ticker}>
        <main>

          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <section
            className="relative overflow-hidden border-b"
            style={{ borderColor: HAIRLINE }}
          >
            <div className="absolute inset-0 hero-grid" />

            <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">

              {/* Overline badges */}
              <div className="mb-8 flex flex-wrap items-center gap-2">
                {assetType && <Tag variant="solid" color={accentColor}>{assetType}</Tag>}
                {subcategory && <Tag>{subcategory}</Tag>}
                {country && <Tag>{country}</Tag>}
                {marketCap && <Tag>{marketCap}</Tag>}
              </div>

              {/* Ticker + company + live quote */}
              <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">

                {/* Left: identity */}
                <div>
                  <div className="flex items-center gap-4">
                    <TickerLogo ticker={ticker} name={company} size="lg" />
                    <h1
                      className="font-mono font-semibold leading-none tracking-tight"
                      style={{ color: INK, fontSize: "clamp(2.4rem,6vw,4.5rem)" }}
                    >
                      {ticker}
                    </h1>
                  </div>
                  <p
                    className="font-display mt-5 font-semibold"
                    style={{ color: INK, fontSize: "clamp(1.3rem,2.6vw,1.75rem)" }}
                  >
                    {company}
                  </p>
                </div>

                {/* Right: sleeve summary */}
                {/* NO-PRICE RULE: a "Live Quote" card used to sit here, showing
                    the live price, the daily change %, per-share avg cost, and
                    a last-updated market-data stamp. The site does not display
                    security prices in any form (live, delayed, per-share, or
                    daily change), so it was removed. Position return still
                    surfaces below as a percentage, per sleeve. */}
                <div className="flex shrink-0 flex-col gap-4">

                  {/* In Your Sleeves */}
                  {sleeveOwnerships.length > 0 && (
                    <div className="px-8 py-6" style={CARD}>
                      <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
                        In Your Sleeves
                      </p>
                      <div className="space-y-3">
                        {sleeveOwnerships.map((s) => {
                          const rowContent = (
                            <>
                              <span
                                className="font-mono text-[10px] uppercase tracking-[0.15em] transition-colors group-hover:opacity-70"
                                style={{ color: s.color }}
                              >
                                {s.title}
                              </span>
                              <div className="flex items-center gap-4">
                                {s.slug === "investments" ? (
                                  <DerivedInvestmentWeight
                                    ticker={ticker}
                                    fallbackPct={s.weightPct}
                                    showStatus
                                  />
                                ) : (
                                  <span className="font-mono text-[11px] tabular-nums text-[#3d4f66]">
                                    {s.weightPct.toFixed(1)}%
                                  </span>
                                )}
                                <LiveReturnBadge ticker={ticker} sleeve={s.costKey} />
                              </div>
                            </>
                          );
                          return s.isLive ? (
                            <Link
                              key={s.slug}
                              href={`/portfolio/${s.slug}`}
                              className="flex items-center justify-between gap-8 group"
                            >
                              {rowContent}
                            </Link>
                          ) : (
                            <div
                              key={s.slug}
                              className="flex items-center justify-between gap-8 group opacity-70"
                            >
                              {rowContent}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </section>

          {/* ── Chart ─────────────────────────────────────────────────────── */}
          <section className="border-b" style={{ borderColor: HAIRLINE }}>
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
{/* PRIVACY: purchaseLots, averageCost and entryMarker all carry real
                  per-share PRICES. ChartWrapper is a client component, so passing
                  them serialised those prices into the page payload — they showed
                  up in built HTML even though the chart renders percent-only.
                  Dropped: every ticker that has lot data is now registered and
                  308-redirects to /thesis/[ticker], so these legacy pages are
                  unreachable and lose nothing visible. Do not re-add a
                  price-bearing prop to a client chart. */}
            <ChartWrapper ticker={chartTicker} />
            </div>
          </section>

          {/* PRIVACY: a "Return Since Purchase" section stood here, rendering
              Purchase Price and Current Price as dollar figures from the
              holdings' private `purchase` block. Both the section and its
              backing data are gone. */}

          {/* ── Position Changes ──────────────────────────────────────────── */}
          {(useDerivedChanges || (detail?.trimEvents && detail.trimEvents.length > 0)) && (
            <section className="border-b" style={{ borderColor: HAIRLINE }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <Eyebrow className="mb-8">Position Changes</Eyebrow>
                <div className="space-y-5">
                  {useDerivedChanges
                    ? derivedChanges.map((card, i) => (
                        <DerivedChangeCard key={i} card={card} />
                      ))
                    : detail!.trimEvents!.map((event, i) => (
                        <TrimEventCard key={i} event={event} />
                      ))}
                </div>
              </div>
            </section>
          )}
          {/* The templated "Why I Own It" block was removed. Canonical research
              lives at /thesis/[ticker], which does not force every company
              through a shared opener. */}

          {/* ── Investment Thesis ─────────────────────────────────────────── */}
          {(thesis || detail?.longDescription) && (
            <section className="border-b" style={{ borderColor: HAIRLINE }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <Eyebrow className="mb-5">Investment Thesis</Eyebrow>
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
          {/* Key Risks and the Bull/Base/Bear scenario grid were removed. The
              canonical research route is /thesis/[ticker], where risk is argued
              inside the analysis and no company is forced through a shared
              template. This dormant legacy route no longer renders either. */}

          {/* ── What I'm Watching ────────────────────────────────────────── */}
          {detail?.watchList && detail.watchList.length > 0 && (
            <section className="border-b" style={{ borderColor: HAIRLINE }}>
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <Eyebrow className="mb-8">What I&apos;m Watching</Eyebrow>
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
      <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex items-center justify-between">
            <Link
              href={primarySleeve ? `/portfolio/${primarySleeve.slug}` : "/"}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5a6e82] transition-colors hover:text-[#0f1e35]"
            >
              ← {primarySleeve?.title ?? "Overview"}
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
  // Privacy contract: this card MUST NOT render pricePerShare, quantity, or
  // amountUsd. Public surfaces are date + qualitative action + explanation.
  return (
    <div
      className="max-w-2xl p-7"
      style={CARD}
    >
      <div className="mb-5 flex items-start justify-between gap-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#5a6e82]">
          {formatDetailDate(event.date)}
        </p>
        <Tag>
          {EVENT_TYPE_LABEL[event.type]}
        </Tag>
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

// ── Derived position-change card ──────────────────────────────────────────────
// Renders cards produced by lib/positionChanges from positionEvents data.
// Strictly public-safe — no shares, prices, or dollar amounts.

function DerivedChangeCard({ card }: { card: PositionChangeCard }) {
  return (
    <div
      className="max-w-2xl p-7"
      style={CARD}
    >
      <div className="mb-5 flex items-start justify-between gap-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#5a6e82]">
          {formatPositionChangeDate(card)}
        </p>
        <Tag>
          {positionChangeLabel(card)}
        </Tag>
      </div>
      <p className="text-[13px] leading-[1.85] text-[#3d4f66]">
        {card.note ?? defaultChangeCopy(card)}
      </p>
    </div>
  );
}

function defaultChangeCopy(card: PositionChangeCard): string {
  if (card.kind === "exit") return "Position fully exited.";
  if (card.kind === "trim_series")
    return "Multiple small trims through the month to bring the position closer to target sizing.";
  return "Partial trim to bring the position closer to target sizing.";
}

// ── Scenario card ──────────────────────────────────────────────────────────────


