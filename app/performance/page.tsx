import { investmentPublicData } from "@/data/investmentPerformance";
import { realizedPublicData } from "@/data/realizedPerformance";
import { fmtPortfolioDate } from "@/lib/config";

export const metadata = {
  title: "Performance",
  description:
    "IRR vs. benchmark, hit rate on closed positions, concentration of realized results, and contribution to result by position.",
};

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em]"
      style={{ color: ACCENT }}
    >
      {children}
    </p>
  );
}

function Stat({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-[#5a6e82]">
        {label}
      </p>
      <p
        className="font-mono font-bold tabular-nums"
        style={{ fontSize: "clamp(1.4rem,2.8vw,1.9rem)", color: color ?? "#0f1e35" }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1 font-mono text-[10px] leading-[1.5] text-[#7a8799]">{sub}</p>
      )}
    </div>
  );
}

export default function PerformancePage() {
  const { performance, holdings, as_of } = investmentPublicData;
  const {
    hit_rate_pct,
    closed_positions_count,
    top1_contributor_ticker,
    top1_share_pct,
    top3_tickers,
    top3_share_pct,
  } = realizedPublicData;

  // Contribution to result by position — weight × unrealized return, in
  // percentage points. Derived entirely from investmentPublicData; never a
  // second source for weight or return.
  const contributions = [...holdings]
    .map((h) => ({
      ticker: h.ticker,
      contributionPts: (h.weight_pct * h.unrealized_return_pct) / 100,
    }))
    .sort((a, b) => b.contributionPts - a.contributionPts);

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <main>
        {/* Header */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div
            style={{
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${ACCENT}30 15%, ${ACCENT}60 50%, ${ACCENT}30 85%, transparent 100%)`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: ACCENT }}
            >
              Process
            </p>
            <h1
              className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
              style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
            >
              Performance
            </h1>
            <p className="mt-2 max-w-xl font-mono text-[10px] leading-[1.5] text-[#5a6e82]">
              As of {fmtPortfolioDate(as_of)}.
            </p>
            <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-[#3d4f66]">
              IRR vs. benchmark, hit rate and concentration on closed positions, and
              contribution to result by holding.
            </p>
          </div>
        </section>

        {/* Return vs benchmark */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <SectionLabel>Return vs. Benchmark</SectionLabel>
            <div className="rounded-2xl p-8" style={CARD_STYLE}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  label="Excess vs. Benchmark"
                  value={fmtSignedPts(performance.excess_vs_benchmark_pts)}
                  color={toneColor(performance.excess_vs_benchmark_pts)}
                  sub="Raw return spread — not risk-adjusted"
                />
                <Stat
                  label="TWR (Time-Weighted)"
                  value="—"
                  sub="Not yet tracked — requires periodic account valuations not available in source records. IRR (money-weighted) is shown instead; IRR and TWR can differ meaningfully under uneven contribution timing."
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
                Money-weighted (IRR) since account inception, across both custodians. VOO
                benchmark uses identical contribution timing.
              </p>
              <p className="font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
                Reported returns include an employer/platform account match, which flatters
                IRR relative to the benchmark.
              </p>
              <p className="font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
                The benchmark figure is price-return only and excludes roughly 1.3%/yr of
                dividends, which understates it.
              </p>
              <p className="font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
                Returns are unrealized and marked at delayed prices. Track record is short
                (~3 years) and spans a strong market. Past performance does not indicate
                future results. For informational purposes only; not financial advice.
              </p>
            </div>
          </div>
        </section>

        {/* Hit rate + concentration */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <SectionLabel>Closed-Position Hit Rate &amp; Concentration</SectionLabel>
            <div className="rounded-2xl p-8" style={CARD_STYLE}>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <Stat
                  label="Hit Rate"
                  value={`${hit_rate_pct.toFixed(1)}%`}
                  sub={`Across ${closed_positions_count} closed or trimmed positions`}
                />
                <Stat
                  label="Top Contributor"
                  value={`${fmtSignedPct(top1_share_pct)}`}
                  color={toneColor(top1_share_pct)}
                  sub={`${top1_contributor_ticker} — share of total realized result`}
                />
                <Stat
                  label="Top 3 Combined"
                  value={`${fmtSignedPct(top3_share_pct)}`}
                  color={toneColor(top3_share_pct)}
                  sub={`${top3_tickers.join(", ")} — combined share of total realized result`}
                />
              </div>
            </div>
            <p className="mt-6 font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
              Hit rate is the share of closed or trimmed positions with a positive realized
              result. Concentration figures are each name&apos;s share of the total realized
              result across all closed/trimmed positions, not a share of the account.
            </p>
          </div>
        </section>

        {/* Contribution to result */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <SectionLabel>Contribution to Result by Position</SectionLabel>
            <div className="overflow-x-auto rounded-2xl" style={CARD_STYLE}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8f4ee", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
                    <th className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                      Ticker
                    </th>
                    <th className="px-5 py-3.5 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-[#7a8799]">
                      Contribution
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c, i) => (
                    <tr
                      key={c.ticker}
                      style={
                        i === contributions.length - 1
                          ? undefined
                          : { borderBottom: "1px solid rgba(15,30,53,0.05)" }
                      }
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
                          {c.ticker}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className="font-mono text-[12px] font-semibold tabular-nums"
                          style={{ color: toneColor(c.contributionPts) }}
                        >
                          {fmtSignedPts(c.contributionPts)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 font-mono text-[9px] leading-[1.5] text-[#5a6e82]">
              Contribution = current portfolio weight × unrealized return, in percentage
              points. Reflects unrealized holdings only, not the realized-result
              concentration figures above.
            </p>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <p className="font-mono text-[10px] text-[#5a6e82]">
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
