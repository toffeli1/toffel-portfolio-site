import { Category, Holding } from "@/data/holdings";
import HoldingsTable from "./HoldingsTable";

const COLOR: Record<Category, string> = {
  AI: "#1a3a5c",
  "Defense / Drone": "#8b2530",
  Energy: "#1a4a2e",
};

interface Props {
  category: Category;
  description: string;
  holdings: Holding[];
}

export default function CategorySection({ category, description, holdings }: Props) {
  const color = COLOR[category];
  const totalPct = holdings.reduce((s, h) => s + h.portfolioPct, 0);
  const subcats = [...new Set(holdings.map((h) => h.subcategory))];

  return (
    <section
      id={category.toLowerCase().replace(/\s*\/\s*/g, "-").replace(/\s+/g, "-")}
      className="border-b"
      style={{ borderColor: "rgba(15,30,53,0.08)" }}
    >
      {/* Gradient rule */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(90deg, transparent 0%, ${color}30 15%, ${color}60 50%, ${color}30 85%, transparent 100%)`,
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">

        {/* Section header */}
        <div className="mb-8 flex items-end justify-between gap-8">
          <div className="min-w-0">
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color }}
            >
              Portfolio Theme
            </p>
            <h2
              className="font-bold leading-[0.93] tracking-tight text-[#0f1e35]"
              style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}
            >
              {category}
            </h2>
            <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-[#3d4f66]">
              {description}
            </p>
          </div>

          {/* Allocation anchor */}
          <div className="shrink-0 text-right">
            <p
              className="font-mono font-bold leading-none tracking-tight"
              style={{ color, fontSize: "clamp(3.75rem,6.5vw,6rem)" }}
            >
              {totalPct.toFixed(0)}%
            </p>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
              of portfolio
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div
          className="mb-7 flex flex-wrap items-center gap-2 pb-7"
          style={{ borderBottom: "1px solid rgba(15,30,53,0.07)" }}
        >
          <span className="font-mono text-[11px] text-[#7a8799]">
            {holdings.length} position{holdings.length !== 1 ? "s" : ""}
          </span>
          <span className="font-mono text-[#a8b2bd]">&nbsp;·&nbsp;</span>
          {subcats.map((s) => (
            <span
              key={s}
              className="rounded px-2.5 py-1 font-mono text-[10px] text-[#7a8799]"
              style={{ border: "1px solid rgba(15,30,53,0.09)" }}
            >
              {s}
            </span>
          ))}
        </div>

        <HoldingsTable holdings={holdings} showCategory={false} />
      </div>
    </section>
  );
}
