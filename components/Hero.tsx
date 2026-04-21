import { holdings, categoryAllocations } from "@/data/holdings";

export default function Hero() {
  const totalPositions = holdings.length;

  return (
    <section className="relative overflow-hidden border-b" style={{ borderColor: "rgba(15,30,53,0.1)" }}>
      {/* Subtle dot texture */}
      <div className="absolute inset-0 hero-grid" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:flex lg:min-h-[72vh] lg:items-center lg:px-12 lg:py-0">

        {/* ── Left ──────────────────────────────────── */}
        <div className="lg:w-[54%] lg:pr-20">
          <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.3em] text-[#7a8799]">
            Equity Portfolio&ensp;·&ensp;Long-Only&ensp;·&ensp;High Conviction
          </p>

          <h1
            className="font-bold leading-[0.93] tracking-[-0.03em] text-[#0f1e35]"
            style={{ fontSize: "clamp(3.25rem,7vw,6.5rem)" }}
          >
            Investment
            <br />
            Portfolio
          </h1>

          <p className="mt-8 max-w-[360px] text-[15px] leading-[1.7] text-[#3d4f66]">
            Concentrated equity exposure across three structural themes — AI
            infrastructure, defense autonomy, and the energy transition — built
            for long-cycle compounding.
          </p>
        </div>

        {/* ── Right: allocation card ─────────────────── */}
        <div className="mt-14 lg:mt-0 lg:w-[46%]">
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,30,53,0.1)",
              boxShadow: "0 2px 24px rgba(15,30,53,0.06)",
            }}
          >
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              Portfolio Allocation
            </p>

            <div className="space-y-6">
              {categoryAllocations.map((c) => (
                <div key={c.category}>
                  <div className="mb-2.5 flex items-end justify-between">
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.16em]"
                      style={{ color: c.color }}
                    >
                      {c.category}
                    </span>
                    <span
                      className="font-mono text-[2rem] font-bold leading-none"
                      style={{ color: c.color }}
                    >
                      {c.pct}%
                    </span>
                  </div>
                  <div
                    className="h-[5px] w-full overflow-hidden rounded-full"
                    style={{ background: "rgba(15,30,53,0.07)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.pct}%`,
                        backgroundColor: c.color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="mt-9 grid grid-cols-3 gap-0 pt-7"
              style={{ borderTop: "1px solid rgba(15,30,53,0.07)" }}
            >
              {[
                { value: String(totalPositions), label: "Holdings" },
                { value: "3", label: "Themes" },
                { value: "Long-only", label: "Strategy" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`${i > 0 ? "pl-5" : ""}`}
                  style={i > 0 ? { borderLeft: "1px solid rgba(15,30,53,0.07)" } : {}}
                >
                  <p className="font-mono text-xl font-bold text-[#0f1e35]">{s.value}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8b2bd]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
