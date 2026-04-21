import { holdings } from "@/data/holdings";
import HoldingsTable from "./HoldingsTable";
import AllocationChart, { CARD_BG } from "./AllocationChart";
import { LastUpdated } from "./QuoteCell";

export default function FullHoldingsSection() {
  return (
    <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">

        {/* Header row */}
        <div className="mb-12 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              All Holdings
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
              Complete Portfolio
            </h2>
            <div className="mt-2 flex items-center gap-4">
              <p className="font-mono text-sm text-[#7a8799]">
                {holdings.length} positions across 3 themes
              </p>
              <LastUpdated />
            </div>
          </div>

          {/* Allocation chart card */}
          <div
            className="rounded-2xl px-10 py-8"
            style={{
              background: CARD_BG,
              border: "1px solid rgba(15,30,53,0.09)",
              boxShadow: "0 1px 4px rgba(15,30,53,0.05)",
            }}
          >
            <AllocationChart />
          </div>
        </div>

        <HoldingsTable holdings={holdings} showCategory />
      </div>
    </section>
  );
}
