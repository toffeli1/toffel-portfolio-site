import Image from "next/image";
import Eyebrow from "@/components/Eyebrow";
import { INK, BODY, MUTED, FAINT, HAIRLINE, CARD, ACCENT, SECTION_Y, HERO_Y } from "@/lib/theme";

// ─── Assessing the Frontier ──────────────────────────────────────────────────
// Isaac's Sep 2026 research paper. The text on this page is the paper's own
// opening and executive summary, reproduced rather than rewritten; the full
// document is the PDF in /public/research. When the paper is revised, replace
// the PDF, re-render the page images into
// /public/research/assessing-the-frontier/, and update PUBLISHED and PAGES.

const PDF = "/research/assessing-the-frontier.pdf";
const PUBLISHED = "September 25, 2026";
const PAGES = Array.from({ length: 17 }, (_, i) => i + 1);

export const metadata = {
  title: "Assessing the Frontier",
  description:
    "A Toffel Capital paper: how the portfolio is positioned for the next 24 months of AI investment, the cost of capital and the businesses behind it.",
};

const CLAIMS = [
  "The AI cycle is shifting from building capacity to earning on it.",
  "Scarce inputs set the pace of the buildout, and power stays scarce longer than compute.",
  "AI agents will change how software and commerce are priced.",
  "The cost of capital has risen, and it limits how much of the buildout can be funded.",
  "Policy is now a pricing input, and I position around it.",
];

export default function AssessingTheFrontierPage() {
  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>
      <main>
        {/* ── Title ─────────────────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-4xl px-6 ${HERO_Y} lg:px-12`}>
            <Eyebrow className="mb-4" color={ACCENT}>A Toffelcapital Paper</Eyebrow>
            <h1
              className="font-display font-semibold leading-[0.95] tracking-tight"
              style={{ color: INK, fontSize: "clamp(2.4rem,5vw,3.75rem)" }}
            >
              Assessing the Frontier
            </h1>
            <p className="mt-4 font-display text-[19px] italic" style={{ color: BODY }}>
              How Toffel Capital is positioned for the next 24 months
            </p>
            <p className="mt-6 font-mono text-[11px]" style={{ color: MUTED }}>
              Isaac Toffel · {PUBLISHED} · 17 pages
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-opacity hover:opacity-80"
                style={{ background: INK, color: "#faf7f2", borderRadius: 6 }}
              >
                Read the paper (PDF)
              </a>
              <a
                href={PDF}
                download="Toffel Capital - Assessing the Frontier.pdf"
                className="inline-block px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
                style={{ color: INK, border: `1px solid ${INK}`, borderRadius: 6 }}
              >
                Download
              </a>
            </div>
          </div>
        </section>

        {/* ── Opening and executive summary, from the paper ──────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-4xl px-6 ${SECTION_Y} lg:px-12`}>
            <p className="max-w-3xl text-[16px] leading-[1.85]" style={{ color: INK }}>
              My portfolio rests on one conclusion about the next two years: the AI buildout will
              reward the companies that already earn from it, well before the payoff is proven for
              everyone else. I own those businesses as the core of the book, while keeping the ones
              that depend on outside funding small, holding other exposures so that a single outcome
              cannot decide the result. At today&apos;s prices I expect about 16% over two years from
              this construction, against about 11% for the S&amp;P 500, with a deeper loss if AI
              spending stalls while rates stay high. This paper sets out the market view behind the
              book, tests what current prices already assume, and names the places where my own
              positioning cuts against my thesis.
            </p>

            <Eyebrow className="mb-5 mt-14">The five claims</Eyebrow>
            <ol className="max-w-3xl">
              {CLAIMS.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-5 border-t py-4 text-[15px] leading-[1.7]"
                  style={{ borderColor: HAIRLINE, color: BODY }}
                >
                  <span className="font-display text-[20px] leading-none" style={{ color: ACCENT }}>
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>

            <Eyebrow className="mb-5 mt-14">Contents</Eyebrow>
            <div className="grid max-w-3xl gap-x-10 gap-y-3 font-mono text-[12px] sm:grid-cols-2" style={{ color: MUTED }}>
              <p>Part I · Where markets are heading</p>
              <p>Part II · What&apos;s priced in</p>
              <p>Part III · How the book is positioned</p>
              <p>Part IV · Scenarios, Sep 2026 to Sep 2028</p>
              <p>Part V · Risks</p>
              <p>Signposts and conclusion</p>
            </div>
          </div>
        </section>

        {/* ── The paper itself ───────────────────────────────────────────── */}
        <section className="border-b" style={{ borderColor: HAIRLINE }}>
          <div className={`mx-auto max-w-5xl px-6 ${SECTION_Y} lg:px-12`}>
            <Eyebrow className="mb-6">The paper</Eyebrow>
            {/* Rendered page images rather than an inline PDF viewer: many phones
                and some browsers can't display a PDF inside a page at all. The
                images are rasterised from the same PDF the buttons link to. */}
            <div className="space-y-4">
              {PAGES.map((n) => (
                <Image
                  key={n}
                  src={`/research/assessing-the-frontier/page-${String(n).padStart(2, "0")}.webp`}
                  alt={`Assessing the Frontier, page ${n} of ${PAGES.length}`}
                  width={1275}
                  height={1650}
                  sizes="(max-width: 1024px) 100vw, 960px"
                  priority={n === 1}
                  className="block h-auto w-full"
                  style={{ ...CARD, background: "#ffffff" }}
                />
              ))}
            </div>
            <p className="mt-4 font-mono text-[10px] leading-[1.7]" style={{ color: FAINT }}>
              Weights and track-record figures in the paper are as of the September 25, 2026
              snapshot, the same data as the Investments and Performance pages. Scenario inputs and
              probabilities are the author&apos;s own assumptions. For informational purposes only.
              Not financial advice.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
