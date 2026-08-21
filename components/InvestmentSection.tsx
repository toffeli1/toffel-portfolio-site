import Link from "next/link";
import TickerLogo from "@/components/TickerLogo";
import SleeveDashboard, { type SleeveDashboardHolding } from "@/components/SleeveDashboard";
import { portfolioState, type PortfolioPosition } from "@/data/portfolioState";
import { thesisHrefIfPublished } from "@/lib/routes";

// ─── Investments section ──────────────────────────────────────────────────────
// Reads the canonical current state (data/portfolioState.ts) — not sleeve
// holdings, not the Decision Log. One weight list, one source.
//
// Renders per holding: logo, company name, and portfolio weight with its
// allocation bar. There is deliberately no ticker sub-label under the name —
// the logo identifies the holding and the row's own link target encodes the
// ticker, so a second line only repeated what was already on screen.
//
// Logo and name sit inside one link, so both are clickable and resolve through
// lib/routes.ts — Investments and the Decision Log can never drift to different
// destinations.
//
// Deliberately NOT rendered here: prices, share counts, cost basis, returns, or
// daily changes. The unrealized-return column that used to live in this table
// was removed on purpose — return and contribution analytics belong on
// /performance only.

const ACCENT = "#1a4a2e";
const INK = "#0f1e35";
const MUTED = "#5a6e82";
const FAINT = "#7a8799";

// Weight labels + leader lines only render for slices at or above this
// threshold; smaller slices still appear in the legend, with no leader line.
const WEIGHT_LABEL_THRESHOLD_PCT = 4;

const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid rgba(15,30,53,0.09)",
  boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
} as const;

// ── Weighting (logo grid + donut) ────────────────────────────────────────────
// Reuses the sleeve-view dashboard rather than a parallel implementation. No
// color is passed per holding, so slices take the component's default
// sequential palette in weight order — no red or green, which stay reserved for
// return coloring on /performance.
function Weighting({ positions }: { positions: PortfolioPosition[] }) {
  const dashboardHoldings: SleeveDashboardHolding[] = positions.map((p) => ({
    ticker: p.ticker,
    name: p.name,
    href: thesisHrefIfPublished(p.ticker),
    portfolioWeightPct: p.weightPct,
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

// ── Holdings table ──────────────────────────────────────────────────────────

function HoldingsTable({ positions }: { positions: PortfolioPosition[] }) {
  const maxWeight = Math.max(...positions.map((p) => p.weightPct), 1);

  return (
    <div className="overflow-x-auto rounded-2xl" style={CARD_STYLE}>
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              background: "#f8f4ee",
              borderBottom: "1px solid rgba(15,30,53,0.07)",
            }}
          >
            <th
              className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{ color: FAINT }}
            >
              Holding
            </th>
            <th
              className="px-5 py-3.5 text-right font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{ color: FAINT }}
            >
              Weight
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p, i) => {
            const href = thesisHrefIfPublished(p.ticker);
            const isLast = i === positions.length - 1;

            // Logo and name sit inside one link, so both are clickable. The
            // ticker sub-label that used to sit under the name was removed: the
            // logo already identifies the holding, and the second line repeated
            // information the row's own link target encodes.
            const identity = (
              <div className="flex min-w-0 items-center gap-3.5">
                <TickerLogo ticker={p.ticker} name={p.name} size="md" />
                <p className="truncate text-[13px] font-medium" style={{ color: INK }}>
                  {p.name}
                </p>
              </div>
            );

            return (
              <tr
                key={p.ticker}
                style={isLast ? undefined : { borderBottom: "1px solid rgba(15,30,53,0.05)" }}
              >
                <td className="px-5 py-4">
                  {href ? (
                    <Link
                      href={href}
                      className="inline-flex min-w-0 transition-opacity hover:opacity-70"
                      aria-label={`${p.name} (${p.ticker}) investment thesis`}
                    >
                      {identity}
                    </Link>
                  ) : (
                    identity
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <div
                      className="hidden w-28 overflow-hidden rounded-full sm:block"
                      style={{ background: "rgba(15,30,53,0.08)", height: 3 }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.weightPct / maxWeight) * 100}%`,
                          backgroundColor: ACCENT,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-sm font-semibold tabular-nums"
                      style={{ color: INK, minWidth: "3.75rem", textAlign: "right" }}
                    >
                      {p.weightPct.toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Section ─────────────────────────────────────────────────────────────────

export default function InvestmentSection() {
  const positions = portfolioState.positions;

  return (
    <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <Weighting positions={positions} />

        <p
          className="mb-6 mt-12 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          Holdings
        </p>
        <HoldingsTable positions={positions} />

        <div className="mt-8 space-y-2">
          <p className="font-mono text-[9px] leading-[1.5]" style={{ color: MUTED }}>
            Weights are a manually maintained snapshot. Returns, contribution and
            benchmark comparisons live on{" "}
            <Link href="/performance" className="underline">
              Performance
            </Link>
            . Track record is short (~3 years) and spans a strong market. Past
            performance does not indicate future results. For informational purposes
            only; not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
