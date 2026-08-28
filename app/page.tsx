import Link from "next/link";
import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";
import { INK, BODY, MUTED, FAINT, HAIRLINE, HERO_Y, SECTION_Y } from "@/lib/theme";

export default function OverviewPage() {
  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>

      <main>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden border-b"
          style={{ borderColor: HAIRLINE }}
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

          <div className={`relative mx-auto max-w-7xl px-6 ${HERO_Y} lg:px-12`}>
            <Eyebrow className="mb-5">Investment Portfolio</Eyebrow>
            <h1
              className="font-display font-semibold leading-[0.95] tracking-[-0.01em]"
              style={{ fontSize: "clamp(3.2rem,7vw,6rem)", color: INK }}
            >
              Portfolio
              <br />
              Dashboard
            </h1>
            <p className="mt-7 max-w-lg text-[15px] leading-[1.75]" style={{ color: MUTED }}>
              A documented investment process, built in public.
            </p>
          </div>
        </section>

        {/* ── About ────────────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-7xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-8">About</Eyebrow>

            <div className="flex items-start gap-14">

              {/* Text */}
              <div className="flex-1">
                <p className="text-[15px] leading-[2.0]" style={{ color: BODY }}>
                  I&apos;m Isaac Toffel, an Economics and Data Science student at
                  Northeastern University, interested in equity research and asset
                  management. This site documents how I think about portfolio
                  construction, position sizing, and thesis-driven investing in my
                  investment account.
                </p>
                <p className="mt-6 text-[15px] leading-[2.0]" style={{ color: BODY }}>
                  I won&apos;t be right on every position. That&apos;s fine. What I want
                  is a repeatable process: track decisions honestly, then check whether the
                  outcome came from good reasoning or luck. This site is that record, in
                  public.
                </p>

                {/* Identity strip */}
                <div
                  className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t pt-8"
                  style={{ borderColor: HAIRLINE }}
                >
                  {[
                    { label: "Education",    value: "Northeastern University" },
                    { label: "Experience",   value: "State Street" },
                    { label: "Certification",value: "CFA Level I Candidate, Feb 2027 sitting" },
                    { label: "LinkedIn",     value: "Isaac Toffel", href: "https://www.linkedin.com/in/isaac-toffel" },
                    { label: "Email",        value: "toffel.i@northeastern.edu", href: "mailto:toffel.i@northeastern.edu" },
                  ].map(({ label, value, href }) => (
                    <div key={label}>
                      <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.2em]" style={{ color: "#b0bac5" }}>
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("mailto") ? undefined : "_blank"}
                          rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                          className="font-mono text-[11px] transition-colors"
                          style={{ color: MUTED, textDecoration: "none" }}
                        >
                          {value}
                          <span className="ml-0.5 opacity-40" style={{ fontSize: 9 }}>↗</span>
                        </a>
                      ) : (
                        <p className="font-mono text-[11px]" style={{ color: MUTED }}>{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile photo + caption */}
              <div className="hidden shrink-0 lg:block">
                <div
                  className="overflow-hidden"
                  style={{
                    width: 248,
                    height: 310,
                    borderRadius: 6,
                    border: `1px solid ${HAIRLINE}`,
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
                <p className="mt-3 font-mono text-[9px]" style={{ color: MUTED }}>
                  Isaac Toffel
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Portfolio as a System ─────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-7xl px-6 ${SECTION_Y} lg:px-12`}>
            <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-start md:gap-16">
              <div>
                <div className="mb-10">
                  <Eyebrow>Framework</Eyebrow>
                  <h2 className="font-display text-[28px] font-semibold tracking-tight" style={{ color: INK }}>
                    Portfolio as a System
                  </h2>
                </div>

                <div className="max-w-3xl space-y-7">
                  <p className="text-[15px] leading-[1.9]" style={{ color: BODY }}>
                    I treat the portfolio as one system, not a pile of separate bets.
                    Every position has a job. Sizing tracks how well it does that job,
                    not how much I like the company. I&apos;d rather concentrate capital
                    where the upside is asymmetric than own a long list of names that
                    just look interesting.
                  </p>
                  <p
                    className="border-t pt-7 text-[15px] leading-[1.9]"
                    style={{ borderColor: HAIRLINE, color: BODY }}
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
                  className="block text-[16px] font-semibold transition-colors duration-150 ease-out"
                  style={{
                    minWidth: 220,
                    padding: "14px 18px",
                    borderRadius: 6,
                    border: `1px solid ${INK}`,
                    color: INK,
                  }}
                >
                  Investments
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Investment Policy ──────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-7xl px-6 ${SECTION_Y} lg:px-12`}>
            <div className="mb-8">
              <Eyebrow>Discipline</Eyebrow>
              <h2 className="font-display text-[28px] font-semibold tracking-tight" style={{ color: INK }}>
                Investment Policy
              </h2>
            </div>

            <div className="grid gap-px md:grid-cols-2" style={{ background: HAIRLINE }}>
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
                <div key={title} className="p-7" style={{ background: "#faf7f2" }}>
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: FAINT }}>
                    {title}
                  </p>
                  <p className="text-[14px] leading-[1.85]" style={{ color: BODY }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px]" style={{ color: MUTED }}>
              Isaac Toffel · For informational purposes only. Not financial advice.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px]" style={{ color: MUTED }}>
              <a
                href="https://www.linkedin.com/in/isaac-toffel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2 transition-colors hover:opacity-70"
                style={{ textDecoration: "none" }}
              >
                LinkedIn ↗
              </a>
              <span aria-hidden="true" style={{ color: "#a8b2bd" }}>·</span>
              <a
                href="mailto:toffel.i@northeastern.edu"
                className="inline-block py-2 transition-colors hover:opacity-70"
                style={{ textDecoration: "none" }}
              >
                toffel.i@northeastern.edu
              </a>
              <span aria-hidden="true" style={{ color: "#a8b2bd" }}>·</span>
              <span style={{ color: FAINT }}>
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
