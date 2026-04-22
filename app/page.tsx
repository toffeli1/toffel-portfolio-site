import Link from "next/link";
import Image from "next/image";
import { portfolios } from "@/data/portfolios";
import { holdings } from "@/data/holdings";
import { rothIraHoldings, etfsSleeveHoldings } from "@/data/sleeveHoldings";

const HOLDING_COUNTS: Record<string, number> = {
  "retail-with-friends": holdings.length,
  "roth-ira": rothIraHoldings.length,
  "etfs": etfsSleeveHoldings.length,
};

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(250,247,242,0.94)",
          borderBottom: "1px solid rgba(15,30,53,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a8b2bd]">
            Portfolio
          </span>
          <div className="hidden items-center gap-8 sm:flex">
            {portfolios.map((p) => (
              <Link
                key={p.slug}
                href={`/portfolio/${p.slug}`}
                className="font-mono text-[11px] text-[#a8b2bd] transition-colors duration-150 hover:text-[#0f1e35]"
              >
                {p.title}
              </Link>
            ))}
            <Link
              href="/analytics"
              className="font-mono text-[11px] text-[#a8b2bd] transition-colors duration-150 hover:text-[#0f1e35]"
            >
              Analytics
            </Link>
          </div>
        </div>
      </nav>

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
              Three sleeves. Thematic equity, long-term retirement, and core ETF
              exposure. A documented investment process, built in public.
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
                  Hello, I&apos;m Isaac Toffel, an Economics and Data Science student at
                  Northeastern University. I&apos;m currently in the midst of my first
                  Co-op at State Street. I&apos;m also pursuing the CFA designation,
                  sitting for the first exam this fall.
                </p>
                <p className="mt-6 text-[15px] leading-[2.0] text-[#2d3d52]">
                  This site is a live record of how I think about capital allocation.
                  Working in finance has sharpened how I approach portfolio
                  construction — not just which names to own, but how conviction gets
                  sized, when a thesis should be updated, and what makes a
                  reallocation defensible. The CFA process has pushed that further.
                  The portfolio here is where those frameworks get applied directly.
                </p>
                <p className="mt-6 text-[15px] leading-[2.0] text-[#2d3d52]">
                  The goal isn&apos;t to be right about every position. It&apos;s to be
                  disciplined enough to know whether I was right for the right
                  reasons. Each holding has a testable thesis, each sleeve has a
                  role, and the site documents both. I think building a serious
                  process early — rather than collecting interesting-sounding
                  ideas — is what compounds over time. This is that attempt, in
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
                    { label: "Certification",value: "CFA Level I Candidate" },
                    { label: "LinkedIn",     value: "Isaac Toffel", href: "https://www.linkedin.com/feed/" },
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
                <p className="mt-3 text-center font-mono text-[9px] text-[#a8b2bd]">
                  Isaac Toffel
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Sleeve Grid ──────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                  Sleeves
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
                  Three Accounts
                </h2>
              </div>
              <p className="hidden font-mono text-sm text-[#7a8799] sm:block">
                {holdings.length + rothIraHoldings.length + etfsSleeveHoldings.length} positions total
              </p>
            </div>

            <div className="grid items-start gap-5 sm:grid-cols-3">
              {portfolios.map((p) => (
                <SleeveCard
                  key={p.slug}
                  slug={p.slug}
                  title={p.title}
                  subtitle={p.subtitle}
                  description={p.description}
                  role={p.role}
                  color={p.color}
                  themes={p.themes}
                  holdingCount={HOLDING_COUNTS[p.slug] ?? 0}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Portfolio as a System ─────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
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
                This portfolio is built as a system, not a collection of disconnected
                ideas. Every position has a role, every sleeve has a job, and sizing
                reflects conviction, risk, time horizon, and how directly a name
                expresses the underlying theme. The goal is not to own a large number
                of interesting companies. The goal is to concentrate capital where the
                upside is asymmetric, the thesis is understandable, and the portfolio
                construction makes sense at the total-book level.
              </p>
              <p className="text-[15px] leading-[1.9] text-[#2d3d52]">
                The portfolio is organized around three distinct functions. The first
                is a higher-conviction thematic sleeve, where capital is allocated to
                areas I believe can materially outperform over a multi-year horizon,
                especially where the market may still be underestimating the duration
                or breadth of the opportunity. The second is a retirement sleeve, which
                blends core market exposure with selective growth and measured
                speculative positions. The third is a cleaner ETF sleeve that provides
                broad exposure, keeps the portfolio grounded, and serves as a
                benchmark-aware core.
              </p>
              <p className="text-[15px] leading-[1.9] text-[#2d3d52]">
                Position size is intentional. Larger weights are reserved for names
                that sit closest to the center of the thesis, where the business model,
                demand driver, and reason for owning it are most direct. Smaller
                weights are used for emerging ideas, more speculative expressions, or
                positions where the upside may be meaningful but the path is less
                certain. This means a 10% position is not just a stock I like more.
                It is a position that has earned a larger share of risk budget. A 1%
                to 3% position, by contrast, is often an option on being right without
                needing to underwrite full-size exposure on day one.
              </p>
              <p className="text-[15px] leading-[1.9] text-[#2d3d52]">
                Diversification here is not simply sector diversification. It is
                diversification by driver, maturity, and expression. Two companies may
                both sit under an AI label while being exposed to very different parts
                of the value chain, different customers, different margin structures,
                and different failure modes. The same logic applies across defense,
                energy, fintech, and space. What matters is not whether names look
                different on the surface. What matters is whether they fail for the
                same reason.
              </p>
              <p
                className="border-t pt-7 text-[15px] font-medium leading-[1.9]"
                style={{
                  borderColor: "rgba(15,30,53,0.08)",
                  color: "#0f1e35",
                }}
              >
                The portfolio is meant to evolve. New positions have to earn their way
                in. Existing positions have to keep earning their size. I want the site
                to reflect not only what I own, but the logic that holds the portfolio
                together.
              </p>
            </div>
          </div>
        </section>

        {/* ── Decision Log ─────────────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ background: "#f3ede1", borderColor: "rgba(15,30,53,0.08)" }}
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
            <div className="mb-12">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#7a8799]">
                Process
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[#0f1e35]">
                Decision Log
              </h2>
            </div>

            <div className="max-w-3xl space-y-7">
              <p className="text-[15px] leading-[1.9] text-[#2d3d52]">
                This portfolio is managed as an ongoing decision process. The most
                important record is not the list of current holdings. It is the
                sequence of decisions that created them. The purpose of the decision
                log is to document that process clearly: when a position was initiated,
                why it was added, what changed afterward, and whether the original
                thesis is becoming more or less credible over time.
              </p>
              <p className="text-[15px] leading-[1.9] text-[#2d3d52]">
                Every position begins with a reason to exist. That reason should be
                specific enough to test. A name is not added because a theme is popular
                or because price action is strong. It is added because I believe there
                is a definable source of future value creation, and because that
                exposure improves the portfolio relative to the alternatives. The first
                entry in the log should capture that plainly: why this company, why
                now, why in this sleeve, and why at this size.
              </p>
              <p className="text-[15px] leading-[1.9] text-[#2d3d52]">
                After initiation, the log should track changes in the thesis rather
                than just changes in price. If revenue quality improves, if customer
                concentration worsens, if execution disappoints, if the competitive set
                changes, or if the market begins pricing in more of the upside, those
                developments matter more than whether the stock is up or down over a
                short period. The goal is to separate outcome from process. A position
                can be down while the thesis is improving, and it can be up while the
                thesis is deteriorating.
              </p>

              <div
                className="rounded-2xl p-8"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,30,53,0.08)",
                }}
              >
                <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8b2bd]">
                  What each entry should answer
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: "Add",
                      text: "What increased conviction — a development in the thesis, not price momentum.",
                    },
                    {
                      label: "Trim",
                      text: "Whether the driver was valuation, risk control, position sizing, or a better opportunity elsewhere.",
                    },
                    {
                      label: "Exit",
                      text: "What broke: the thesis, the sizing discipline, or the relative attractiveness of the idea.",
                    },
                  ].map(({ label, text }) => (
                    <div key={label} className="flex gap-5">
                      <span
                        className="mt-0.5 w-10 shrink-0 font-mono text-[9px] uppercase tracking-[0.18em]"
                        style={{ color: "#7a8799" }}
                      >
                        {label}
                      </span>
                      <p className="text-[13px] leading-[1.75] text-[#3d4f66]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p
                className="border-t pt-7 text-[15px] font-medium leading-[1.9]"
                style={{
                  borderColor: "rgba(15,30,53,0.08)",
                  color: "#0f1e35",
                }}
              >
                Over time, the decision log becomes more valuable than the snapshot of
                the portfolio itself. It shows whether the process is consistent,
                whether conviction is earned or emotional, and whether capital is being
                reallocated for good reasons. It turns the portfolio from a static
                display into a live record of judgment.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(15,30,53,0.08)" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-[#a8b2bd]">
              Isaac Toffel · For informational purposes only. Not financial advice.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
                style={{ textDecoration: "none" }}
              >
                LinkedIn ↗
              </a>
              <a
                href="mailto:toffel.i@northeastern.edu"
                className="font-mono text-[10px] text-[#a8b2bd] transition-colors hover:text-[#0f1e35]"
                style={{ textDecoration: "none" }}
              >
                toffel.i@northeastern.edu
              </a>
              <span className="font-mono text-[10px] text-[#c8d0d8]">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ── Sleeve card ───────────────────────────────────────────────────────────────

function SleeveCard({
  slug,
  title,
  subtitle,
  description,
  role,
  color,
  themes,
  holdingCount,
}: {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  color: string;
  themes: string[];
  holdingCount: number;
}) {
  return (
    <Link href={`/portfolio/${slug}`} className="group block h-full">
      <div
        className="flex h-full flex-col rounded-2xl p-9 transition-colors bg-white hover:bg-[#fdfaf6]"
        style={{
          borderLeft: `3px solid ${color}`,
          boxShadow: "0 1px 4px rgba(15,30,53,0.06)",
        }}
      >
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color }}
        >
          {subtitle}
        </p>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-[#0f1e35]">
          {title}
        </h2>
        <p className="mt-3 text-[12.5px] leading-[1.65] text-[#5a6e82]">
          {description}
        </p>
        <p className="mt-2.5 font-mono text-[10px] leading-[1.6] text-[#7a8799]">
          {role}
        </p>

        <div
          className="my-6 h-px"
          style={{ background: "rgba(15,30,53,0.07)" }}
        />

        <div className="mb-5 flex flex-wrap gap-1.5">
          {themes.map((t) => (
            <span
              key={t}
              className="rounded px-2.5 py-1 font-mono text-[9px] text-[#7a8799]"
              style={{ border: "1px solid rgba(15,30,53,0.09)" }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#7a8799]">
            {holdingCount} position{holdingCount !== 1 ? "s" : ""}
          </span>
          <span
            className="font-mono text-[11px] text-[#a8b2bd] transition-colors group-hover:text-[#0f1e35]"
          >
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
