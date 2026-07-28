import type { RothPublicData, RothPublicHolding } from "@/data/rothPublicPerformance";
import SleeveDashboard, { type SleeveDashboardHolding } from "@/components/SleeveDashboard";
import { etfProfiles } from "@/data/etfConstituents";
import { rothIraHoldings } from "@/data/sleeveHoldings";

// Public-safe by construction: renders only weights, unrealized returns, and
// money-weighted IRR figures from RothPublicData. Never render a dollar
// amount, balance, or contribution figure here.

// Weight labels + leader lines only render for slices at or above this
// threshold; smaller slices still appear in the legend, with no leader line.
const WEIGHT_LABEL_THRESHOLD_PCT = 4;

// Company display name lookup only — never a source of weight or return
// values, which always come from RothPublicHolding.weight_pct /
// unrealized_return_pct. Falls back to the ticker itself if unmapped.
function companyName(ticker: string): string {
  return rothIraHoldings.find((h) => h.ticker === ticker)?.company ?? ticker;
}

function tickerHref(ticker: string): string {
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

function fmtSignedPts(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)} pts`;
}

function toneColor(n: number): string {
  return n >= 0 ? POSITIVE : NEGATIVE;
}

// ── Performance summary ──────────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-[#5a6e82]">
        {label}
      </p>
      <p
        className="font-mono font-bold tabular-nums"
        style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", color }}
      >
        {value}
      </p>
    </div>
  );
}

function PerformanceSummary({ performance }: { performance: RothPublicData["performance"] }) {
  return (
    <div className="rounded-2xl p-8" style={CARD_STYLE}>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <Stat
          label="IRR Since Inception"
          value={fmtSignedPct(performance.irr_since_inception_pct)}
          color={toneColor(performance.irr_since_inception_pct)}
        />
        <Stat
          label="VOO Benchmark IRR"
          value={fmtSignedPct(performance.voo_benchmark_irr_pct)}
          color={toneColor(performance.voo_benchmark_irr_pct)}
        />
        <Stat
          label="Annualized Alpha vs. VOO"
          value={fmtSignedPts(performance.annualized_alpha_pts)}
          color={toneColor(performance.annualized_alpha_pts)}
        />
      </div>
    </div>
  );
}

// ── Weighting (logo grid + donut) ────────────────────────────────────────────

// Reuses the sleeve-view dashboard (components/SleeveDashboard.tsx) rather
// than a parallel implementation. No color is passed per holding, so slices
// take the component's default sequential palette in weight order — no red
// or green, since those are reserved for return coloring elsewhere on this
// page.
function Weighting({ holdings }: { holdings: RothPublicHolding[] }) {
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

function HoldingsTable({ holdings }: { holdings: RothPublicHolding[] }) {
  // Defensive sort — holdings are expected sorted desc by weight, but don't rely on it.
  const sorted = [...holdings].sort((a, b) => b.weight_pct - a.weight_pct);
  const maxWeight = Math.max(...sorted.map((h) => h.weight_pct), 1);

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
            <th className="px-5 py-3.5 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
              Unrealized Return
            </th>
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
                <td className="px-5 py-4 text-right">
                  <span
                    className="font-mono text-[12px] font-semibold tabular-nums"
                    style={{ color: toneColor(h.unrealized_return_pct) }}
                  >
                    {fmtSignedPct(h.unrealized_return_pct)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function RothPerformanceSection({ data }: { data: RothPublicData }) {
  // Single sorted source of truth — the weighting section and the returns
  // table both render from this, never a second copy.
  const sortedHoldings = [...data.holdings].sort((a, b) => b.weight_pct - a.weight_pct);

  return (
    <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <p
          className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          Performance
        </p>
        <PerformanceSummary performance={data.performance} />

        <div className="mt-12">
          <Weighting holdings={sortedHoldings} />
        </div>

        <p
          className="mb-6 mt-12 font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          Holdings
        </p>
        <HoldingsTable holdings={sortedHoldings} />

        <div className="mt-8 space-y-2">
          <p className="font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
            Money-weighted (IRR) since account inception, across both custodians. VOO
            benchmark uses identical contribution timing.
          </p>
          <p className="font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
            Returns are unrealized and marked at delayed prices. Track record is short
            (~3 years) and spans a strong market. Past performance does not indicate
            future results. For informational purposes only; not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
