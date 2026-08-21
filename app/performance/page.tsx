import Link from "next/link";
import TickerLogo from "@/components/TickerLogo";
import {
  CumulativeChart, MonthlyGroupedBars, DrawdownChart, SERIES_COLORS,
  type CumulativeSeries, type MonthlyRow,
} from "@/components/PerformanceCharts";
import {
  performance, availableBenchmarkViews, pendingBenchmarkViews,
} from "@/data/performance";
import { getCompany } from "@/data/companies";
import { thesisHrefIfPublished } from "@/lib/routes";

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

const ACCENT = "#1a4a2e";
const INK = "#0f1e35";
const MUTED = "#5a6e82";
const FAINT = "#7a8799";
const POS = "#15542e";
const NEG = "#8b1a1a";

const CARD = {
  background: "#ffffff",
  border: "1px solid rgba(15,30,53,0.09)",
  boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
} as const;

const pct = (n: number, d = 2) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`;
const tone = (n: number) => (n >= 0 ? POS : NEG);
const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: FAINT }}>
      {children}
    </p>
  );
}

function Stat({
  label, value, color, note,
}: { label: string; value: string; color?: string; note?: string }) {
  return (
    <div className="rounded-2xl px-6 py-5" style={CARD}>
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="font-mono font-bold leading-none tracking-tight"
         style={{ color: color ?? INK, fontSize: "clamp(1.5rem,2.6vw,2rem)" }}>
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

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <main>
        {/* ── 1. Header + methodology ────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div style={{ height: "2px", background:
            `linear-gradient(90deg, transparent 0%, ${ACCENT}30 15%, ${ACCENT}60 50%, ${ACCENT}30 85%, transparent 100%)` }} />
          <div className="mx-auto max-w-6xl px-6 py-14 lg:px-12">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Track Record
            </p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: INK }}>Performance</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.75]" style={{ color: "#3d4f66" }}>
              Time-weighted return since <strong>{fmtDate(p.inceptionDate)}</strong>, the first day of
              Roth account activity. Through {fmtDate(p.asOfDate)} across {p.sessions} trading sessions.
            </p>
            <p className="mt-3 max-w-2xl font-mono text-[10px] leading-[1.7]" style={{ color: MUTED }}>
              Daily TWR, geometrically linked. Contributions, withdrawals and transfers are removed
              from return so deposited capital is never counted as performance; dividends and
              distributions are return and are treated as reinvested. Every figure on this page —
              cumulative, monthly, calendar-year and drawdown — derives from that one series.
            </p>
          </div>
        </section>

        {/* ── 2. Summary cards ───────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
            <SectionLabel>Since Inception</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Portfolio TWR" value={pct(p.cumulativeReturnPct)}
                    color={tone(p.cumulativeReturnPct)} note={`Since ${fmtDate(p.inceptionDate)}`} />
              {sp.available && (
                <Stat label="S&P 500 total return" value={pct(sp.cumulativeReturnPct!)}
                      color={tone(sp.cumulativeReturnPct!)} note="Dividends reinvested" />
              )}
              {sp.available && sp.excessCumulativePts !== undefined && (
                <Stat label="Excess vs S&P 500"
                      value={`${sp.excessCumulativePts >= 0 ? "+" : ""}${sp.excessCumulativePts.toFixed(2)} pts`}
                      color={tone(sp.excessCumulativePts)} note="Portfolio − benchmark" />
              )}
              <Stat label="Max drawdown" value={`${p.maxDrawdownPct.toFixed(2)}%`}
                    color={NEG} note={`Trough ${fmtDate(p.maxDrawdownDate)}`} />
            </div>
            {pending.length > 0 && (
              <p className="mt-5 font-mono text-[10px] leading-[1.7]" style={{ color: NEG, opacity: 0.85 }}>
                {pending.map((b) => `${b.name} total return unavailable — ${b.unavailableReason}`).join(" ")}
              </p>
            )}
          </div>
        </section>

        {/* ── 3. Cumulative ──────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
            <SectionLabel>Cumulative Performance</SectionLabel>
            <div className="rounded-2xl px-5 py-5" style={CARD}>
              <CumulativeChart series={cumulativeSeries} />
              <div className="mt-3 space-y-1.5">
                <p className="font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
                  All series indexed to 0% at {fmtDate(p.inceptionDate)} and restricted to the same
                  trading sessions.
                </p>
                {/* Every benchmark discloses its own source. A proxied series must
                    say so explicitly rather than letting the index label imply the
                    official index was used. */}
                {available.map((b) => (
                  <p key={b.key} className="font-mono text-[9px] leading-[1.6]"
                     style={{ color: b.proxy ? "#8b2530" : FAINT, opacity: b.proxy ? 0.9 : 1 }}>
                    {b.name}: {b.sourceNote}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Monthly ─────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
            <SectionLabel>Monthly Returns</SectionLabel>
            <div className="rounded-2xl px-5 py-5" style={CARD}>
              <MonthlyGroupedBars rows={monthlyRows} benchmarks={monthlyBenchmarks} />
              <p className="mt-3 font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
                {p.monthly.length} periods. July 2025 is a partial month beginning{" "}
                {fmtDate(p.inceptionDate)}; the latest month runs through {fmtDate(p.asOfDate)}.
                Monthly returns link exactly to the cumulative figure above.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Calendar year ───────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
            <SectionLabel>Calendar-Year Performance</SectionLabel>
            <div className="overflow-x-auto rounded-2xl" style={CARD}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8f4ee", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
                    {["Period", "Portfolio", ...available.map((b) => b.name),
                      ...available.map((b) => `Excess vs ${b.name}`)].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left font-mono text-[9px] uppercase tracking-[0.2em]"
                          style={{ color: FAINT }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.calendarYear.map((y, i) => (
                    <tr key={y.key} style={i < p.calendarYear.length - 1
                      ? { borderBottom: "1px solid rgba(15,30,53,0.05)" } : undefined}>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[12px] font-semibold" style={{ color: INK }}>{y.label}</span>
                        {y.partial && (
                          <span className="ml-2 rounded font-mono text-[8px] uppercase tracking-[0.12em]"
                                style={{ color: FAINT, border: "1px solid rgba(15,30,53,0.12)", padding: "2px 6px" }}>
                            partial · from {fmtDate(y.from)}
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

        {/* ── 6. Drawdown ────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
            <SectionLabel>Drawdown</SectionLabel>
            <div className="rounded-2xl px-5 py-5" style={CARD}>
              <DrawdownChart points={p.drawdown} />
              <p className="mt-3 font-mono text-[9px] leading-[1.6]" style={{ color: FAINT }}>
                Peak-to-trough decline of the same daily wealth index used above —
                wealth ÷ running peak − 1. Worst: {p.maxDrawdownPct.toFixed(2)}% on{" "}
                {fmtDate(p.maxDrawdownDate)}.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. Active holding performance ──────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
            <SectionLabel>Active Holding Performance</SectionLabel>
            <div className="overflow-x-auto rounded-2xl" style={CARD}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8f4ee", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
                    {["Holding", "Total return", "Holding period", "Avg geometric / trading session"].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.2em] ${i === 0 ? "text-left" : "text-right"}`}
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
                        ? { borderBottom: "1px solid rgba(15,30,53,0.05)" } : undefined}>
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
                            <span className="ml-2 rounded font-mono text-[8px] uppercase tracking-[0.1em]"
                                  style={{ color: FAINT, border: "1px solid rgba(15,30,53,0.12)", padding: "1px 5px" }}
                                  title={`${h.priorClosedIntervals ?? 0} earlier interval(s) closed before this one`}>
                              re-entered
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

        <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/portfolio/investments"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:text-[#0f1e35]"
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
