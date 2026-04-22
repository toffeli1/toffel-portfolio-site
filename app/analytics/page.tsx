import Link from "next/link";
import { portfolios } from "@/data/portfolios";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export const metadata = {
  title: "Analytics · Portfolio",
  description: "Portfolio analytics: attribution, exposure, and concentration metrics.",
};

export default function AnalyticsPage() {
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
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
          >
            Portfolio
          </Link>
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
            <Link
              href="/analytics"
              className="font-mono text-[11px] text-[#0f1e35] transition-colors duration-150 hover:text-[#0f1e35]"
            >
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ borderColor: "rgba(15,30,53,0.08)" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
            Analytics
          </p>
          <h1
            className="font-bold leading-[0.9] tracking-[-0.03em] text-[#0f1e35]"
            style={{ fontSize: "clamp(2.5rem,5vw,4rem)" }}
          >
            Portfolio
            <br />
            Analytics
          </h1>
          <p className="mt-6 max-w-lg text-[14px] leading-[1.75] text-[#3d4f66]">
            Attribution, exposure breakdown, and concentration metrics across all three sleeves.
            Data is as-recorded; retail attribution is unavailable.
          </p>
        </div>
      </section>

      <AnalyticsDashboard />

    </div>
  );
}
