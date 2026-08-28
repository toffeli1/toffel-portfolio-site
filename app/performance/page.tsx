import Link from "next/link";
import TickerLogo from "@/components/TickerLogo";
import Eyebrow from "@/components/Eyebrow";
import { Tag } from "@/components/Tag";
import {
  CumulativeChart, MonthlyGroupedBars, DrawdownChart, SERIES_COLORS,
  type CumulativeSeries, type MonthlyRow,
} from "@/components/PerformanceCharts";
import {
  performance, availableBenchmarkViews, pendingBenchmarkViews,
} from "@/data/performance";
import { getCompany } from "@/data/companies";
import { thesisHrefIfPublished } from "@/lib/routes";
import { INK, BODY, MUTED, FAINT, HAIRLINE, CARD, POSITIVE, NEGATIVE, SECTION_Y } from "@/lib/theme";

// ─── Performance ──────────────────────────────────────────────────────────────
// Every number on this page comes from data/performanceDerived.json, generated
// by the one canonical engine. Nothing is computed here.
//
// No NAV dollars, deposits, balances, transaction amounts, share counts or
// prices appear on this page by construction — the artifact contains none.

export const metadata = {
  title: "Performance",
  description:
    "Time-weighted return since July 3, 2025 versus the S&P 500 total-return index, with monthly, calendar-year, drawdown and holding-level analytics.",
};

const pct = (n: number, d = 2) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
const tone = (n: number) => (n >= 0 ? POSITIVE : NEGATIVE);
const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

function Stat({
  label, value, color, note,
}: { label: string; value: string; color?: string; note?: string }) {
  return (
    <div className="px-5 py-4 first:pl-0">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="font-mono font-semibold leading-none tracking-tight"
         style={{ color: color ?? INK, fontSize: "1.7rem" }}>
        {value}
      </p>
      {note && <p className="mt-2 font-mono text-[9px]" style={{ color: FAINT }}>{note}</p>}
    </div>
  );
}

export default function PerformancePage() {
  const p = performance;
  const available = availableBenchmarkViews();
  const pending = pendingBenchmarkViews();
  const sp = p.benchmarks.sp500;

  // Cumulative: portfolio plus every benchmark that has a real series.
  const cumulativeSeries: CumulativeSeries[] = [
    { key: "portfolio", label: "Portfolio TWR", color: SERIES_COLORS.portfolio, points: p.wealth },
    ...available.map((b) => ({
      key: b.key,
      label: `${b.name} (total return)`,
      color: SERIES_COLORS[b.key as keyof typeof SERIES_COLORS] ?? "#1a3a5c",
      points: b.wealth,
    })),
  ];

  // Monthly rows: portfolio always, benchmark columns only where available.
  const monthlyRows: MonthlyRow[] = p.monthly.map((m) => {
    const row: MonthlyRow = { key: m.key, portfolioPct: m.returnPct, partial: m.partial };
    for (const b of available) {
      const hit = b.monthly.find((x) => x.key === m.key);
      if (hit) row[b.key] = hit.returnPct;
    }
    return row;
  });
  const monthlyBenchmarks = available.map((b) => ({
    key: b.key,
    label: b.name,
    color: SERIES_COLORS[b.key as keyof typeof SERIES_COLORS] ?? "#1a3a5c",
  }));

  const activeSorted = [...p.activeHoldings].sort(
    (a, b) => (b.totalReturnPct ?? -Infinity) - (a.totalReturnPct ?? -Infinity)
  );

  const stats = [
    { label: "Portfolio TWR", value: pct(p.cumulativeReturnPct), color: tone(p.cumulativeReturnPct), note: `Since ${fmtDate(p.inceptionDate)}` },
    ...(sp.available ? [{ label: "S&P 500 total return", value: pct(sp.cumulativeReturnPct!), color: tone(sp.cumulativeReturnPct!), note: "Dividends reinvested" }] : []),
    ...(sp.available && sp.excessCumulativePts !== undefined ? [{ label: "Excess vs S&P 500", value: `${sp.excessCumulativePts >= 0 ? "+" : ""}${sp.excessCumulativePts.toFixed(2)} pts`, color: tone(sp.excessCumulativePts), note: "Portfolio minus benchmark" }] : []),
    { label: "Max drawdown", value: `${p.maxDrawdownPct.toFixed(2)}%`, color: NEGATIVE, note: `Trough ${fmtDate(p.maxDrawdownDate)}` },
    { label: "Annualized volatility", value: `${p.annualizedVolatilityPct.toFixed(2)}%`, note: "Std. dev. of daily returns" },
    ...(p.betaVsSp500 !== null ? [{ label: "Beta vs S&P 500", value: p.betaVsSp500.toFixed(2), note: "Daily returns, since inception" }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <main>
        {/* ── 1. Header + methodology ────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-6xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-3">Track Record</Eyebrow>
            <h1 className="font-display text-[32px] font-semibold tracking-tight" style={{ color: INK }}>Performance</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.75]" style={{ color: BODY }}>
              Time-weighted return since <strong>{fmtDate(p.inceptionDate)}</strong>, the first day of
              Roth account activity. Through {fmtDate(p.asOfDate)} across {p.sessions} trading sessions.
            </p>
            <p className="mt-3 max-w-2xl font-mono text-[10px] leading-[1.7]" style={{ color: MUTED }}>
              Daily TWR, geometrically linked. Contributions, withdrawals and transfers are removed
              from return so deposited capital is never counted as performance; dividends and
              distributions are return and are treated as reinvested. Every figure on this page,
              cumulative, monthly, calendar-year and drawdown, derives from that one series.
            </p>

            {/* ── Since-inception stat strip ─────────────────────────────── */}
            <div
              className="mt-10 grid grid-cols-2 divide-x divide-y border-y sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6"
              style={{ borderColor: HAIRLINE }}
            >
              {stats.map((s) => <Stat key={s.label} {...s} />)}
            </div>
            {pending.length > 0 && (
              <p className="mt-5 font-mono text-[10px] leading-[1.7]" style={{ color: NEGATIVE, opacity: 0.85 }}>
                {pending.map((b) => `${b.name} total return unavailable: ${b.unavailableReason}`).join(" ")}
              </p>
            )}
            {sp.available && sp.excessCumulativePts !== undefined && (
              <p className="mt-5 max-w-2xl font-mono text-[10px] leading-[1.7]" style={{ color: MUTED }}>
                {p.sensitivity.excludingNBIS.excessVsSp500Pts !== null && (
                  <>
                    <span style={{ color: INK }}>
                      {p.sensitivity.excludingNBIS.label}, the excess vs. S&P 500 above falls to{" "}
                      {p.sensitivity.excludingNBIS.excessVsSp500Pts >= 0 ? "+" : ""}
                      {p.sensitivity.excludingNBIS.excessVsSp500Pts.toFixed(2)} pts
                    </span>
                    {" "}({pct(p.sensitivity.excludingNBIS.cumulativeReturnPct)} cumulative).{" "}
                  </>
                )}
                {p.sensitivity.excludingNBIS.methodologyNote}
              </p>
            )}
            {p.betaVsSp500 !== null && p.sensitivity.excludingNBIS.excessVsSp500Pts !== null && (
              <p className="mt-4 max-w-2xl text-[13px] leading-[1.85]" style={{ color: INK }}>
                Two things follow from these numbers. Roughly 90% of the excess return traces
                to one position, and at a beta of 1.75 the book did not beat what that risk
                alone would imply. A 14 month record with one dominant name is not evidence of
                skill, and I would rather state that than let the headline return stand on its
                own.
              </p>
            )}
          </div>
        </section>

        {/* ── 2. Cumulative ──────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-6xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-6">Cumulative Performance</Eyebrow>
            <CumulativeChart series={cumulativeSeries} />
            <div className="mt-4 space-y-1.5">
              <p className="font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
                All series indexed to 0% at {fmtDate(p.inceptionDate)} and restricted to the same
                trading sessions.
              </p>
              {/* Every benchmark discloses its own source. A proxied series must
                  say so explicitly rather than letting the index label imply the
                  official index was used. */}
              {available.map((b) => (
                <p key={b.key} className="font-mono text-[9px] leading-[1.6]"
                   style={{ color: b.proxy ? NEGATIVE : FAINT, opacity: b.proxy ? 0.9 : 1 }}>
                  {b.name}: {b.sourceNote}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Monthly ─────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-6xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-6">Monthly Returns</Eyebrow>
            <MonthlyGroupedBars rows={monthlyRows} benchmarks={monthlyBenchmarks} />
            <p className="mt-4 font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
              {p.monthly.length} periods. July 2025 is a partial month beginning{" "}
              {fmtDate(p.inceptionDate)}; the latest month runs through {fmtDate(p.asOfDate)}.
              Monthly returns link exactly to the cumulative figure above.
            </p>
          </div>
        </section>

        {/* ── 4. Calendar year ───────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-6xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-6">Calendar-Year Performance</Eyebrow>
            <div className="overflow-x-auto" style={CARD}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                    {["Period", "Portfolio", ...available.map((b) => b.name),
                      ...available.map((b) => `Excess vs ${b.name}`)].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.18em]"
                          style={{ color: FAINT }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.calendarYear.map((y, i) => (
                    <tr key={y.key} style={i < p.calendarYear.length - 1
                      ? { borderBottom: `1px solid ${HAIRLINE}` } : undefined}>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[12px] font-semibold" style={{ color: INK }}>{y.label}</span>
                        {y.partial && (
                          <span className="ml-2">
                            <Tag>partial · from {fmtDate(y.from)}</Tag>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-[12px] tabular-nums"
                          style={{ color: tone(y.returnPct) }}>{pct(y.returnPct)}</td>
                      {available.map((b) => {
                        const bv = b.calendarYear.find((x) => x.key === y.key);
                        return (
                          <td key={b.key} className="px-5 py-4 font-mono text-[12px] tabular-nums"
                              style={{ color: bv ? tone(bv.returnPct) : FAINT }}>
                            {bv ? pct(bv.returnPct) : "—"}
                          </td>
                        );
                      })}
                      {available.map((b) => {
                        const bv = b.calendarYear.find((x) => x.key === y.key);
                        const ex = bv ? y.returnPct - bv.returnPct : undefined;
                        return (
                          <td key={`x-${b.key}`} className="px-5 py-4 font-mono text-[12px] tabular-nums"
                              style={{ color: ex === undefined ? FAINT : tone(ex) }}>
                            {ex === undefined ? "—" : `${ex >= 0 ? "+" : ""}${ex.toFixed(2)} pts`}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
              2025 is a partial year beginning {fmtDate(p.inceptionDate)}. 2026 is year-to-date
              through {fmtDate(p.asOfDate)}. Excess return is portfolio minus benchmark, in
              percentage points.
            </p>
          </div>
        </section>

        {/* ── 5. Drawdown ────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-6xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-6">Drawdown</Eyebrow>
            <DrawdownChart points={p.drawdown} />
            <p className="mt-4 font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
              Peak-to-trough decline of the same daily wealth index used above:
              wealth ÷ running peak − 1. Worst: {p.maxDrawdownPct.toFixed(2)}% on{" "}
              {fmtDate(p.maxDrawdownDate)}.
            </p>
          </div>
        </section>

        {/* ── 6. Active holding performance ──────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-6xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-6">Active Holding Performance</Eyebrow>
            <div className="overflow-x-auto" style={CARD}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                    {["Holding", "Total return", "Holding period", "Avg geometric / trading session"].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.18em] ${i === 0 ? "text-left" : "text-right"}`}
                          style={{ color: FAINT }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeSorted.map((h, i) => {
                    const c = getCompany(h.ticker);
                    const href = thesisHrefIfPublished(h.ticker);
                    const id = (
                      <div className="flex min-w-0 items-center gap-3">
                        <TickerLogo ticker={h.ticker} name={c?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-mono text-[11px]" style={{ color: INK }}>{h.ticker}</p>
                          <p className="truncate text-[12px]" style={{ color: MUTED }}>{c?.name ?? h.ticker}</p>
                        </div>
                      </div>
                    );
                    return (
                      <tr key={h.ticker} style={i < activeSorted.length - 1
                        ? { borderBottom: `1px solid ${HAIRLINE}` } : undefined}>
                        <td className="px-5 py-4">
                          {href ? <Link href={href} className="inline-flex transition-opacity hover:opacity-70">{id}</Link> : id}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[12px] tabular-nums"
                            style={{ color: h.totalReturnPct === null ? FAINT : tone(h.totalReturnPct) }}>
                          {h.totalReturnPct === null ? "—" : pct(h.totalReturnPct)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[11px] tabular-nums" style={{ color: MUTED }}>
                          {h.sessionsHeld} sessions
                          {h.reEntered && (
                            <span className="ml-2" title={`${h.priorClosedIntervals ?? 0} earlier interval(s) closed before this one`}>
                              <Tag>re-entered</Tag>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[11px] tabular-nums"
                            style={{ color: h.geometricPerSessionReturnPct === null ? FAINT : tone(h.geometricPerSessionReturnPct) }}>
                          {h.geometricPerSessionReturnPct === null ? "—" : `${h.geometricPerSessionReturnPct >= 0 ? "+" : ""}${h.geometricPerSessionReturnPct.toFixed(4)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 max-w-3xl font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
              {p.activeHoldings.length} active holdings. Holding periods are counted in{" "}
              <strong>trading sessions</strong> the position was actually open, not calendar days.
              A position exited and later re-entered counts only the sessions inside its real
              holding intervals rather than being treated as continuously owned. Average geometric
              return per trading session held is (1 + total return)^(1 / sessions held) − 1, not
              total return divided by sessions. Short holding periods make the per-session figure
              volatile; the adjacent holding-period column is the context for reading it.
              {" "}{p.valuationMarkNote}
              {" "}{p.contributionNote}
            </p>
            <div className="mt-6">
              <Link href="/performance/historical"
                    className="font-mono text-[11px] underline transition-colors hover:opacity-70"
                    style={{ color: MUTED }}>
                Historical positions →
              </Link>
            </div>
          </div>
        </section>

        <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/portfolio/investments"
                    className="font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:opacity-70"
                    style={{ color: MUTED }}>← Investments</Link>
              <p className="font-mono text-[10px]" style={{ color: MUTED }}>
                Track record is short and spans a strong market. Past performance does not indicate
                future results. For informational purposes only; not financial advice.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
