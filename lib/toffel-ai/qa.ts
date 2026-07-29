// ─── Toffel AI — precomputed, deterministic Q&A ───────────────────────────────
//
// This is a lookup feature, not a generator. There is no live model call and
// no API key anywhere in this path. Every answer is one of a fixed set of
// question templates, each backed by a pure function that composes committed
// data (lib/toffel-ai/knowledgeBase.ts) with a short authored framing string
// below. Unmatched input never gets a fabricated reply — it falls back to the
// list of questions this page can actually answer.
//
// To add a question: add a template to the relevant section of
// getKnownQuestions() with a label, a few matcher keywords, and an answer
// function. To update an answer's numbers, edit the underlying committed data
// (data/performanceDerived.json, data/decisionLog.ts, etc.) — nothing here
// needs to change for the numbers to stay current.

import * as kb from "./knowledgeBase";

export interface QAEntry {
  id: string;
  label: string;
  keywords: string[];
  answer: () => string;
}

function fmtPct(n: number, digits = 1): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

function fmtWeight(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── Global answer builders ─────────────────────────────────────────────────────

function concentrationAnswer(): string {
  const { capPct, flagged } = kb.concentrationFlags();
  const ranked = kb.holdingsRankedByWeight();
  const lines: string[] = [];

  if (flagged.length > 0) {
    lines.push(`These single-name positions are currently above the ${fmtWeight(capPct)} concentration cap:`);
    lines.push("");
    for (const p of flagged) {
      lines.push(`- [${p.ticker}](${p.href}) — ${p.name} — ${fmtWeight(p.weightPct)} of the account`);
    }
    lines.push("");
  } else {
    lines.push(`No single-name equity position is currently over the ${fmtWeight(capPct)} concentration cap.`);
    lines.push("");
  }

  lines.push("Largest positions overall:");
  for (const p of ranked.slice(0, 5)) {
    const capNote = p.assetType !== "Equity" ? ` (${p.assetType}, exempt from the single-name cap)` : "";
    lines.push(`- [${p.ticker}](${p.href}) — ${p.name} — ${fmtWeight(p.weightPct)}${capNote}`);
  }
  return lines.join("\n");
}

function etfExposureAnswer(): string {
  const { totalWeightPct, positions } = kb.etfExposure();
  const lines = [
    `ETF and crypto-linked ETF exposure totals ${fmtWeight(totalWeightPct)} of the account:`,
    "",
    ...positions.map((p) => `- [${p.ticker}](${p.href}) — ${p.name} — ${fmtWeight(p.weightPct)}`),
    "",
    "These are diversified baskets rather than single-company bets, so they're exempt from the single-name concentration cap and lower the account's idiosyncratic risk relative to an all-equity book.",
  ];
  return lines.join("\n");
}

function recentDecisionsAnswer(): string {
  const entries = kb.recentDecisions(5);
  const lines = ["Most recent portfolio decisions:", ""];
  for (const d of entries) {
    lines.push(`- **${d.ticker}** (${d.date}) — ${d.action}: ${d.note}`);
  }
  return lines.join("\n");
}

function largestPositionAnswer(): string {
  const ranked = kb.holdingsRankedByWeight();
  const top = ranked[0];
  const narrative = kb.positionNarrative(top.ticker);
  const why = narrative?.whyIOwnIt ?? "See the position page for the full thesis.";
  return [
    `The largest position is [${top.ticker}](${top.href}) — ${top.name} — at ${fmtWeight(top.weightPct)} of the account.`,
    "",
    why,
  ].join("\n");
}

function largestPositionsListAnswer(): string {
  const ranked = kb.holdingsRankedByWeight();
  const lines = ["Largest positions in the account:", ""];
  for (const p of ranked.slice(0, 6)) {
    lines.push(`- [${p.ticker}](${p.href}) — ${p.name} — ${fmtWeight(p.weightPct)}`);
  }
  return lines.join("\n");
}

function coreCompoundersAnswer(): string {
  const byTheme = kb.holdingsByTheme();
  const core = byTheme.find((t) => t.theme === "Core Market");
  const others = byTheme.filter((t) => t.theme !== "Core Market");
  const lines = [
    core
      ? `Core index exposure (${core.theme}) is ${fmtWeight(core.weightPct)} of the account, providing a broad-market foundation.`
      : "The account currently has no dedicated core-index sleeve.",
    "",
    "The remainder is allocated across selective, higher-conviction compounder themes:",
    "",
    ...others.map((t) => `- ${t.theme} — ${fmtWeight(t.weightPct)} (${t.tickers.join(", ")})`),
    "",
    "This barbell — broad core exposure plus a smaller set of concentrated, high-conviction names — is the account's central construction principle: market-level exposure for durability, paired with selective bets sized to reflect conviction and risk tolerance.",
  ];
  return lines.join("\n");
}

function archivedDecisionsAnswer(): string {
  const entries = kb.archivedDecisions(5);
  const lines = ["Recent archived positions:", ""];
  for (const d of entries) {
    const ret = d.returnPct !== undefined ? ` — ${fmtPct(d.returnPct)}` : "";
    lines.push(`- **${d.ticker}** (${d.date})${ret}: ${d.note}`);
  }
  return lines.join("\n");
}

// ── Performance-page answer builders ───────────────────────────────────────────

function twrVsMwrAnswer(): string {
  return [
    "Time-weighted return (TWR) measures the pure investment performance of the portfolio, removing the effect of when money was added or withdrawn. Money-weighted return (like IRR) blends performance with the timing and size of cash flows, so a well-timed deposit can flatter the number — or a poorly timed one can hurt it — even when nothing about stock selection changed.",
    "",
    "This page reports TWR via the Modified Dietz method, linked monthly, specifically so the headline number reflects investment decisions rather than contribution timing.",
  ].join("\n");
}

function maxDrawdownAnswer(): string {
  const perf = kb.performanceSummary();
  return [
    `The maximum drawdown was ${fmtPct(perf.drawdown.maxDrawdownPct)}, from a peak on ${perf.drawdown.peakDate} to a trough on ${perf.drawdown.troughDate}.`,
    "",
    `Annualized volatility over the full window was ${fmtWeight(perf.annualizedVolPct)}, consistent with a concentrated, growth-tilted book.`,
  ].join("\n");
}

function whySharpeNotHeadlineAnswer(): string {
  const perf = kb.performanceSummary();
  return [
    `Sharpe and Sortino are shown as supporting context, not headline figures, because they're computed on only ${perf.sharpe.n} monthly observations — too small a sample for the ratio itself to be statistically reliable.`,
    "",
    `Sharpe is ${perf.sharpe.sharpeAnnualized.toFixed(2)} (n=${perf.sharpe.n}, 95% CI ${perf.sharpe.ciLow.toFixed(2)} to ${perf.sharpe.ciHigh.toFixed(2)}) — a confidence interval this wide means the point estimate alone would be misleading as a headline.`,
    `Sortino is ${perf.sortino.sortinoAnnualized.toFixed(2)} (n=${perf.sortino.n}), shown for the same reason.`,
  ].join("\n");
}

// ── Position-page answer builders (parameterized by ticker) ───────────────────

function bullCaseAnswer(ticker: string): string {
  const d = kb.positionNarrative(ticker);
  if (!d?.bullCase) return `I don't have a documented bull case for ${ticker}.`;
  const assumptions = d.bullCase.assumptions?.length
    ? `\n\n${d.bullCase.assumptions.map((a) => `- ${a}`).join("\n")}`
    : "";
  return `**${d.bullCase.title}**\n\n${d.bullCase.summary}${assumptions}`;
}

function risksAnswer(ticker: string): string {
  const d = kb.positionNarrative(ticker);
  if (!d?.risks?.length) return `I don't have documented risks on file for ${ticker}.`;
  return d.risks.map((r) => `- ${r}`).join("\n");
}

function sizingAnswer(ticker: string): string {
  const holding = kb.holdingsRankedByWeight().find((p) => p.ticker === ticker.toUpperCase());
  const d = kb.positionNarrative(ticker);
  const lines: string[] = [];
  if (holding) lines.push(`${ticker.toUpperCase()} is ${fmtWeight(holding.weightPct)} of the account.`);
  if (d?.whyThisSleeve) lines.push(d.whyThisSleeve);
  else if (d?.whyIOwnIt) lines.push(d.whyIOwnIt);
  return lines.length ? lines.join("\n\n") : `I don't have sizing rationale on file for ${ticker}.`;
}

function watchlistAnswer(ticker: string): string {
  const d = kb.positionNarrative(ticker);
  if (!d?.watchList?.length) return `I don't have a documented watch list for ${ticker}.`;
  return d.watchList.map((w) => `- ${w}`).join("\n");
}

// ── Archive-page answer builders (parameterized by ticker) ────────────────────

function whyExitedAnswer(ticker: string): string {
  const h = kb.archivedNarrative(ticker);
  return h?.whyExited ?? `I don't have an archived record for ${ticker}.`;
}

function originalThesisAnswer(ticker: string): string {
  const h = kb.archivedNarrative(ticker);
  return h?.originalThesis ?? `I don't have an archived record for ${ticker}.`;
}

function lessonAnswer(ticker: string): string {
  const h = kb.archivedNarrative(ticker);
  return h?.lesson ?? `I don't have an archived record for ${ticker}.`;
}

function howItPlayedOutAnswer(ticker: string): string {
  const h = kb.archivedNarrative(ticker);
  if (!h) return `I don't have an archived record for ${ticker}.`;
  return [`Held ${h.ownedFrom} to ${h.ownedTo} (${h.exitType}).`, "", h.whatChanged].join("\n");
}

// ── Known question sets, by page context ───────────────────────────────────────

function globalQuestions(): QAEntry[] {
  return [
    {
      id: "concentration",
      label: "What are the largest sources of portfolio concentration?",
      keywords: ["concentration", "concentrated", "largest", "overweight", "biggest risk"],
      answer: concentrationAnswer,
    },
    {
      id: "etf-exposure",
      label: "How does ETF exposure affect the overall risk profile?",
      keywords: ["etf exposure", "etf", "risk profile", "basket"],
      answer: etfExposureAnswer,
    },
    {
      id: "recent-decisions",
      label: "What recent decisions changed the portfolio?",
      keywords: ["recent decisions", "recent", "changed", "activity", "trades"],
      answer: recentDecisionsAnswer,
    },
    {
      id: "largest-position",
      label: "What is the largest position and why?",
      keywords: ["largest position", "biggest position", "top holding"],
      answer: largestPositionAnswer,
    },
  ];
}

function investmentsPageQuestions(): QAEntry[] {
  return [
    {
      id: "largest-positions",
      label: "What are the largest positions in the account?",
      keywords: ["largest positions", "top holdings", "biggest positions"],
      answer: largestPositionsListAnswer,
    },
    {
      id: "core-compounders",
      label: "How does the account balance core exposure with compounders?",
      keywords: ["core exposure", "compounders", "balance"],
      answer: coreCompoundersAnswer,
    },
    {
      id: "concentration-risk",
      label: "Which positions drive the most concentration risk?",
      keywords: ["concentration risk", "concentration", "drive"],
      answer: concentrationAnswer,
    },
    {
      id: "archived-decisions",
      label: "What archived decisions changed the account?",
      keywords: ["archived decisions", "archived", "closed positions"],
      answer: archivedDecisionsAnswer,
    },
  ];
}

function performancePageQuestions(): QAEntry[] {
  return [
    {
      id: "twr-vs-mwr",
      label: "How does time-weighted return differ from money-weighted?",
      keywords: ["time-weighted", "money-weighted", "twr", "mwr", "difference"],
      answer: twrVsMwrAnswer,
    },
    {
      id: "max-drawdown",
      label: "What drove the max drawdown?",
      keywords: ["max drawdown", "drawdown", "drove"],
      answer: maxDrawdownAnswer,
    },
    {
      id: "sharpe-headline",
      label: "Why isn't Sharpe the headline number here?",
      keywords: ["sharpe", "headline", "sortino"],
      answer: whySharpeNotHeadlineAnswer,
    },
    {
      id: "largest-current",
      label: "What's the largest position in the current book?",
      keywords: ["largest position", "current book"],
      answer: largestPositionAnswer,
    },
  ];
}

function positionPageQuestions(ticker: string): QAEntry[] {
  return [
    {
      id: "bull-case",
      label: `What's the bull case for ${ticker}?`,
      keywords: ["bull case", "bull", "upside"],
      answer: () => bullCaseAnswer(ticker),
    },
    {
      id: "risks",
      label: `What are the key risks for ${ticker}?`,
      keywords: ["risks", "risk", "downside"],
      answer: () => risksAnswer(ticker),
    },
    {
      id: "sizing",
      label: `Why is ${ticker} sized this way?`,
      keywords: ["sized", "sizing", "weight", "allocation"],
      answer: () => sizingAnswer(ticker),
    },
    {
      id: "watchlist",
      label: `What am I watching for ${ticker}?`,
      keywords: ["watching", "watch", "monitor"],
      answer: () => watchlistAnswer(ticker),
    },
  ];
}

function archivePageQuestions(ticker: string): QAEntry[] {
  return [
    {
      id: "why-exited",
      label: `Why was ${ticker} exited?`,
      keywords: ["exited", "exit", "sold"],
      answer: () => whyExitedAnswer(ticker),
    },
    {
      id: "original-thesis",
      label: `What was the original thesis for ${ticker}?`,
      keywords: ["original thesis", "thesis"],
      answer: () => originalThesisAnswer(ticker),
    },
    {
      id: "lesson",
      label: `What's the key lesson from ${ticker}?`,
      keywords: ["lesson", "learned"],
      answer: () => lessonAnswer(ticker),
    },
    {
      id: "played-out",
      label: `How did the ${ticker} trade play out?`,
      keywords: ["played out", "trade", "outcome", "result"],
      answer: () => howItPlayedOutAnswer(ticker),
    },
  ];
}

/** The fixed, finite set of questions this feature can answer for a given page. */
export function getKnownQuestions(pathname: string | null): QAEntry[] {
  if (!pathname) return globalQuestions();

  const tickerMatch = pathname.match(/^\/positions\/([A-Za-z]+)/);
  if (tickerMatch) return positionPageQuestions(tickerMatch[1].toUpperCase());

  const archiveMatch = pathname.match(/^\/archive\/([A-Za-z]+)/);
  if (archiveMatch) return archivePageQuestions(archiveMatch[1].toUpperCase());

  if (pathname.includes("/portfolio/investments")) return investmentsPageQuestions();
  if (pathname.includes("/performance")) return performancePageQuestions();

  return globalQuestions();
}

const STOPWORDS = new Set([
  "the", "is", "a", "an", "of", "and", "to", "in", "for", "what", "how",
  "does", "do", "are", "this", "that", "it", "on", "was", "did", "here",
]);

function normalize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Simple keyword matcher over a known, finite question set — no semantic search, no model. */
export function matchQuestion(input: string, entries: QAEntry[]): QAEntry | null {
  const trimmed = input.trim();

  // Exact label match — guarantees clicking a suggested question always resolves.
  const exact = entries.find((e) => e.label === trimmed);
  if (exact) return exact;

  const lowerInput = trimmed.toLowerCase();

  // Strong signal: a whole keyword phrase appears verbatim in the input.
  for (const entry of entries) {
    for (const kw of entry.keywords) {
      if (kw.length > 3 && lowerInput.includes(kw)) return entry;
    }
  }

  // Fallback: token-overlap scoring against label + keywords.
  const inputTokens = new Set(normalize(trimmed));
  let best: { entry: QAEntry; score: number } | null = null;
  for (const entry of entries) {
    const haystack = new Set(normalize(`${entry.label} ${entry.keywords.join(" ")}`));
    let score = 0;
    for (const t of inputTokens) if (haystack.has(t)) score++;
    if (score > 0 && (!best || score > best.score)) best = { entry, score };
  }
  return best && best.score >= 2 ? best.entry : null;
}

export interface AnswerResult {
  matched: boolean;
  text: string;
}

/** Resolve free-typed (or clicked) input to a deterministic answer, or a safe fallback. */
export function answerQuestion(input: string, pathname: string | null): AnswerResult {
  const known = getKnownQuestions(pathname);
  const match = matchQuestion(input, known);
  if (match) return { matched: true, text: match.answer() };

  const list = known.map((q) => `- ${q.label}`).join("\n");
  return {
    matched: false,
    text: `I can only answer from the portfolio's committed data, and I didn't recognize that question. Here's what I can answer here:\n\n${list}`,
  };
}
