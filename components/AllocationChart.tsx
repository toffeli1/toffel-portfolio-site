// Pure CSS conic-gradient donut — server component, no bundle cost.
import { categoryAllocations, holdings } from "@/data/holdings";

// bgColor must match the card's background so gaps appear as true breaks.
function buildConic(items: { pct: number; color: string }[], bgColor: string, gapDeg = 2): string {
  let cursor = 0;
  const stops: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const { pct, color } = items[i];
    const span = (pct / 100) * 360;
    const fill = span - gapDeg;
    if (fill > 0) stops.push(`${color} ${cursor}deg ${cursor + fill}deg`);
    if (i < items.length - 1)
      stops.push(`${bgColor} ${cursor + fill}deg ${cursor + span}deg`);
    cursor += span;
  }
  return `conic-gradient(from -90deg, ${stops.join(", ")})`;
}

// Must match the card bg in FullHoldingsSection.
export const CARD_BG = "#ffffff";

export default function AllocationChart() {
  const gradient = buildConic(categoryAllocations, CARD_BG);
  const totalPositions = holdings.length;

  return (
    <div className="flex flex-wrap items-center gap-10">
      {/* Donut */}
      <div className="relative h-[160px] w-[160px] shrink-0">
        <div
          className="h-full w-full rounded-full"
          style={{
            background: gradient,
            WebkitMask: "radial-gradient(transparent 44%, #000 44%)",
            mask: "radial-gradient(transparent 44%, #000 44%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold text-[#0f1e35]">{totalPositions}</span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8b2bd]">
            holdings
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-4">
        {categoryAllocations.map((c) => (
          <div key={c.category} className="flex items-center gap-4">
            <div className="h-[3px] w-5 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="w-36 font-mono text-[11px] text-[#5a6e82]">{c.category}</span>
            <span className="font-mono text-xl font-bold" style={{ color: c.color }}>
              {c.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
