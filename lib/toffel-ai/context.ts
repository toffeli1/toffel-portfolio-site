import { holdings, categoryAllocations } from "@/data/holdings";
import { portfolios } from "@/data/portfolios";
import { rothIraHoldings, etfsSleeveHoldings } from "@/data/sleeveHoldings";
import { positionDetails } from "@/data/positionDetails";
import { previousHoldings } from "@/data/previousHoldings";

function cap<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

// ── Context assembly ──────────────────────────────────────────────────────────

export function assemblePortfolioContext(): string {
  const lines: string[] = [];

  // ── Portfolio overview ────────────────────────────────────────────────────
  lines.push("=== PORTFOLIOS ===");
  for (const p of portfolios) {
    lines.push(`[${p.title}] (/${p.slug}) — ${p.description} | Role: ${p.role} | Themes: ${p.themes.join(", ")}`);
  }

  // ── Category allocations ──────────────────────────────────────────────────
  lines.push("\n=== RETAIL ALLOCATIONS ===");
  for (const c of categoryAllocations) {
    lines.push(`${c.category}: ${c.pct}% — ${c.description}`);
  }

  // ── Ticker registries (model must use only these symbols) ─────────────────
  const currentTickerSet = new Set<string>([
    ...holdings.map((h) => h.ticker),
    ...rothIraHoldings.map((h) => h.ticker),
    ...etfsSleeveHoldings.map((h) => h.ticker),
  ]);
  const archivedTickerSet = new Set(previousHoldings.map((h) => h.ticker));

  lines.push("\n=== CURRENT HOLDINGS TICKER REGISTRY ===");
  lines.push("IMPORTANT: These are ALL current (open) positions. Use ONLY these exact ticker symbols.");
  lines.push([...currentTickerSet].sort().join(", "));

  lines.push("\n=== ARCHIVED TICKERS (CLOSED POSITIONS — NOT current holdings) ===");
  lines.push("IMPORTANT: These tickers are CLOSED. Never list them as current holdings.");
  lines.push([...archivedTickerSet].join(", "));

  // ── Risk concentrations (pre-computed, sorted, unique tickers only) ─────────
  lines.push("\n=== RISK CONCENTRATIONS — SPECULATIVE INDIVIDUAL STOCKS PORTFOLIO (sorted by weight) ===");
  lines.push("Use ONLY this section to answer all questions about risk concentrations, biggest risks, position sizing, or overweight names.");
  lines.push("Each ticker appears exactly once. Do not re-scan or regenerate from other sections.");

  const sortedByWeight = [...holdings].sort((a, b) => b.portfolioPct - a.portfolioPct);
  const concentrationSeen = new Set<string>();
  for (const h of sortedByWeight) {
    if (concentrationSeen.has(h.ticker)) continue;
    concentrationSeen.add(h.ticker);
    const d = positionDetails[h.ticker];
    const primaryRisk = d?.risks?.[0] ?? h.thesis;
    lines.push(`- ${h.ticker} — ${h.portfolioPct}% of portfolio. ${primaryRisk}`);
  }

  // ── Regional exposure (pre-computed, deduplicated, current only) ──────────
  lines.push("\n=== REGIONAL EXPOSURE — CURRENT HOLDINGS ONLY (deduplicated) ===");
  lines.push("Use this section to answer all region/geography exposure questions. Do not re-scan other sections.");

  const latam = rothIraHoldings.filter((h) => h.country === "Latin America");
  if (latam.length) {
    lines.push("Latin America:");
    for (const h of latam) {
      lines.push(`  ${h.ticker} — ${h.company} | Roth Retirement Account | ${h.portfolioWeightPct}% of account | ${h.thesis ?? ""}`);
    }
  }

  const intl = [
    ...rothIraHoldings.filter((h) => h.country === "International"),
  ];
  if (intl.length) {
    lines.push("International:");
    for (const h of intl) {
      lines.push(`  ${h.ticker} — ${h.company} | Roth Retirement Account | ${h.portfolioWeightPct}% of account | ${h.thesis ?? ""}`);
    }
  }

  const usTickers = [
    ...holdings.map((h) => h.ticker),
    ...rothIraHoldings.filter((h) => h.country === "US" || !h.country).map((h) => h.ticker),
    ...etfsSleeveHoldings.map((h) => h.ticker),
  ];
  lines.push(`US: ${[...new Set(usTickers)].join(", ")}`);

  // ── Individual Brokerage holdings ────────────────────────────────────────
  lines.push("\n=== INDIVIDUAL BROKERAGE HOLDINGS (position pages at /positions/TICKER) ===");
  for (const h of holdings) {
    const d = positionDetails[h.ticker];
    lines.push(`\n${h.ticker} — ${h.company} | ${h.category} / ${h.subcategory} | ${h.portfolioPct}%`);
    lines.push(`  Thesis: ${h.thesis}`);
    if (d?.whyIOwnIt) lines.push(`  Why I Own It: ${d.whyIOwnIt}`);
    if (d?.whyThisSleeve) lines.push(`  Why This Sleeve: ${d.whyThisSleeve}`);
    if (d?.bullCase)  lines.push(`  Bull: ${d.bullCase.title} — ${d.bullCase.summary}`);
    if (d?.baseCase)  lines.push(`  Base: ${d.baseCase.title} — ${d.baseCase.summary}`);
    if (d?.bearCase)  lines.push(`  Bear: ${d.bearCase.title} — ${d.bearCase.summary}`);
    if (d?.risks?.length)     lines.push(`  Risks: ${cap(d.risks, 3).join(" | ")}`);
    if (d?.watchList?.length) lines.push(`  Watching: ${cap(d.watchList, 3).join(" | ")}`);
    if (d?.trimEvents?.length) {
      for (const t of d.trimEvents) {
        if (t.type === "partial_trim") {
          lines.push(`  Position Change (${t.date}): Partial trim @ $${t.pricePerShare}/sh. ${t.explanation}`);
        } else if (t.type === "add") {
          lines.push(`  Position Change (${t.date}): Added${t.pricePerShare ? ` @ $${t.pricePerShare}/sh` : ""}. ${t.explanation}`);
        } else if (t.type === "recurring_add") {
          lines.push(`  Position Change (${t.date}): Recurring add. ${t.explanation}`);
        } else if (t.type === "pending_stop_loss") {
          lines.push(`  Position Change (${t.date}): Pending stop-loss order placed. ${t.explanation}`);
        }
      }
    }
  }

  // ── Roth Retirement Account holdings ─────────────────────────────────────
  lines.push("\n=== ROTH RETIREMENT ACCOUNT HOLDINGS (at /portfolio/roth-ira) ===");
  for (const h of rothIraHoldings) {
    const d = positionDetails[h.ticker];
    const meta = [
      h.assetType,
      h.subcategory,
      `${h.portfolioWeightPct}% of account`,
      h.returnPct !== undefined ? `return: ${h.returnPct > 0 ? "+" : ""}${h.returnPct}%` : null,
      h.country,
      h.marketCap,
    ].filter(Boolean).join(" | ");
    lines.push(`\n${h.ticker} — ${h.company} | ${meta}`);
    if (h.thesis) lines.push(`  Thesis: ${h.thesis}`);
    if (d?.whyIOwnIt)     lines.push(`  Why I Own It: ${d.whyIOwnIt}`);
    if (d?.whyThisSleeve) lines.push(`  Why This Sleeve: ${d.whyThisSleeve}`);
    if (d?.bullCase)  lines.push(`  Bull: ${d.bullCase.title} — ${d.bullCase.summary}`);
    if (d?.baseCase)  lines.push(`  Base: ${d.baseCase.title} — ${d.baseCase.summary}`);
    if (d?.bearCase)  lines.push(`  Bear: ${d.bearCase.title} — ${d.bearCase.summary}`);
    if (d?.risks?.length)     lines.push(`  Risks: ${cap(d.risks, 3).join(" | ")}`);
    if (d?.watchList?.length) lines.push(`  Watching: ${cap(d.watchList, 3).join(" | ")}`);
    if (d?.trimEvents?.length) {
      for (const t of d.trimEvents) {
        if (t.type === "partial_trim") {
          lines.push(`  Position Change (${t.date}): Partial trim @ $${t.pricePerShare}/sh. ${t.explanation}`);
        } else if (t.type === "add") {
          lines.push(`  Position Change (${t.date}): Added${t.pricePerShare ? ` @ $${t.pricePerShare}/sh` : ""}. ${t.explanation}`);
        } else if (t.type === "recurring_add") {
          lines.push(`  Position Change (${t.date}): Recurring add. ${t.explanation}`);
        } else if (t.type === "pending_stop_loss") {
          lines.push(`  Position Change (${t.date}): Pending stop-loss order placed. ${t.explanation}`);
        }
      }
    }
  }

  // ── ETF Exposure look-through ─────────────────────────────────────────────
  // VOO and SMH also appear in Roth Retirement Account above; cross-account note prevents duplication.
  lines.push("\n=== ETF EXPOSURE — LOOK-THROUGH VIEW (at /portfolio/etfs) ===");
  const rothTickers = new Set(rothIraHoldings.map((h) => h.ticker));

  for (const h of etfsSleeveHoldings) {
    const crossNote = rothTickers.has(h.ticker) ? " [also in Roth Retirement Account above]" : "";
    lines.push(
      `${h.ticker} — ${h.company} | ${h.assetType} | ${h.portfolioWeightPct}% of exposure${crossNote}`
      + (h.returnPct !== undefined ? ` | return: ${h.returnPct > 0 ? "+" : ""}${h.returnPct}%` : "")
      + (h.thesis ? ` | ${h.thesis}` : "")
    );
  }

  // ── Archived / previous holdings ──────────────────────────────────────────
  lines.push("\n=== ARCHIVED POSITIONS — CLOSED, NOT CURRENT (pages at /archive/TICKER) ===");
  for (const h of previousHoldings) {
    lines.push(`\n${h.ticker} — ${h.company} | ARCHIVED | Held ${h.ownedFrom}–${h.ownedTo} | ${h.sleeve} sleeve | Exit: ${h.exitType}`);
    lines.push(`  Summary: ${h.summaryReason}`);
    lines.push(`  Original Thesis: ${h.originalThesis}`);
    lines.push(`  What Changed: ${h.whatChanged}`);
    lines.push(`  Why I Exited: ${h.whyExited}`);
    lines.push(`  Lesson: ${h.lesson}`);
    if (h.estimatedEntryPrice) lines.push(`  Entry: ~$${h.estimatedEntryPrice}`);
  }

  return lines.join("\n");
}
