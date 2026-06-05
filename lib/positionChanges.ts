// Derives public-safe Position Changes cards from the underlying transaction
// event log. Pulls dates and counts from positionEvents and enriches each card
// with the matching Decision Log note (when one exists in the same month).
//
// Privacy contract: this module is the only path that builds the Position
// Changes section for tickers with positionEvents data. It MUST NOT surface
// share counts, execution prices, or dollar amounts. Output fields are
// restricted by the PositionChangeCard interface below.

import { decisionLog } from "@/data/decisionLog";
import { positionEvents, type SellEvent } from "./positionLots";

export type PositionChangeKind = "trim" | "trim_series" | "exit";

export interface PositionChangeCard {
  /** Primary date of the change (start date for a grouped series). */
  date: string;
  /** End date when multiple sells are grouped into one series card. */
  endDate?: string;
  /** Card label rendered as the action chip. */
  kind: PositionChangeKind;
  /** Number of underlying sell events in this card. */
  count: number;
  /** Public-safe explanation, sourced from a linked Decision Log entry when present. */
  note?: string;
  /** Linked decision log entry id, if any. */
  decisionId?: string;
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

/**
 * Decision Log entries are tagged by ticker and action. Match a sell-card to
 * the most relevant Trim/Exit decision for the same ticker in the same month.
 * If no exact-month match exists, fall back to the closest Trim/Exit within
 * 7 days of the primary card date.
 */
function findMatchingDecision(
  ticker: string,
  primaryDate: string
): { note: string; id?: string } | undefined {
  const cardYm = monthKey(primaryDate);
  const candidates = decisionLog.filter(
    (e) =>
      e.ticker === ticker &&
      (e.action === "Trim" || e.action === "Exit")
  );
  // Same-month exact match first.
  const sameMonth = candidates.find((e) => monthKey(e.date) === cardYm);
  if (sameMonth) return { note: sameMonth.note, id: sameMonth.id };
  // Loose match within ±7 days.
  const cardMs = Date.parse(primaryDate);
  for (const e of candidates) {
    if (e.date.length !== 10) continue; // skip month-resolution entries
    const delta = Math.abs(Date.parse(e.date) - cardMs);
    if (delta <= 7 * 24 * 60 * 60 * 1000) return { note: e.note, id: e.id };
  }
  return undefined;
}

export function getPositionChanges(ticker: string): PositionChangeCard[] {
  const events = positionEvents[ticker.toUpperCase()];
  if (!events || events.sells.length === 0) return [];

  // Group sells by year-month.
  const byMonth = new Map<string, SellEvent[]>();
  for (const s of events.sells) {
    const ym = monthKey(s.date);
    const bucket = byMonth.get(ym) ?? [];
    bucket.push(s);
    byMonth.set(ym, bucket);
  }

  const cards: PositionChangeCard[] = [];
  for (const [, group] of byMonth) {
    const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const match = findMatchingDecision(ticker, last.date)
      ?? findMatchingDecision(ticker, first.date);
    cards.push({
      date: first.date,
      endDate: sorted.length > 1 ? last.date : undefined,
      kind: sorted.length > 1 ? "trim_series" : "trim",
      count: sorted.length,
      note: match?.note,
      decisionId: match?.id,
    });
  }

  // Reverse-chronological (newest first), matching the rest of the site.
  cards.sort((a, b) => b.date.localeCompare(a.date));
  return cards;
}

export function formatPositionChangeDate(card: PositionChangeCard): string {
  if (card.kind === "trim_series" && card.endDate) {
    return formatMonth(monthKey(card.date));
  }
  const [y, m, d] = card.date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function positionChangeLabel(card: PositionChangeCard): string {
  if (card.kind === "exit") return "Full exit";
  if (card.kind === "trim_series") return `Trim series · ${card.count} sessions`;
  return "Partial trim";
}
