import Link from "next/link";
import { notFound } from "next/navigation";
import { previousHoldings, getPreviousHolding } from "@/data/previousHoldings";
import { ChartWrapper } from "@/components/ChartWrapper";

// ── Static generation ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  return previousHoldings.map((h) => ({ ticker: h.ticker }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const h = getPreviousHolding(ticker);
  if (!h) return {};
  return { title: `${ticker} — Archived Position` };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const a = new Date(fy, fm - 1, fd).getTime();
  const b = new Date(ty, tm - 1, td).getTime();
  return Math.round((b - a) / 86_400_000);
}

// ── Sleeve nav label ──────────────────────────────────────────────────────────

const SLEEVE_META: Record<string, { label: string; href: string; color: string }> = {
  "roth-ira": { label: "Roth IRA", href: "/portfolio/roth-ira", color: "#1a4a2e" },
  retail:     { label: "Speculative Individual Stocks", href: "/portfolio/retail-with-friends", color: "#1a3a5c" },
  etfs:       { label: "ETFs", href: "/portfolio/etfs", color: "#8b2530" },
};

// ── Research card ─────────────────────────────────────────────────────────────

function ResearchCard({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-8"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <p
        className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: accent ?? "#7a8799" }}
      >
        {label}
      </p>
      <p className="text-[14px] leading-[1.75] text-[#3d4f66]">{body}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const holding = getPreviousHolding(ticker);
  if (!holding) notFound();

  const sleeve = SLEEVE_META[holding.sleeve];
  const days = daysBetween(holding.ownedFrom, holding.ownedTo);
  const years = (days / 365).toFixed(1);

  const entryMarker =
    holding.estimatedEntryPrice !== undefined && !holding.purchaseLots
      ? ({ price: holding.estimatedEntryPrice, source: "estimated" } as const)
      : undefined;

  const exitMarker = { date: holding.ownedTo, reason: holding.exitType };

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(250,247,242,0.94)",
          borderBottom: "1px solid rgba(15,30,53,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <Link
            href={sleeve?.href ?? "/"}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
          >
            ← {sleeve?.label ?? "Overview"}
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{
                background: "rgba(139,37,48,0.08)",
                color: "#8b2530",
                border: "1px solid rgba(139,37,48,0.16)",
              }}
            >
              Archived
            </span>
            <span className="hidden font-mono text-[11px] text-[#a8b2bd] sm:block">
              {holding.ticker}
            </span>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div
            style={{
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(139,37,48,0.18) 15%, rgba(139,37,48,0.38) 50%, rgba(139,37,48,0.18) 85%, transparent 100%)",
            }}
          />
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
            {/* Labels row */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: sleeve?.color ?? "#1a4a2e" }}
              >
                {sleeve?.label ?? holding.sleeve} · Archived Position
              </p>
              {holding.subcategory && (
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]"
                  style={{
                    background: "rgba(15,30,53,0.05)",
                    color: "#7a8799",
                    border: "1px solid rgba(15,30,53,0.08)",
                  }}
                >
                  {holding.subcategory}
                </span>
              )}
            </div>

            {/* Ticker + company */}
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0">
                <h1
                  className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
                  style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
                >
                  {holding.ticker}
                </h1>
                <p className="mt-2 text-[15px] text-[#5a6e82]">{holding.company}</p>
              </div>

              {/* Exit classification */}
              <div
                className="shrink-0 rounded-2xl px-6 py-4"
                style={{
                  background: "rgba(139,37,48,0.04)",
                  border: "1px solid rgba(139,37,48,0.12)",
                }}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8b2bd]">
                  Exit Classification
                </p>
                <p
                  className="mt-1.5 font-mono text-[13px] font-semibold"
                  style={{ color: "#8b2530" }}
                >
                  {holding.exitType}
                </p>
              </div>
            </div>

            {/* Holding period stats */}
            <div className="mt-10 flex flex-wrap gap-10">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                  Opened
                </p>
                <p className="mt-1 font-mono text-[13px] text-[#0f1e35]">
                  {formatDate(holding.ownedFrom)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                  Closed
                </p>
                <p className="mt-1 font-mono text-[13px] text-[#0f1e35]">
                  {formatDate(holding.ownedTo)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                  Held
                </p>
                <p className="mt-1 font-mono text-[13px] text-[#0f1e35]">
                  {days} days · {years}y
                </p>
              </div>
              {holding.country && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                    Geography
                  </p>
                  <p className="mt-1 font-mono text-[13px] text-[#0f1e35]">
                    {holding.country}
                  </p>
                </div>
              )}
              {holding.marketCap && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                    Market Cap
                  </p>
                  <p className="mt-1 font-mono text-[13px] text-[#0f1e35]">
                    {holding.marketCap}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Chart ─────────────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Price History
            </p>
            <p className="mb-8 font-mono text-[10px] text-[#a8b2bd]">
              Full price history shown. Exit marker indicates the date of final sale.
            </p>
            <ChartWrapper
              ticker={holding.ticker}
              entryMarker={entryMarker}
              purchaseLots={holding.purchaseLots}
              averageCost={holding.averageCostPerShare}
              exitMarker={exitMarker}
              defaultRange="max"
            />
          </div>
        </section>

        {/* ── Research record ────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Research Record
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <ResearchCard
                label="Original Thesis"
                body={holding.originalThesis}
                accent="#1a4a2e"
              />
              <ResearchCard
                label="What Changed"
                body={holding.whatChanged}
                accent="#7a5c35"
              />
              <ResearchCard
                label="Why I Exited"
                body={holding.whyExited}
                accent="#8b2530"
              />
              <ResearchCard
                label="Lesson"
                body={holding.lesson}
                accent="#5a6e82"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex items-center justify-between">
            <Link
              href={sleeve?.href ?? "/"}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
            >
              ← {sleeve?.label ?? "Overview"}
            </Link>
            <p className="font-mono text-[10px] text-[#a8b2bd]">
              For informational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
