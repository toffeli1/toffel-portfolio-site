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
// Brand-derived colors per ticker. Each value is normalized toward the
// company's primary identity color while staying muted enough to read as one
// premium palette on the cream page background. The donut and the sector key
// both use these values directly.

const TICKER_BRAND_COLORS: Record<string, string> = {
  // Muted brand-derived hues. Used for donut slices, legend dots, and the
  // tile halo/ring or fill. Saturation is dialed down so the donut reads
  // cohesively; only FBTC stays vivid per spec.
  VOO:   "#a85460",  // dusty Vanguard red
  SMH:   "#3c5b8e",  // muted VanEck navy
  AMD:   "#3d3d44",  // slate charcoal
  FBTC:  "#f7931a",  // Bitcoin orange (kept vivid)
  NBIS:  "#1c2336",  // deep navy (logo designed for dark bg + lime accent)
  GOOGL: "#5a82b8",  // muted Google blue
  MELI:  "#d4b540",  // muted MercadoLibre gold-yellow
  CRWD:  "#b85056",  // muted CrowdStrike red
  RKLB:  "#2a2424",  // dark charcoal with warmth
  META:  "#5179c4",  // muted Meta blue
  NOW:   "#2a4f5e",  // deep ServiceNow teal
  UNH:   "#486b96",  // muted UnitedHealth blue
  PENG:  "#d8af50",  // muted Penguin gold
  ASTS:  "#1c2a4a",  // dark navy
};

// Per-holding tile treatment. "ring" keeps the tile white with a soft
// colored halo (better for color-rich/light logos); "fill" paints the tile
// in the brand color (used for logos designed for dark/colored backgrounds).
const TICKER_LOGO_TREATMENT: Record<string, "ring" | "fill"> = {
  VOO:   "ring",
  SMH:   "ring",
  AMD:   "ring",
  GOOGL: "ring",
  MELI:  "ring",
  CRWD:  "ring",
  META:  "ring",
  UNH:   "ring",
  FBTC:  "fill",
  NBIS:  "fill",
  NOW:   "fill",
  RKLB:  "fill",
  ASTS:  "fill",
  PENG:  "fill",
};

// Tickers whose ring should render thinner / lower-opacity for a cleaner,
// less-strong border. Applies only when the ticker uses the "ring" treatment.
const TICKER_RING_SOFT: Set<string> = new Set(["GOOGL", "META"]);

// Sector groups for the donut order and the sector key below it. Within each
// sector, holdings are sorted by weight (desc) at render time so the largest
// position in each group leads.
const ROTH_SECTORS: { sector: string; tickers: string[] }[] = [
  { sector: "Core Market",                         tickers: ["VOO"] },
  { sector: "AI / Semis / Infrastructure",         tickers: ["SMH", "AMD", "NBIS", "PENG"] },
  { sector: "Platform Tech / Internet / Software", tickers: ["GOOGL", "META", "NOW", "MELI", "CRWD"] },
  { sector: "Space / Defense / Connectivity",      tickers: ["RKLB", "ASTS"] },
  { sector: "Digital Assets",                      tickers: ["FBTC"] },
  { sector: "Healthcare",                          tickers: ["UNH"] },
];

// ── Roth IRA view ─────────────────────────────────────────────────────────────

function RothIraView() {
  const color = "#1a4a2e";

  // Order holdings by sector group, weight-desc within each group. This
  // controls both the visual order of the donut slices and the order of the
  // sector key below it, so related names sit next to each other.
  const byTicker = new Map(rothIraHoldings.map((h) => [h.ticker, h] as const));
  const orderedHoldings = ROTH_SECTORS.flatMap(({ tickers }) =>
    tickers
      .map((t) => byTicker.get(t))
      .filter((h): h is NonNullable<typeof h> => !!h)
      .sort((a, b) => b.portfolioWeightPct - a.portfolioWeightPct)
  );
  // Sector → present-in-portfolio tickers, in the same weight-desc order.
  const sectorGroups = ROTH_SECTORS.map(({ sector, tickers }) => ({
    sector,
    tickers: tickers
      .map((t) => byTicker.get(t))
      .filter((h): h is NonNullable<typeof h> => !!h)
      .sort((a, b) => b.portfolioWeightPct - a.portfolioWeightPct)
      .map((h) => h.ticker),
  })).filter((g) => g.tickers.length > 0);

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
              Slice colors come from each holding's brand identity. Holdings
              are ordered by sector group so related names sit next to each
              other in contiguous arcs. The per-ticker legend is suppressed;
              the sector key below carries the labels. */}
          <section
            className="border-b"
            style={{ borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
              <SleeveDashboard
                label="Holdings"
                donutWide
                showLegend={false}
                holdings={orderedHoldings.map((h) => ({
                  ticker: h.ticker,
                  name: h.company,
                  href: h.ticker in etfProfiles ? `/etfs/${h.ticker}` : `/positions/${h.ticker}`,
                  portfolioWeightPct: h.portfolioWeightPct,
                  color: TICKER_BRAND_COLORS[h.ticker] ?? "#5a6e82",
                  accentStyle: TICKER_LOGO_TREATMENT[h.ticker] ?? "ring",
                  accentRingSoft: TICKER_RING_SOFT.has(h.ticker),
                }))}
              />
            </div>
          </section>

          {/* Sector key — groups the active Roth holdings by sector and
              renders each ticker as a brand-color chip. Mirrors the donut's
              arc order so the page reads as one coordinated system. */}
          <section
            className="border-b"
            style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
          >
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
              <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6e82]">
                Sectors
              </p>
              <p className="mb-10 text-center font-mono text-[10px] text-[#7a8799]">
                Slice colors come from each holding&apos;s brand identity. Holdings are arranged by sector so related names sit next to each other.
              </p>
              <div className="mx-auto grid max-w-5xl gap-x-10 gap-y-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {sectorGroups.map(({ sector, tickers }) => (
                  <div key={sector} className="min-w-0">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5a6e82]">
                      {sector}
                    </p>
                    <ul className="space-y-1.5">
                      {tickers.map((t) => (
                        <li key={t} className="flex items-center gap-2.5">
                          <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              background: TICKER_BRAND_COLORS[t] ?? "#5a6e82",
                              boxShadow: "0 0 0 1px rgba(15,30,53,0.08)",
                            }}
                            aria-hidden
                          />
                          <span className="font-mono text-[11.5px] tracking-[0.06em] text-[#0f1e35]">
                            {t}
                          </span>
                          <span className="truncate text-[11px] text-[#5a6e82]">
                            {byTicker.get(t)?.company}
                          </span>
                        </li>
                      ))}
                    </ul>
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

