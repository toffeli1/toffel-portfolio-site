import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolios, getPortfolio } from "@/data/portfolios";
import { holdings } from "@/data/holdings";
import { rothIraHoldings } from "@/data/sleeveHoldings";
import { etfProfiles } from "@/data/etfConstituents";
import { PORTFOLIO_UPDATED_AT, fmtPortfolioDate } from "@/lib/config";
import { QuotesProvider } from "@/components/QuotesProvider";
import SleeveDashboard from "@/components/SleeveDashboard";
import { getPreviousHoldingsBySleeve } from "@/data/previousHoldings";

export function generateStaticParams() {
  return portfolios.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPortfolio(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portfolio = getPortfolio(slug);
  if (!portfolio) notFound();

  if (portfolio.type === "retail") return <RetailView />;
  if (portfolio.type === "roth-ira") return <RothIraView />;
  return notFound();
}

// ── Shared nav elements ───────────────────────────────────────────────────────

function SleeveFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5a6e82] transition-colors hover:text-[#0f1e35]"
          >
            ← Overview
          </Link>
          <p className="font-mono text-[10px] text-[#5a6e82]">
            For informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Individual Brokerage view ─────────────────────────────────────────────────

function RetailView() {
  const color = "#1a3a5c";
  const fund2027 = holdings.filter((h) => h.sleeve === "2027 Roth Fund");
  const fund2028 = holdings.filter((h) => h.sleeve === "2028 Roth Fund");

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <main>
        {/* Header */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div
            style={{
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${color}30 15%, ${color}60 50%, ${color}30 85%, transparent 100%)`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color }}
            >
              Taxable Account
            </p>
            <h1
              className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
              style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
            >
              Individual Brokerage
            </h1>
            <p className="mt-2 max-w-xl font-mono text-[10px] leading-[1.5] text-[#5a6e82]">
              Weights and returns are sleeve-scoped. As of {fmtPortfolioDate(PORTFOLIO_UPDATED_AT)}.
            </p>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.7] text-[#3d4f66]">
              Taxable brokerage account organized into funding sleeves used to
              build future Roth IRA contributions.
            </p>
          </div>
        </section>

        {/* 2027 Roth Fund — visual sleeve dashboard */}
        {fund2027.length > 0 && (
          <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <SleeveDashboard
                label="Sleeve View"
                title="2027 Roth Fund"
                subtitle="Taxable brokerage sleeve used for future Roth funding."
                holdings={fund2027.map((h) => ({
                  ticker: h.ticker,
                  name: h.company,
                  href: h.ticker in etfProfiles ? `/etfs/${h.ticker}` : `/positions/${h.ticker}`,
                  portfolioWeightPct: h.portfolioPct,
                }))}
              />
            </div>
          </section>
        )}

        {/* 2028 Roth Fund — visual sleeve dashboard */}
        {fund2028.length > 0 && (
          <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <SleeveDashboard
                label="Sleeve View"
                title="2028 Roth Fund"
                subtitle="Growth-focused sleeve with high-conviction ideas and long-term potential."
                holdings={fund2028.map((h) => ({
                  ticker: h.ticker,
                  name: h.company,
                  href: `/positions/${h.ticker}`,
                  portfolioWeightPct: h.portfolioPct,
                }))}
              />
            </div>
          </section>
        )}
      </main>

      <SleeveFooter />
    </div>
  );
}

// ── Roth IRA color system ─────────────────────────────────────────────────────
// One color per category. The same value drives the tile background AND the
// matching donut slice so the page reads as one coordinated visual. Tech
// categories share a coordinated blue family; non-tech accents stay muted
// (olive for digital assets, warm sand for healthcare). Keep this list in
// sync with the `categorize` mapping inside RothIraView.

const CATEGORY_COLORS: Record<string, string> = {
  "Core Market":          "#1a2845",
  "AI / Semiconductors":  "#6a82a3",
  "Internet / AI":        "#4a6c8c",
  "Platform Tech":        "#5d7ea0",
  "Cybersecurity":        "#7a8694",
  "Enterprise Software":  "#4d7a82",
  "Space / Defense":      "#7a9088",
  "Digital Assets":       "#b5a96a",
  "Healthcare":           "#c19a72",
};

// Display order for the legend / color key (also used to filter to categories
// actually present in the current Roth holdings).
const CATEGORY_ORDER = [
  "Core Market",
  "AI / Semiconductors",
  "Internet / AI",
  "Platform Tech",
  "Cybersecurity",
  "Enterprise Software",
  "Space / Defense",
  "Digital Assets",
  "Healthcare",
];

// ── Roth IRA view ─────────────────────────────────────────────────────────────

function RothIraView() {
  const color = "#1a4a2e";

  // Category color system. Each holding maps to one bucket below; the same
  // color drives the tile background AND the matching donut slice so the
  // page reads as one coordinated visual system. Tech buckets stay in a
  // coordinated blue family; non-tech buckets use restrained warm accents.
  const categorize = (h: typeof rothIraHoldings[number]): string => {
    if (h.subcategory === "Internet / AI") return "Internet / AI";
    if (h.subcategory === "Cybersecurity") return "Cybersecurity";
    if (h.subcategory === "Enterprise SaaS") return "Enterprise Software";
    return h.theme ?? "Other";
  };
  const tickersByCategory = new Map<string, string[]>();
  for (const h of rothIraHoldings) {
    const c = categorize(h);
    const arr = tickersByCategory.get(c) ?? [];
    arr.push(h.ticker);
    tickersByCategory.set(c, arr);
  }
  const visibleCategories = CATEGORY_ORDER.filter((c) => tickersByCategory.has(c));

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <QuotesProvider>
        <main>
          {/* Header */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div
              style={{
                height: "2px",
                background: `linear-gradient(90deg, transparent 0%, ${color}30 15%, ${color}60 50%, ${color}30 85%, transparent 100%)`,
              }}
            />
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
              <p
                className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color }}
              >
                Account View
              </p>
              <div className="flex items-end justify-between gap-8">
                <div className="min-w-0">
                  <h1
                    className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
                    style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
                  >
                    Roth Retirement Account
                  </h1>
                  <p className="mt-2 max-w-xl font-mono text-[10px] leading-[1.5] text-[#5a6e82]">
                    Weights use manually recorded share counts and delayed market prices when available, with fallback weights when pricing is unavailable. As of {fmtPortfolioDate(PORTFOLIO_UPDATED_AT)}.
                  </p>
                  <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-[#3d4f66]">
                    Roth IRA · Long-Term Compounding · Tax-Advantaged Growth
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className="font-mono font-bold leading-none tracking-tight"
                    style={{ color, fontSize: "clamp(3.5rem,5.5vw,5rem)" }}
                  >
                    {rothIraHoldings.filter((h) => h.portfolioWeightPct > 0).length}
                  </p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#5a6e82]">
                    positions
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Holdings — circular tiles + full-width portfolio weighting donut.
              Per-holding color drives both the tile background and the donut
              slice. The per-ticker legend is suppressed; the page renders its
              own category color key below. */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <SleeveDashboard
                label="Holdings"
                donutWide
                showLegend={false}
                holdings={rothIraHoldings.map((h) => ({
                  ticker: h.ticker,
                  name: h.company,
                  href: h.ticker in etfProfiles ? `/etfs/${h.ticker}` : `/positions/${h.ticker}`,
                  portfolioWeightPct: h.portfolioWeightPct,
                  color: CATEGORY_COLORS[categorize(h)] ?? "#5a6e82",
                }))}
              />
            </div>
          </section>

          {/* Category color key — one row per sector with swatch, name, and
              tickers in that bucket. Mirrors the colors used in the tiles
              and donut so the page reads as one coordinated system. */}
          <section
            className="border-b"
            style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
              <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6e82]">
                Color Key · Sector &amp; Category
              </p>
              <p className="mb-10 text-center font-mono text-[10px] text-[#7a8799]">
                Tech buckets share a coordinated blue family. Non-tech buckets use restrained warm accents.
              </p>
              <div className="mx-auto grid max-w-5xl gap-x-8 gap-y-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCategories.map((cat) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{
                        background: CATEGORY_COLORS[cat],
                        boxShadow: "0 0 0 1px rgba(15,30,53,0.06)",
                      }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium text-[#0f1e35]">{cat}</p>
                      <p className="font-mono text-[10px] tracking-[0.06em] text-[#7a8799]">
                        {(tickersByCategory.get(cat) ?? []).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Previous Holdings — moved to the bottom */}
          {getPreviousHoldingsBySleeve("roth-ira").length > 0 && (
            <section
              className="border-b"
              style={{ borderColor: "rgba(15,30,53,0.08)" }}
            >
              <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Previous Holdings
                </p>
                <p className="mb-10 font-mono text-[10px] text-[#5a6e82]">
                  Archived positions — research records with full exit analysis.
                </p>
                <div className="divide-y" style={{ borderColor: "rgba(15,30,53,0.07)" }}>
                  {getPreviousHoldingsBySleeve("roth-ira").map((h) => {
                    const [fy, fm, fd] = h.ownedFrom.split("-").map(Number);
                    const [ty, tm, td] = h.ownedTo.split("-").map(Number);
                    const from = new Date(fy, fm - 1, fd).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                    const to = new Date(ty, tm - 1, td).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <Link
                        key={h.ticker}
                        href={`/archive/${h.ticker}`}
                        className="group flex items-center justify-between gap-6 py-5 transition-colors"
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-[15px] font-semibold text-[#0f1e35] transition-colors group-hover:text-[#1a4a2e]">
                            {h.ticker}
                          </span>
                          <span className="hidden text-[13px] text-[#5a6e82] sm:block">
                            {h.company}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-6">
                          <span className="hidden font-mono text-[10px] text-[#5a6e82] sm:block">
                            {from} → {to}
                          </span>
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: "#8b2530", opacity: 0.7 }}
                          >
                            {h.exitType}
                          </span>
                          <span className="font-mono text-[10px] text-[#5a6e82] transition-colors group-hover:text-[#0f1e35]">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

        </main>
      </QuotesProvider>

      <SleeveFooter />
    </div>
  );
}

