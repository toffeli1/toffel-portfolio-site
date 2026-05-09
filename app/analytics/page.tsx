import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { QuotesProvider } from "@/components/QuotesProvider";
import { PORTFOLIO_UPDATED_AT, fmtPortfolioDate } from "@/lib/config";

export const metadata = {
  title: "Analytics",
  description:
    "Portfolio attribution, exposure breakdown, and concentration metrics across account and exposure views.",
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">

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
            Attribution, exposure breakdown, and concentration metrics across account and exposure views.
            Individual Brokerage attribution is unavailable.
          </p>
          <p className="mt-4 font-mono text-[10px] text-[#5a6e82]">
            Data as of {fmtPortfolioDate(PORTFOLIO_UPDATED_AT)}
          </p>
        </div>
      </section>

      <QuotesProvider>
        <AnalyticsDashboard />
      </QuotesProvider>

    </div>
  );
}
