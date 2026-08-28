import Link from "next/link";
import TickerLogo from "@/components/TickerLogo";
import { performance } from "@/data/performance";
import { getCompany } from "@/data/companies";
import { thesisHrefIfPublished } from "@/lib/routes";
import Eyebrow from "@/components/Eyebrow";
import { INK, MUTED, FAINT, POSITIVE, NEGATIVE, HAIRLINE, CARD, SECTION_Y } from "@/lib/theme";

// ─── Historical Positions ─────────────────────────────────────────────────────
// Secondary surface for EXITED securities, linked modestly from Performance so
// closed positions don't sit at equal prominence with the active book.
//
// Nothing here feeds current allocation: the exited set comes from the company
// registry (status: "exited"), never from the Decision Log, and never from this
// page. Same privacy rule as everywhere — returns, dates and session counts
// only, no prices, shares, cost basis, proceeds or position dollars.

export const metadata = {
  title: "Historical Positions",
  description:
    "Realized performance for closed positions: total return over the actual holding period, with average geometric return per trading session held.",
};

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const tone = (n: number) => (n >= 0 ? POSITIVE : NEGATIVE);
const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

export default function HistoricalPositionsPage() {
  const rows = [...performance.historicalHoldings].sort(
    (a, b) => (b.totalReturnPct ?? -Infinity) - (a.totalReturnPct ?? -Infinity)
  );

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <main>
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className="mx-auto max-w-5xl px-6 py-12 lg:px-12">
            <Eyebrow className="mb-3" color={NEGATIVE}>Closed Positions</Eyebrow>
            <h1 className="font-display text-[28px] font-semibold tracking-tight" style={{ color: INK }}>
              Historical Positions
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.75]" style={{ color: MUTED }}>
              Securities the portfolio no longer holds. Measured over the{" "}
              <strong>trading sessions</strong> each position was actually open, on the same daily
              basis as active holdings. These do not appear in current allocation or portfolio
              analytics.
            </p>
          </div>
        </section>

        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className="mx-auto max-w-5xl px-6 py-10 lg:px-12">
            <div className="overflow-x-auto" style={CARD}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8f4ee", borderBottom: `1px solid ${HAIRLINE}` }}>
                    {["Position", "Total return", "Held", "Period", "Avg geometric / trading session"].map((h, i) => (
                      <th key={h}
                          className={`px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.2em] ${i === 0 ? "text-left" : "text-right"}`}
                          style={{ color: FAINT }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h, i) => {
                    const c = getCompany(h.ticker);
                    const href = thesisHrefIfPublished(h.ticker);
                    const id = (
                      <div className="flex min-w-0 items-center gap-3">
                        <TickerLogo ticker={h.ticker} name={h.company} size="sm" />
                        <div className="min-w-0">
                          <p className="font-mono text-[11px]" style={{ color: INK }}>
                            {h.ticker}
                            {/* Episode index only when a name was owned more than
                                once, so a single-episode row stays uncluttered. */}
                            {rows.filter((r) => r.ticker === h.ticker).length > 1 && (
                              <span style={{ color: FAINT }}> · ep {h.episode + 1}</span>
                            )}
                          </p>
                          <p className="truncate text-[12px]" style={{ color: MUTED }}>
                            {h.company || c?.name || h.ticker}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <tr key={`${h.ticker}-${h.episode}`} style={i < rows.length - 1
                        ? { borderBottom: `1px solid ${HAIRLINE}` } : undefined}>
                        <td className="px-5 py-4">
                          {href ? <Link href={href} className="inline-flex transition-opacity hover:opacity-70">{id}</Link> : id}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[12px] tabular-nums"
                            style={{ color: h.totalReturnPct === null ? FAINT : tone(h.totalReturnPct) }}>
                          {h.totalReturnPct === null ? "—" : pct(h.totalReturnPct)}
                          {h.trackedPeriodBasis && (
                            <span className="ml-1 font-mono text-[9px]" style={{ color: FAINT }}
                                  title="Transferred in from another account. Return is measured from the tracked-inception mark, not from the original purchase.">
                              *
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[11px] tabular-nums" style={{ color: MUTED }}>
                          {h.sessionsHeld} sessions
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[10px]" style={{ color: FAINT }}>
                          {h.exitedOn ? `${fmtDate(h.initiatedOn)} – ${fmtDate(h.exitedOn)}` : fmtDate(h.initiatedOn)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[11px] tabular-nums"
                            style={{ color: h.geometricPerSessionReturnPct === null ? FAINT : tone(h.geometricPerSessionReturnPct) }}>
                          {h.geometricPerSessionReturnPct === null
                            ? "—"
                            : `${h.geometricPerSessionReturnPct >= 0 ? "+" : ""}${h.geometricPerSessionReturnPct.toFixed(4)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 max-w-3xl font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
              {rows.length} closed ownership episodes, computed from actual ledger cash:
              realized proceeds plus dividends, less acquisition cost and fees, over cost.
              A security owned more than once appears once per episode rather than
              aggregated. An asterisk marks a position transferred in from another
              account, where return is measured from the tracked-inception mark because
              the original purchase predates this account. Holding periods are
              counted in <strong>trading sessions</strong>, and a position exited and re-entered
              counts only the sessions inside its real holding intervals. Average geometric return
              per trading session held is (1 + total return)^(1 / sessions held) − 1. A dash means
              no defensible figure exists, left blank rather than approximated. Decision rationale
              for each exit is in the{" "}
              <Link href="/decision-log" className="underline">Decision Log</Link>.
            </p>
          </div>
        </section>

        <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
          <div className="mx-auto max-w-5xl px-6 py-8 lg:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/performance"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:opacity-70"
                    style={{ color: MUTED }}>← Performance</Link>
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
