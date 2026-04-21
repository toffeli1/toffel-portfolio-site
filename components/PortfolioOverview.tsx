import { categoryAllocations, getHoldingsByCategory, holdings, Category } from "@/data/holdings";

export default function PortfolioOverview() {
  return (
    <section
      className="border-b"
      style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">

        {/* Section heading */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Overview
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
              Portfolio Themes
            </h2>
          </div>
          <p className="hidden font-mono text-sm text-[#7a8799] sm:block">
            {holdings.length} positions total
          </p>
        </div>

        <div className="grid items-start gap-5 sm:grid-cols-3">
          {categoryAllocations.map((cat) => (
            <CategoryCard
              key={cat.category}
              category={cat.category}
              pct={cat.pct}
              color={cat.color}
              description={cat.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  pct,
  color,
  description,
}: {
  category: Category;
  pct: number;
  color: string;
  description: string;
}) {
  const catHoldings = getHoldingsByCategory(category);
  const maxPct = Math.max(...catHoldings.map((h) => h.portfolioPct));

  return (
    <div
      className="rounded-2xl p-9 transition-colors bg-white hover:bg-[#fdfaf6]"
      style={{
        borderLeft: `3px solid ${color}`,
        boxShadow: "0 1px 4px rgba(15,30,53,0.06)",
      }}
    >
      {/* Label + count */}
      <div className="mb-1 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color }}>
          {category}
        </p>
        <span className="font-mono text-[10px] text-[#a8b2bd]">
          {catHoldings.length}&thinsp;pos
        </span>
      </div>

      {/* Large % */}
      <p
        className="font-mono text-6xl font-bold leading-none tracking-tight"
        style={{ color }}
      >
        {pct}%
      </p>

      {/* Description */}
      <p className="mt-3.5 text-[12.5px] leading-[1.65] text-[#5a6e82]">
        {description}
      </p>

      {/* Divider */}
      <div className="my-7 h-px" style={{ background: "rgba(15,30,53,0.07)" }} />

      {/* Holdings mini-list */}
      <div className="space-y-3.5">
        {catHoldings.map((h) => (
          <div key={h.ticker} className="flex items-center gap-3">
            <span className="w-12 font-mono text-xs font-semibold text-[#0f1e35]">
              {h.ticker}
            </span>
            <div
              className="flex-1 overflow-hidden rounded-full"
              style={{ background: "rgba(15,30,53,0.07)" }}
            >
              <div
                className="h-[3px] rounded-full"
                style={{
                  width: `${(h.portfolioPct / maxPct) * 100}%`,
                  backgroundColor: color,
                  opacity: 0.8,
                }}
              />
            </div>
            <span className="w-10 text-right font-mono text-[11px] text-[#7a8799]">
              {h.portfolioPct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
