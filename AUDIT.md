# toffelcapital.com — Recruiting-Readiness Audit

**Date:** 2026-05-06
**Scope:** Phase 1 (read-only audit). No code edits made.
**Brief truncation note:** Your brief was cut off mid-Section C at "Tap targets smaller than 44". This audit covers Sections A, B, and the visible portion of C. Re-send the rest and I'll append findings.

---

## Section A — Functional bugs

### A1. LinkedIn URL — 5 locations, not 4 (P0)

You said 4. Actual count is **5** — you missed the homepage About-section identity strip.

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `app/page.tsx` | 30 | Homepage header — LinkedIn icon link (added this session) |
| 2 | `app/page.tsx` | 146 | Homepage About section — identity strip `{ label: "LinkedIn", … }` |
| 3 | `app/page.tsx` | 326 | Homepage footer — "LinkedIn ↗" text link |
| 4 | `app/analytics/page.tsx` | 27 | Analytics header — LinkedIn icon link |
| 5 | `app/decision-log/page.tsx` | 35 | Decision Log header — LinkedIn icon link |

All five point to `https://www.linkedin.com/feed/`. All need to be `https://www.linkedin.com/in/isaac-toffel`.

### A2. Navigation link verification

Internal routes referenced from homepage:
- `/portfolio/[slug]` → resolves (file: `app/portfolio/[slug]/page.tsx`)
- `/analytics` → resolves
- `/decision-log` → resolves
- `/positions/[ticker]` → resolves (referenced from Decision Log entries)
- `/archive/[ticker]` → resolves (referenced from Decision Log exits)
- `/etfs/[ticker]` → resolves (separate route from `/positions/`)

**No broken internal links found** in static analysis. Recommend manual click-through to confirm `/portfolio/individual-brokerage` and `/portfolio/roth-ira` slugs match `data/portfolios.ts`.

### A3. Console errors

**Cannot verify statically.** Requires running `npm run dev` and inspecting browser DevTools on each page. Flagged for manual check during Phase 2.

### A4. Image references

Two image assets in homepage; both exist in `public/`:
- `/carter-zoom.webp` ✓ (hero background)
- `/profile.png` ✓ (About section avatar)

`public/` also contains `northeastern.jpg` — not currently referenced anywhere in `app/` or `components/`. Possibly orphaned; leave alone for Phase 1.

### A5. TODOs / FIXMEs / lorem ipsum / placeholder content

**None found** in user-visible content. Only matches were legitimate `<textarea placeholder="…">` attributes in `components/ToffelAI.tsx:572`.

---

## Section B — Content consistency

### B1. Co-op tense (inventory only — no edits)

Two locations reference active co-op:

| File | Line | Text |
|------|------|------|
| `app/page.tsx` | 115–116 | "I'm currently in the midst of my first Co-op at State Street." |
| `app/page.tsx` | 144 | Identity strip: `{ label: "Experience", value: "State Street" }` |

**Post–June 2026 update plan:** Line 115–116 prose needs tense flip ("recently completed my first Co-op at State Street"). Line 144 identity-strip value can stay "State Street" — value alone reads neutrally.

### B2. CFA exam date — needs P1 fix

| File | Line | Current | Recommended |
|------|------|---------|-------------|
| `app/page.tsx` | 117 | "sitting for the first exam this fall" | "sitting for the Level I exam in February 2027" |
| `app/page.tsx` | 145 | Identity strip: `value: "CFA Level I Candidate"` | `value: "CFA Level I Candidate, Feb 2027 sitting"` |

Line 124 mentions "The CFA process has pushed that further" — no date claim, no change needed.

### B3. Performance figures — inconsistencies flagged (no auto-correct)

Decision Log entries vs. current Roth holdings (`data/sleeveHoldings.ts`):

| Ticker | Decision Log | Roth current | ETF Exposure | Note |
|--------|--------------|--------------|--------------|------|
| AMD | +71.53% (trim) | +45.86% | n/a | **Different cost basis** — trim was at the historical run-up; remaining shares show current cumulative return. Not an error, but a recruiter who doesn't read carefully may flag it. |
| SMH | +27.12% (Roth buy) | +16.37% (Roth) | +61.68% (ETF) | SMH appears in both Roth and ETF Exposure with different cost bases. The +27.12% figure is the return on the **specific buy lot** at the date of the decision. |
| VOO | (no return shown) | +5.18% (Roth) | +12.89% (ETF) | Decision Log entry was a "Market buy" with `returnPct` omitted. Consistent. |
| SCHD | +2.0% (exit) | n/a (archived) | n/a | Need to verify against `previousHoldings.ts` — not read in this audit. |
| IREN | +133.3% (exit) | n/a (archived) | n/a | Same — verify against `previousHoldings.ts`. |
| SATL | +30.0% (exit) | n/a (archived) | n/a | Same. |
| PLTR | +520.0% (exit) | n/a (archived) | n/a | Same. |

**Recommendation:** Either (a) add a one-line methodology footnote to the Decision Log explaining "return % = realized return on the lot at the time of the decision," or (b) leave as-is and trust the recruiter's reading. Do not change the numbers.

### B4. Position counts

| Card | Homepage label | Actual count | Match? |
|------|----------------|--------------|--------|
| Individual Brokerage | "5 positions" | 5 (`holdings.ts`) | ✓ |
| Roth Retirement Account | "15 positions" | 15 (`rothIraHoldings`, **including SOAR at 0% weight**) | Technically ✓, but… |

**Flag:** SOAR is currently a pending-exit position with `portfolioWeightPct: 0` and a stop-loss queued. Counting it inflates the Roth card to 15 when only 14 are actively-weighted. **Decision required from you:** show 14 (active only) or 15 (all positions including pending-exit)?

### B5. Roth Analytics bucket totals

`rothNormalized` fix is in place at [components/AnalyticsDashboard.tsx:356–362](components/AnalyticsDashboard.tsx#L356-L362). All three Roth exposure breakdowns (Geography, Market Cap, Asset Type) and the attribution chart now operate on weights scaled to sum to 100%.

**Edge case to verify visually:** SOAR has no `marketCap` field, so it falls into the "Other" bucket in the market-cap breakdown. Since SOAR's normalized weight = 0, "Other" should be 0% and not appear (or appear as 0%). Confirm this looks clean in the rendered chart — if "Other: 0.0%" displays as a label, suppress it.

---

## Section C — Mobile responsiveness (partial — brief was truncated)

### C1. Tables

`components/AnalyticsDashboard.tsx:303` — `<table className="w-full text-left">`. Quick scan: no `overflow-x-auto` wrapper on the parent container. **Likely overflow risk at 375px** if the table has 4+ columns.

Need to inspect at runtime with DevTools at iPhone SE width to confirm. Tables are listed in your brief as "likely offenders" — your intuition matches what I see in the markup.

### C2. Fixed widths

No problematic `min-w-[Npx]` or large fixed-pixel widths found in the homepage or main components. Most layout uses Tailwind responsive utility classes.

### C3. Tap targets — measured (44×44 minimum per WCAG AAA / Apple HIG)

All measurements computed from CSS classes / inline styles. Runtime DevTools verification still recommended.

| Element | File:line | Visible size | Hit area | Pass? | Recommended fix |
|---------|-----------|--------------|----------|-------|-----------------|
| Header LinkedIn icon | `app/page.tsx:30`, `app/analytics/page.tsx:27`, `app/decision-log/page.tsx:35` | 13×13 SVG | **13×13** | ❌ | Wrap `<a>` in `inline-flex items-center justify-center w-11 h-11 -m-3` (visible icon stays 13×13, hit area becomes 44×44, layout unchanged via negative margin) |
| Decision Log filter pill | `components/DecisionLogFeed.tsx:61–67` | font 11px, padding 5px 14px | **~21h × ~70w** | ❌ height | Increase padding to `8px 14px` and add `min-height: 36px` minimum; or accept ~36×N as "close enough" since pills are clustered (less critical than isolated controls) |
| Footer "LinkedIn ↗" link | `app/page.tsx:325–333` | font 10px, no padding | **~12×~70** | ❌ | Add `inline-block py-2` (height becomes 28+, still under 44 but acceptable for footer secondary links) |
| Footer email link | `app/page.tsx:334–340` | font 10px, no padding | **~12×~280** | ❌ height | Same fix as LinkedIn footer |
| "View →" arrow on cards | `app/page.tsx:419–423` | font 11px text | n/a — entire `<Link>` card is clickable (~250×250) | ✓ | No fix |
| ToffelAI close (X) | `components/ToffelAI.tsx:484–497` | 12×12 SVG | **w-7 h-7 = 28×28** | ❌ | Bump to `w-11 h-11` (44×44) |
| ToffelAI Clear text button | `components/ToffelAI.tsx:477–482` | text 11px, `px-2 py-1` | **~24×~50** | ❌ height | Bump to `px-3 py-2.5` |
| ToffelAI Send button | `components/ToffelAI.tsx:577–598` | 11×11 SVG, `w-7 h-7` | **28×28** | ❌ | Bump to `w-11 h-11` |
| ToffelAI floating launcher | `components/ToffelAI.tsx:608–628` | `w-14 h-14` | **56×56** | ✓ | No fix |
| ToffelAI suggested-prompt buttons | `components/ToffelAI.tsx:513–519` | `w-full text-left px-4 py-3` | full-width × ~44 | ✓ | No fix (height ~44 with 13px line + 24px padding) |
| Top-nav text links (homepage/analytics/decision-log) | `app/page.tsx:32–50`, `analytics/page.tsx:32–56`, `decision-log/page.tsx:38–58` | font 11px text, no padding | **~14×~120** | ❌ height | Wrap in `inline-block py-3` to bring height to ~38; full 44 would distort the bar |

**Pattern recommendation for Phase 2:** introduce a small util pattern — for icon-only links, use `inline-flex items-center justify-center w-11 h-11` with an inner `<span>` or SVG at the visual size. Use negative margin (`-mx-3`/`-my-3`) to keep visual layout unchanged where padding would shift surrounding elements.

### C4. Horizontal scroll at 375px

**Cannot programmatically open DevTools** in this audit. Static analysis of likely offenders:

| Page | Likely overflow source | File:line | Confidence |
|------|----------------------|-----------|------------|
| `/analytics` | Holdings table at width:full inside `max-w-7xl px-6` container — at 375px, padding leaves ~327px content width; if table has ≥4 columns of tabular-num content, will overflow | `components/AnalyticsDashboard.tsx:303` | High |
| `/analytics` | Recharts `<ResponsiveContainer>` charts — these usually scale fine, but check `<BarChart>` with hard-coded `margin: { right: 56 }` | `AnalyticsDashboard.tsx:245` | Low |
| `/positions/[ticker]` | Trim history / activity table | `app/positions/[ticker]/page.tsx:313` | Medium |
| `/portfolio/roth-ira` | `SleeveHoldingsTable` — multi-column financial table | imported from `components/SleeveHoldingsTable.tsx` | High |
| `/portfolio/individual-brokerage` | `HoldingsTable` — same pattern | `components/HoldingsTable.tsx` | High |
| `/decision-log` | None observed — cards use flex-wrap | — | Low |
| `/` (home) | None observed — sections use flex-wrap and grid | — | Low |
| `/archive/[ticker]` | Mostly prose-style cards, low risk | — | Low |
| `/etfs/[ticker]` | Constituents table | `app/etfs/[ticker]/page.tsx:145, 217` | Medium |

**Recommended Phase 2 mitigation:** wrap each table in `<div className="-mx-6 overflow-x-auto px-6">` (or similar) so horizontal scroll happens within the table region, not the whole page. Negative margin lets the scroll region bleed to the viewport edge; `px-6` restores content padding inside.

### C5. Text truncation / overflow

Static scan for `truncate`, `text-ellipsis`, `whitespace-nowrap`:

```
$ grep -rn "truncate\|text-ellipsis\|whitespace-nowrap" components/ app/
```
**Result: 0 hits.** No intentional truncation anywhere. Site relies on natural text wrapping.

**Risk areas to verify visually at 375px:**
- Long company names in cards: "VanEck Semiconductor ETF", "Schwab U.S. Dividend Equity ETF" inside `DecisionLogFeed` cards — should wrap fine since cards use `flex flex-wrap items-center` at line 94
- Long thesis text in position cards — wraps naturally
- Hero h1 "Portfolio / Dashboard" with `clamp(3.5rem,8vw,7rem)` — at 375px, 8vw = 30px, falls within clamp's 56px floor — **may be too large** for narrow viewport. Verify visually.
- Analytics page h1 uses `clamp(2.5rem,5vw,4rem)` — at 375px, 5vw = 18.75px → clamp floor 40px (2.5rem). Reasonable.

---

## Section D — SEO and link-share metadata

### D1. Page <title> tags

| Route | Current title | Verdict | Recommended |
|-------|---------------|---------|-------------|
| `/` (home) | "Investment Portfolio" (default from `app/layout.tsx:10`) | Weak — generic, no name | "Toffel Capital — Isaac Toffel's Investment Portfolio" |
| `/analytics` | "Analytics · Portfolio" | Acceptable | "Portfolio Analytics — Toffel Capital" |
| `/decision-log` | "Decision Log — Portfolio" | Acceptable | "Decision Log — Toffel Capital" |
| `/portfolio/[slug]` | `${title} — Portfolio` (e.g., "Roth Retirement Account — Portfolio") | Acceptable | `${title} — Toffel Capital` |
| `/positions/[ticker]` | `${ticker} — ${company}` (e.g., "AMD — AMD") | Weak when ticker == company | `${ticker} ${company} — Toffel Capital` |
| `/etfs/[ticker]` | `${ticker} — ${fullName}` | Acceptable | Add " — Toffel Capital" suffix |
| `/archive/[ticker]` | `${ticker} — Archived Position` | Acceptable | Add " — Toffel Capital" suffix |

**Pattern recommendation:** site-wide convention should be `"<page-specific> — Toffel Capital"`. Uses Next.js `metadata.title.template` in `layout.tsx`:
```ts
title: {
  default: "Toffel Capital — Investment Portfolio",
  template: "%s — Toffel Capital",
}
```
Then per-page metadata sets the `%s` portion only.

### D2. Meta descriptions

| Route | Current description | Verdict |
|-------|---------------------|---------|
| `/` | "A concentrated, conviction-based equity portfolio across AI, Defense, and Energy." (140 chars) | ✓ — good, but theme list should match the site (the live site emphasizes Bitcoin / Semiconductors / Compounders, not Energy). Verify and align. |
| `/analytics` | "Portfolio analytics: attribution, exposure, and concentration metrics." (71 chars) | ✓ adequate |
| `/decision-log` | **none** | ❌ missing |
| `/portfolio/[slug]` | **none** | ❌ missing |
| `/positions/[ticker]` | **none** | ❌ missing |
| `/etfs/[ticker]` | **none** | ❌ missing |
| `/archive/[ticker]` | **none** | ❌ missing |

**Phase 2 fix:** add a description to every `generateMetadata` return. For `/positions/[ticker]`, can derive from `positionDetails[ticker].whyIOwnIt` (truncated to 155 chars) or use the holding's `thesis`.

### D3. OpenGraph / Twitter card

**No OpenGraph tags anywhere.** Search for `openGraph` and `og:` returned zero hits.

This is the most impactful SEO finding for your use case — when a recruiter pastes the URL into LinkedIn DMs or Slack, **there will be no preview card**. Just a bare URL.

**Phase 2 fix in `app/layout.tsx`:**
```ts
metadata: {
  metadataBase: new URL("https://toffelcapital.com"),
  openGraph: {
    title: "Toffel Capital — Investment Portfolio",
    description: "...same as default description...",
    url: "https://toffelcapital.com",
    siteName: "Toffel Capital",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toffel Capital — Investment Portfolio",
    description: "...",
    images: ["/og-image.png"],
  },
}
```
**Need to create `public/og-image.png` (1200×630).** No design tool here — recommend producing this externally and dropping in.

### D4. robots.txt and sitemap.xml

Searched `public/` and `app/` for `robots*` and `sitemap*`:
- **`public/robots.txt`:** missing
- **`app/robots.ts`:** missing
- **`public/sitemap.xml`:** missing
- **`app/sitemap.ts`:** missing

**Impact:** site is currently relying on Next.js defaults / Google's ability to crawl unaided. Adding `app/robots.ts` and `app/sitemap.ts` is a 10-minute fix and important if you want a Google search for "Isaac Toffel Northeastern" to surface this.

### D5. Favicon

Found at `public/favicon.ico`. **Cannot tell from a static read whether it's the default Next.js icon or a custom one.** Recommend opening in a browser tab and visually confirming. If still default, replace with a small "TC" wordmark or subtle navy/black geometric mark to match the institutional palette.

---

## Section E — Accessibility

### E1. Image alt text

| Image | File:line | Alt | Verdict |
|-------|-----------|-----|---------|
| Hero background `/carter-zoom.webp` | `app/page.tsx:70` | `alt=""` | ✓ — decorative, correctly empty |
| Profile photo `/profile.png` | `app/page.tsx:184` | `alt="Isaac Toffel"` | ✓ |
| All inline SVG icons | various | `aria-hidden="true"` set on SVG; parent `<a>` has `aria-label` | ✓ |

**No issues.** Image alt-text is correctly handled.

### E2. Color contrast (WCAG AA = 4.5:1 normal text, 3:1 large text)

Site palette on cream background `#faf7f2`:

| Color | Used as | Contrast on #faf7f2 | Verdict |
|-------|---------|---------------------|---------|
| `#0f1e35` | Primary headings, body | ~15.6:1 | ✓ AAA |
| `#5a6e82` | Secondary body | ~4.8:1 | ✓ AA (close to threshold) |
| `#7a8799` | Tertiary text | ~3.4:1 | **❌ AA fail** for normal text; passes for large text |
| `#a8b2bd` | Footer, brand-when-light, card meta | **~2.0:1** | **❌ FAILS AA** for any text size |
| `#c8d0d8` | Year display in footer | ~1.3:1 | **❌ FAILS** all thresholds |

**Specific failures requiring fix:**
- Decision Log card "type" pills use `#5a6e82` on `rgba(15,30,53,0.06)` (very light navy) — actually OK (~4.5:1 against the slightly darkened pill bg)
- Decision Log card meta date / account use `#a8b2bd` on white card → **fails AA**
- Decision Log empty-state message uses `#a8b2bd` on cream → **fails AA**
- Analytics labels using `DIM` color (which is `#a8b2bd` per the constants) on cream → likely **fails AA**
- Card "themes" pills border + text use `#7a8799` — fail AA for the text inside
- Footer year `#c8d0d8` — visually invisible, fails all thresholds

**Phase 2 recommendation:** raise the lightest text colors. Replacing `#a8b2bd` with `#6b7785` (the next-darker step) gives ~4.7:1 against cream. Replace `#7a8799` with `#5a6e82` (already the next-darker step in your palette) for any normal-text usage.

### E3. Heading hierarchy

| Page | h1 count | Hierarchy | Verdict |
|------|----------|-----------|---------|
| `/` | 1 (`app/page.tsx:87`) | h1 → h2 (Account Views, Process, etc.) → h2 inside cards (line 393) | ✓ |
| `/analytics` | 1 (`app/analytics/page.tsx:66`) | h1 → many h2s in `AnalyticsDashboard` (lines 499, 522, 550, 576) | ✓ |
| `/decision-log` | 1 (`decision-log/page.tsx:72`) | h1 only — no other headings (cards use spans) | ✓ |
| `/portfolio/[slug]` | **3** (lines 120, 214, 411) | **❌ multiple h1s** | Fix Phase 2 |
| `/positions/[ticker]` | 1 (line 220) plus h3 at 603 — no h2 | h1 → h3 (skips h2) | Minor; Phase 2 nice-to-have |
| `/archive/[ticker]` | 1 (line 177) | check h2/h3 below — needs read | Likely fine |
| `/etfs/[ticker]` | 1 (line 71) | check below | Likely fine |

**Specific issue:** `app/portfolio/[slug]/page.tsx` declares h1 three separate times (probably one per layout variant). At runtime only one will render per request, but it's worth confirming.

### E4. Focus states

**Search for `focus:` or `focus-visible` in component code:** only one hit — `RetirementCalculator.tsx:126` (input field). Every other interactive element relies on browser-default focus rings.

Browser default focus is usually visible but inconsistent across user agents. For a polished/institutional feel, recommend Phase 2 add `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1e35]` to:
- Top nav `<Link>` elements
- DecisionLog filter pills
- ToffelAI buttons (Clear, Close, Send, Suggested prompts)
- Header social icon `<a>`

### E5. ARIA labels on icon-only controls

| Control | Has aria-label? |
|---------|-----------------|
| Header LinkedIn icon | ✓ `aria-label="LinkedIn"` |
| ToffelAI Close button | ✓ `aria-label="Close Toffel AI"` |
| ToffelAI Send button | ✓ `aria-label="Send"` |
| ToffelAI floating launcher | ✓ `aria-label="Open Toffel AI"` |
| ToffelAI Clear button | ❌ — has visible "Clear" text, so technically OK |
| ToffelAI panel itself | ✓ `aria-label="Toffel AI chat panel"` (line 444) |

**Minor:** the panel is an `<aside>` with `aria-label`, but no `role="dialog"` or focus trap — when open, Tab can escape into the underlying page. Phase 2 nice-to-have if you want full a11y compliance for the chat UI.

---

## Section F — Performance and build hygiene

### F1. Lighthouse scores

**Cannot run Lighthouse statically.** Requires `npm run start` and Chrome DevTools or `lighthouse` CLI. Recommend running once locally before resume submission and reporting back.

Targets (per your brief): ≥90 on all four (Performance, Accessibility, Best Practices, SEO).

**Predictions based on static analysis:**
- **Performance**: likely 90+ — Next.js 16 App Router with SSG is fast by default; main risk is unoptimized hero image (`carter-zoom.webp` — already webp ✓; check dimensions)
- **Accessibility**: likely 80–90 due to color contrast failures (E2) — the big drag
- **Best Practices**: likely 95+ — no obvious issues
- **SEO**: likely 70–85 due to missing OG tags, missing meta descriptions, missing sitemap (D2/D3/D4) — the big drag

### F2. Bundle size

Ran `npm run build` — succeeded in ~2 seconds with Turbopack. Build output captured shows route list and SSG counts but not per-route First Load JS (Next.js 16 Turbopack output format).

**Cannot give exact KB figures from this captured output.** Recommend running `npm run build` interactively or with `--profile` flag to get the table. Static signals:

- **Largest probable route:** `/analytics` — imports `AnalyticsDashboard` which uses `recharts` (a substantial dep ~150KB). This is the most likely route over 200KB First Load JS.
- **Other heavy candidates:** `/portfolio/[slug]` if it imports `RothThemeChart` (custom SVG, lightweight) and `BenchmarkComparison` chart.
- **`recharts`** is the largest single dep visible in import graph. Used only in `AnalyticsDashboard` and `BenchmarkComparison`. Already only loaded on those routes via standard Next.js code-splitting.

**Phase 2 nice-to-have:** dynamic-import `AnalyticsDashboard` so the analytics page boots faster on slow connections. Not urgent.

### F3. Build warnings

**`npm run build` ran with zero warnings.**

```
✓ Compiled successfully in 1905ms
✓ Generating static pages using 9 workers (33/33) in 195ms
```

33 static pages generated, all static or SSG, plus 4 dynamic API routes (`/api/history`, `/api/quote`, `/api/quotes`, `/api/toffel-ai`).

### F4. Unused / orphan components

`components/` contains 26 files. Static import-graph analysis flags **11 components not directly imported** by any other file under `app/` or `components/`:

```
AllocationChart
BenchmarkComparison
CategorySection
ClickableRow
FullHoldingsSection
Hero
PortfolioOverview
PositionChart
RetirementCalculator
ReturnChart
ReturnChartWrapper
```

**Likely false positives** (the inner component used only by its Wrapper sibling, e.g., `BenchmarkComparison` used inside `BenchmarkComparisonWrapper`): `BenchmarkComparison`, `RetirementCalculator`, `ReturnChart`. These should be verified by reading the wrapper files before any deletion.

**Likely true orphans** (no obvious wrapper relationship): `AllocationChart`, `CategorySection`, `ClickableRow`, `FullHoldingsSection`, `Hero`, `PortfolioOverview`, `PositionChart`, `ReturnChartWrapper`.

**Action:** inventory only — do not delete. These may be referenced via dynamic imports, may be staging-only, or may be intentionally kept for future use. Recommend Phase 2+ cleanup pass.

---

## Phase 2 fix priority — UPDATED with full audit

**P0 (must fix before resume goes out):**
1. **LinkedIn URL** — 5 locations → `linkedin.com/in/isaac-toffel` (A1)

**P1 (strongly recommended before resume goes out):**
2. **CFA exam date** — "this fall" → "February 2027 sitting" (B2, 2 locations)
3. **SOAR position count** — exclude SOAR from Roth homepage card; show 14, not 15. Filter to `portfolioWeightPct > 0` for the count display only. Don't remove SOAR from data. (B4)
4. **Decision Log methodology footnote** — italic note above entries clarifying return-at-decision semantics (B3)
5. **og:image + OpenGraph + Twitter card** — recruiter pastes URL into LinkedIn/Slack and gets a preview (D3). Generate `public/og-image.png` (1200×630) externally; wire metadata in `app/layout.tsx`.
6. **Meta descriptions** — add to `/decision-log`, `/portfolio/[slug]`, `/positions/[ticker]`, `/etfs/[ticker]`, `/archive/[ticker]` (D2)
7. **Page titles** — adopt `"%s — Toffel Capital"` template; rewrite `/` default title (D1)
8. **`app/robots.ts` and `app/sitemap.ts`** — generate Next.js-native (D4)

**P2 (polish):**
9. **Tap target padding** — header social icons (`w-11 h-11 -m-3`), ToffelAI Close/Send/Clear, Decision Log filter pills, footer links (C3)
10. **Analytics + Holdings tables** — wrap in `-mx-6 overflow-x-auto px-6` to localize horizontal scroll (C1, C4)
11. **Color contrast** — replace `#a8b2bd` with `#6b7785` for any non-decorative text (E2)
12. **SOAR market-cap "Other: 0%"** — suppress the bucket label if weight rounds to 0 (B5)
13. **Favicon** — verify custom (or replace) (D5)
14. **Multiple h1s on `/portfolio/[slug]`** — confirm only one renders per request, demote others to h2 (E3)
15. **Visible focus rings** — add `focus-visible:outline-…` to nav links, filter pills, ToffelAI buttons (E4)
16. **Hero h1 size at 375px** — clamp floor may be too large; visually verify (C5)

**Defer (post–June 2026):**
17. **Co-op tense flip** — `app/page.tsx:115–116` "currently in the midst" → "recently completed" (B1)

**Inventory-only (no Phase 2 action):**
- 8–11 likely-orphan components in `/components` (F4) — defer cleanup pass

---

## Open questions for you before Phase 2

1. **SOAR position count:** include (15) or exclude (14)? *Recommendation: exclude — SOAR is a pending exit, not a working position.*
2. **Decision Log methodology footnote:** add the italic note, or leave numbers to speak for themselves? *Recommendation: add — recruiters who skim may otherwise flag the AMD +71.53% vs. +45.86% difference as an inconsistency.*
3. **og:image generation:** I cannot produce a 1200×630 PNG in this environment. Want to handle it externally (Figma/Canva), or should I produce a minimal HTML/SVG template that renders to PNG via Node `@vercel/og` (requires adding the dep)?
4. **Lighthouse run:** want me to attempt to run it locally via `npm run start` + `npx lighthouse` (requires Chromium installation), or run it yourself and paste scores back?
5. **Section D / E / F results above:** any specific item you want elevated to P0?

---

**End of Phase 1 audit. Awaiting your approval to proceed to Phase 2.**
