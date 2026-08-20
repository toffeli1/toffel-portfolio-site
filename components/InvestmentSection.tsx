import type { InvestmentPublicData, InvestmentPublicHolding } from "@/data/investmentPerformance";
import SleeveDashboard, { type SleeveDashboardHolding } from "@/components/SleeveDashboard";
import { etfProfiles } from "@/data/etfConstituents";
import { rothIraHoldings } from "@/data/sleeveHoldings";

// Public-safe by construction: renders only weights and unrealized returns
// from InvestmentPublicData. Never render a dollar amount, balance, or
// contribution figure here. Performance KPIs (IRR, benchmark, excess) live
// on /performance — see app/performance/page.tsx.

// Weight labels + leader lines only render for slices at or above this
// threshold; smaller slices still appear in the legend, with no leader line.
const WEIGHT_LABEL_THRESHOLD_PCT = 4;

// Company display name lookup only — never a source of weight or return
// values, which always come from InvestmentPublicHolding.weight_pct /
// unrealized_return_pct. Falls back to the ticker itself if unmapped.
function companyName(ticker: string): string {
  return rothIraHoldings.find((h) => h.ticker === ticker)?.company ?? ticker;
}

// Tickers with a real page in the current account routing but a
// `positionDetails` entry that predates this holding (written for a
// different, unpublished sleeve) — link would resurface content that
// hasn't been reviewed for this context, so leave unlinked instead.
const UNLINKED_TICKERS = new Set(["CEG"]);

function tickerHref(ticker: string): string | undefined {
  if (UNLINKED_TICKERS.has(ticker)) return undefined;
  return ticker in etfProfiles ? `/etfs/${ticker}` : `/positions/${ticker}`;
}

const ACCENT = "#1a4a2e";
const POSITIVE = "#15542e";
const NEGATIVE = "#8b1a1a";

const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid rgba(15,30,53,0.09)",
  boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
} as const;

function fmtSignedPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function hasAnyUnrealizedReturn(holdings: InvestmentPublicHolding[]): boolean {
  return holdings.some((h) => h.unrealized_return_pct !== undefined);
}

function toneColor(n: number): string {
  return n >= 0 ? POSITIVE : NEGATIVE;
}

// ── Weighting (logo grid + donut) ────────────────────────────────────────────

// Reuses the sleeve-view dashboard (components/SleeveDashboard.tsx) rather
// than a parallel implementation. No color is passed per holding, so slices
// take the component's default sequential palette in weight order — no red
// or green, since those are reserved for return coloring elsewhere on this
// page.
function Weighting({ holdings }: { holdings: InvestmentPublicHolding[] }) {
  const dashboardHoldings: SleeveDashboardHolding[] = holdings.map((h) => ({
    ticker: h.ticker,
    name: companyName(h.ticker),
    href: tickerHref(h.ticker),
    portfolioWeightPct: h.weight_pct,
  }));

  return (
    <SleeveDashboard
      label="Weighting"
      layout="side-by-side"
      holdings={dashboardHoldings}
      valueDecimals={1}
      labelThresholdPct={WEIGHT_LABEL_THRESHOLD_PCT}
      tileGridClassName="grid grid-cols-3 gap-x-5 gap-y-7 justify-items-center sm:grid-cols-[repeat(auto-fit,minmax(112px,1fr))]"
      columnSplitClassName="grid gap-8 md:items-center md:gap-10 lg:gap-12 md:grid-cols-[42%_minmax(0,1fr)] lg:grid-cols-[55%_minmax(0,1fr)] xl:grid-cols-[62%_minmax(0,1fr)]"
      donutMargin={{ top: 24, right: 50, bottom: 24, left: 50 }}
    />
  );
}

// ── Holdings table ────────────────────────────────────────────────────────────

function HoldingsTable({ holdings }: { holdings: InvestmentPublicHolding[] }) {
  // Defensive sort — holdings are expected sorted desc by weight, but don't rely on it.
  const sorted = [...holdings].sort((a, b) => b.weight_pct - a.weight_pct);
  const maxWeight = Math.max(...sorted.map((h) => h.weight_pct), 1);
  // Hidden entirely when no holding has a verified figure (e.g. right after a
  // rebalance, before fresh cost basis comes in) rather than showing stale or
  // invented numbers. Reappears automatically once the data is back.
  const showReturns = hasAnyUnrealizedReturn(sorted);

  return (
    <div className="overflow-x-auto rounded-2xl" style={CARD_STYLE}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#f8f4ee", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
            <th className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
              Ticker
            </th>
            <th className="px-5 py-3.5 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
              Weight
            </th>
            {showReturns && (
              <th className="px-5 py-3.5 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                Unrealized Return
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((h, i) => {
            const isLast = i === sorted.length - 1;
            return (
              <tr
                key={h.ticker}
                style={isLast ? undefined : { borderBottom: "1px solid rgba(15,30,53,0.05)" }}
              >
                <td className="px-5 py-4">
                  <span
                    className="inline-block font-mono text-[12px] font-bold"
                    style={{
                      color: ACCENT,
                      backgroundColor: "rgba(26,74,46,0.08)",
                      padding: "4px 10px",
                      borderRadius: "5px",
                    }}
                  >
                    {h.ticker}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <div
                      className="hidden w-16 overflow-hidden rounded-full sm:block"
                      style={{ background: "rgba(15,30,53,0.08)" }}
                    >
                      <div
                        className="h-[3px] rounded-full"
                        style={{
                          width: `${(h.weight_pct / maxWeight) * 100}%`,
                          backgroundColor: ACCENT,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-sm font-semibold tabular-nums text-[#0f1e35]">
                      {h.weight_pct.toFixed(1)}%
                    </span>
                  </div>
                </td>
                {showReturns && (
                  <td className="px-5 py-4 text-right">
                    {h.unrealized_return_pct !== undefined && (
                      <span
                        className="font-mono text-[12px] font-semibold tabular-nums"
                        style={{ color: toneColor(h.unrealized_return_pct) }}
                      >
                        {fmtSignedPct(h.unrealized_return_pct)}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function InvestmentSection({ data }: { data: InvestmentPublicData }) {
  // Single sorted source of truth — the weighting section and the returns
  // table both render from this, never a second copy.
  const sortedHoldings = [...data.holdings].sort((a, b) => b.weight_pct - a.weight_pct);

  return (
    <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <Weighting holdings={sortedHoldings} />

        <p
          className="mb-6 mt-12 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          Holdings
        </p>
        <HoldingsTable holdings={sortedHoldings} />

        <div className="mt-8 space-y-2">
          <p className="font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
            {/* The unrealized-return clause is conditional: the returns column
                only renders when at least one holding has a verified figure, so
                claiming it unconditionally would describe a column that isn't
                there. Neither branch references a displayed price — this page
                shows weights, not prices. */}
            {hasAnyUnrealizedReturn(sortedHoldings)
              ? "Returns are unrealized. "
              : "Weights are a manually maintained snapshot. "}
            Track record is short (~3 years) and spans a strong market. Past
            performance does not indicate future results. For informational
            purposes only; not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
