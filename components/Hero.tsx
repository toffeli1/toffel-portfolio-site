export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b" style={{ borderColor: "rgba(15,30,53,0.1)" }}>
      <div className="absolute inset-0 hero-grid" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#7a8799]">
          Taxable Account&ensp;·&ensp;Active Research
        </p>

        <h1
          className="font-bold leading-[0.93] tracking-[-0.03em] text-[#0f1e35]"
          style={{ fontSize: "clamp(3.25rem,7vw,6.5rem)" }}
        >
          Individual
          <br />
          Brokerage
        </h1>

        <p className="mt-8 max-w-[480px] text-[15px] leading-[1.7] text-[#3d4f66]">
          Taxable brokerage account focused on ETF-based market exposure,
          semiconductor cyclicality, Bitcoin exposure, and select high-conviction
          individual equities.
        </p>
        <p className="mt-4 max-w-[480px] text-[13px] leading-[1.7] text-[#7a8799]">
          Current holdings emphasize broad-market ETFs, thematic ETF exposure,
          digital asset exposure, and selected individual equity research.
        </p>
      </div>
    </section>
  );
}
