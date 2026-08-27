import Link from "next/link";
import Image from "next/image";

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">

      <main>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden border-b"
          style={{ borderColor: "rgba(15,30,53,0.08)" }}
        >
          {/* Background photo */}
          <Image
            src="/carter-zoom.webp"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          {/* Cream wash — reduced to let more of the photo show through */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(250,247,242,0.74)" }}
          />
          {/* Subtle grid texture on top */}
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
              A documented investment process, built in public.
            </p>
          </div>
        </section>

        {/* ── About ────────────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
              About
            </p>

            <div className="flex items-start gap-14">

              {/* Text */}
              <div className="flex-1">
                <p className="text-[15px] leading-[2.0] text-[#2d3d52]">
                  I&apos;m Isaac Toffel, an Economics and Data Science student at
                  Northeastern University, interested in equity research and asset
                  management. This site documents how I think about portfolio
                  construction, position sizing, and thesis-driven investing in my
                  investment account.
                </p>
                <p className="mt-6 text-[15px] leading-[2.0] text-[#2d3d52]">
                  I won&apos;t be right on every position. That&apos;s fine. What I want
                  is a repeatable process: track decisions honestly, then check whether the
                  outcome came from good reasoning or luck. This site is that record, in
                  public.
                </p>

                {/* Identity strip */}
                <div
                  className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t pt-8"
                  style={{ borderColor: "rgba(15,30,53,0.07)" }}
                >
                  {[
                    { label: "Education",    value: "Northeastern University" },
                    { label: "Experience",   value: "State Street" },
                    { label: "Certification",value: "CFA Level I Candidate, Feb 2027 sitting" },
                    { label: "LinkedIn",     value: "Isaac Toffel", href: "https://www.linkedin.com/in/isaac-toffel" },
                    { label: "Email",        value: "toffel.i@northeastern.edu", href: "mailto:toffel.i@northeastern.edu" },
                  ].map(({ label, value, href }) => (
                    <div key={label}>
                      <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-[#b0bac5]">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("mailto") ? undefined : "_blank"}
                          rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                          className="font-mono text-[11px] text-[#3d4f66] transition-colors hover:text-[#0f1e35]"
                          style={{ textDecoration: "none" }}
                        >
                          {value}
                          <span className="ml-0.5 opacity-40" style={{ fontSize: 9 }}>↗</span>
                        </a>
                      ) : (
                        <p className="font-mono text-[11px] text-[#3d4f66]">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile photo + caption */}
              <div className="hidden shrink-0 lg:block">
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{
                    width: 248,
                    height: 310,
                    boxShadow: "0 4px 24px rgba(15,30,53,0.10)",
                  }}
                >
                  <Image
                    src="/profile.png"
                    alt="Isaac Toffel"
                    width={248}
                    height={310}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <p className="mt-3 text-center font-mono text-[9px] text-[#5a6e82]">
                  Isaac Toffel
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Portfolio as a System ─────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
            <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-start md:gap-16">
              <div>
                <div className="mb-12">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                    Framework
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
                    Portfolio as a System
                  </h2>
                </div>

                <div className="max-w-3xl space-y-7">
              <p className="text-[15px] leading-[1.9] text-[#2d3d52]">
                I treat the portfolio as one system, not a pile of separate bets.
                Every position has a job. Sizing tracks how well it does that job,
                not how much I like the company. I&apos;d rather concentrate capital
                where the upside is asymmetric than own a long list of names that
                just look interesting.
              </p>
              <p
                className="border-t pt-7 text-[15px] leading-[1.9]"
                style={{ borderColor: "rgba(15,30,53,0.08)", color: "#2d3d52" }}
              >
                Two AI-labeled holdings can still fail for completely different
                reasons. NBIS&apos;s risk is hyperscalers undercutting independent
                GPU clouds on price. CBRS&apos;s risk is customer concentration, a
                handful of buyers deciding the outcome. Same label, different ways
                to lose, which is the diversification I actually care about. The
                portfolio keeps changing as positions prove or lose that case.
              </p>
                </div>
              </div>

              {/* Account button */}
              <div className="flex flex-col gap-3 md:min-w-[260px] md:pt-1">
                <Link
                  href="/portfolio/investments"
                  className="block rounded-xl border text-[16px] font-semibold text-[#0f1e35] transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-[rgba(15,30,53,0.045)]"
                  style={{
                    minWidth: 220,
                    padding: "14px 18px",
                    borderColor: "rgba(15,30,53,0.16)",
                    background: "rgba(250,247,242,0.8)",
                    boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
                  }}
                >
                  Investments
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Investment Policy ──────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
            <div className="mb-10">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Discipline
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
                Investment Policy
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  title: "Position sizing",
                  body: "The book is concentrated single names, plus sector, commodity, and cash sleeves. There is no broad-market index position today. Individual equities are sized on conviction, volatility, thesis maturity, and correlation with what is already owned, generally targeting around 10% with a soft 11.5% ceiling unless I explicitly re-underwrite the thesis. A position stays because it keeps earning its size.",
                },
                {
                  title: "When I trim or sell",
                  body: "A position moving above target doesn't trigger an automatic sell. I treat it as a signal to review the thesis. If the thesis has gotten better, I re-underwrite and let the bigger weight stand. If price ran ahead of the thesis, I trim back toward target. I also cut a position when the thesis breaks, valuation outruns the evidence, a better idea shows up, or the size grows past what I want in my risk budget.",
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl p-7"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(15,30,53,0.09)",
                    boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
                  }}
                >
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7a8799]">
                    {title}
                  </p>
                  <p className="text-[14px] leading-[1.85] text-[#2d3d52]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-[#5a6e82]">
              Isaac Toffel · For informational purposes only. Not financial advice.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-[#5a6e82]">
              <a
                href="https://www.linkedin.com/in/isaac-toffel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2 transition-colors hover:text-[#0f1e35]"
                style={{ textDecoration: "none" }}
              >
                LinkedIn ↗
              </a>
              <span aria-hidden="true" className="text-[#a8b2bd]">·</span>
              <a
                href="mailto:toffel.i@northeastern.edu"
                className="inline-block py-2 transition-colors hover:text-[#0f1e35]"
                style={{ textDecoration: "none" }}
              >
                toffel.i@northeastern.edu
              </a>
              <span aria-hidden="true" className="text-[#a8b2bd]">·</span>
              <span className="text-[#7a8799]">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

