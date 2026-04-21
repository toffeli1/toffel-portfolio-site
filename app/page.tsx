import Link from "next/link";
import { portfolios } from "@/data/portfolios";
import { holdings } from "@/data/holdings";
import { rothIraHoldings, etfsSleeveHoldings } from "@/data/sleeveHoldings";

const HOLDING_COUNTS: Record<string, number> = {
  "retail-with-friends": holdings.length,
  "roth-ira": rothIraHoldings.length,
  "etfs": etfsSleeveHoldings.length,
};

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(250,247,242,0.94)",
          borderBottom: "1px solid rgba(15,30,53,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd]">
            Portfolio
          </span>
          <div className="hidden items-center gap-8 sm:flex">
            {portfolios.map((p) => (
              <Link
                key={p.slug}
                href={`/portfolio/${p.slug}`}
                className="font-mono text-[11px] text-[#a8b2bd] transition-colors duration-150 hover:text-[#0f1e35]"
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden border-b"
          style={{ borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="absolute inset-0 hero-grid" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-12">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Investment Portfolio
            </p>
            <h1
              className="font-bold leading-[0.88] tracking-[-0.03em] text-[#0f1e35]"
              style={{ fontSize: "clamp(3.5rem,8vw,7rem)" }}
            >
              Portfolio
              <br />
              Dashboard
            </h1>
            <p className="mt-7 max-w-lg text-[15px] leading-[1.75] text-[#3d4f66]">
              Three sleeves. Thematic equity, long-term retirement, and core ETF
              exposure. Public investment notes for informational purposes only.
            </p>
          </div>
        </section>

        {/* ── Sleeve Grid ──────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Sleeves
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
                  Three Accounts
                </h2>
              </div>
              <p className="hidden font-mono text-sm text-[#7a8799] sm:block">
                {holdings.length + rothIraHoldings.length + etfsSleeveHoldings.length} positions total
              </p>
            </div>

            <div className="grid items-start gap-5 sm:grid-cols-3">
              {portfolios.map((p) => (
                <SleeveCard
                  key={p.slug}
                  slug={p.slug}
                  title={p.title}
                  subtitle={p.subtitle}
                  description={p.description}
                  color={p.color}
                  themes={p.themes}
                  holdingCount={HOLDING_COUNTS[p.slug] ?? 0}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-[#a8b2bd]">
              For informational purposes only. Not financial advice.
            </p>
            <p className="font-mono text-[10px] text-[#a8b2bd]">
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Sleeve card ───────────────────────────────────────────────────────────────

function SleeveCard({
  slug,
  title,
  subtitle,
  description,
  color,
  themes,
  holdingCount,
}: {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  themes: string[];
  holdingCount: number;
}) {
  return (
    <Link href={`/portfolio/${slug}`} className="group block h-full">
      <div
        className="flex h-full flex-col rounded-2xl p-9 transition-colors bg-white hover:bg-[#fdfaf6]"
        style={{
          borderLeft: `3px solid ${color}`,
          boxShadow: "0 1px 4px rgba(15,30,53,0.06)",
        }}
      >
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color }}
        >
          {subtitle}
        </p>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-[#0f1e35]">
          {title}
        </h2>
        <p className="mt-3.5 text-[12.5px] leading-[1.65] text-[#5a6e82]">
          {description}
        </p>

        <div
          className="my-6 h-px"
          style={{ background: "rgba(15,30,53,0.07)" }}
        />

        <div className="mb-5 flex flex-wrap gap-1.5">
          {themes.map((t) => (
            <span
              key={t}
              className="rounded px-2.5 py-1 font-mono text-[9px] text-[#7a8799]"
              style={{ border: "1px solid rgba(15,30,53,0.09)" }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#7a8799]">
            {holdingCount} position{holdingCount !== 1 ? "s" : ""}
          </span>
          <span
            className="font-mono text-[11px] text-[#a8b2bd] transition-colors group-hover:text-[#0f1e35]"
          >
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
