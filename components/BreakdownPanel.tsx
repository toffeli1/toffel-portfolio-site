import type { SleeveHolding, AssetType, MarketCapBucket, CountryBucket } from "@/data/sleeveHoldings";

// ── weight helpers ────────────────────────────────────────────────────────────

function weightedItems<T extends string>(
  holdings: SleeveHolding[],
  getValue: (h: SleeveHolding) => T | undefined,
  order: T[]
): { label: T; weightPct: number; count: number }[] {
  const eligible = holdings.filter((h) => getValue(h) !== undefined);
  const totalWeight = eligible.reduce((s, h) => s + h.portfolioWeightPct, 0);

  return order
    .map((label) => {
      const matched = holdings.filter((h) => getValue(h) === label);
      return {
        label,
        weightPct: totalWeight > 0
          ? (matched.reduce((s, h) => s + h.portfolioWeightPct, 0) / totalWeight) * 100
          : 0,
        count: matched.length,
      };
    })
    .filter((item) => item.weightPct > 0);
}

const COUNTRY_COLORS: Record<CountryBucket, string> = {
  US: "#1a3a5c",
  "Latin America": "#8b2530",
  International: "#1a4a2e",
};

const CAP_COLORS: Record<MarketCapBucket, string> = {
  "Mega Cap": "#1a3a5c",
  "Large Cap": "#2a5080",
  "Mid Cap": "#7a3a18",
  "Small Cap": "#1a4a2e",
};

const TYPE_COLORS: Record<AssetType, string> = {
  Equity: "#1a3a5c",
  ETF: "#1a4a2e",
  "Crypto-linked ETF": "#8b2530",
};

// ── BreakdownSection ──────────────────────────────────────────────────────────

function BreakdownSection({
  title,
  items,
  note,
  colors,
}: {
  title: string;
  items: { label: string; weightPct: number; count: number }[];
  note?: string;
  colors: Record<string, string>;
}) {
  const maxWeight = Math.max(...items.map((i) => i.weightPct), 1);

  return (
    <div
      className="rounded-2xl p-7"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
        {title}
      </p>
      <div className="space-y-4">
        {items.map(({ label, weightPct, count }) => {
          const color = colors[label] ?? "#1a3a5c";
          return (
            <div key={label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="font-mono text-[11px] text-[#3d4f66]">{label}</span>
                <span className="font-mono text-[10px] tabular-nums text-[#7a8799]">
                  {weightPct.toFixed(1)}%
                  <span className="ml-1.5 text-[9px] text-[#a8b2bd]">
                    ({count})
                  </span>
                </span>
              </div>
              <div
                className="overflow-hidden rounded-full"
                style={{ background: "rgba(15,30,53,0.07)", height: 4 }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(weightPct / maxWeight) * 100}%`,
                    backgroundColor: color,
                    opacity: 0.72,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 font-mono text-[9px] text-[#a8b2bd]">
        {note ?? "weighted by portfolio weight %"}
      </p>
    </div>
  );
}

// ── BreakdownPanel ────────────────────────────────────────────────────────────

export default function BreakdownPanel({ holdings }: { holdings: SleeveHolding[] }) {
  const countryItems = weightedItems<CountryBucket>(
    holdings,
    (h) => h.country,
    ["US", "Latin America", "International"]
  );

  const capItems = weightedItems<MarketCapBucket>(
    holdings,
    (h) => h.marketCap,
    ["Mega Cap", "Large Cap", "Mid Cap", "Small Cap"]
  );

  const typeItems = weightedItems<AssetType>(
    holdings,
    (h) => h.assetType,
    ["Equity", "ETF", "Crypto-linked ETF"]
  );

  // note how much weight is uncategorized by market cap (e.g. crypto ETFs)
  const totalWeight = holdings.reduce((s, h) => s + h.portfolioWeightPct, 0);
  const capCoveredWeight = holdings
    .filter((h) => h.marketCap !== undefined)
    .reduce((s, h) => s + h.portfolioWeightPct, 0);
  const capUncovered = totalWeight - capCoveredWeight;
  const capNote =
    capUncovered > 0.5
      ? `weighted by portfolio weight % · ${capUncovered.toFixed(1)}% uncategorized`
      : "weighted by portfolio weight %";

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <BreakdownSection
        title="By Country"
        items={countryItems}
        colors={COUNTRY_COLORS}
      />
      <BreakdownSection
        title="By Market Cap"
        items={capItems}
        note={capNote}
        colors={CAP_COLORS}
      />
      <BreakdownSection
        title="By Asset Type"
        items={typeItems}
        colors={TYPE_COLORS}
      />
    </div>
  );
}
