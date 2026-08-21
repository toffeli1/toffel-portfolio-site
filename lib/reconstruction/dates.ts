// ─── Date semantics ───────────────────────────────────────────────────────────
// The export carries two dates that mean different things, and using the wrong
// one moves a position into the wrong day.
//
//   transaction_datetime — when the order actually executed
//   date                 — when it settled / posted
//
// CONVENTION, as specified:
//
//   Trades (buy / sell)
//     Use the calendar date of transaction_datetime. Exposure changes when the
//     trade executes, not when it settles. The OSCR purchase executing July 3
//     and settling July 7 is a JULY 3 purchase for holdings, weights and the
//     Decision Log. Falls back to postedDate only when no timestamp exists.
//
//   External cash flows (contributions, withdrawals, cash transfers)
//     Use postedDate — the date the cash became economically available. A
//     contribution initiated earlier but posted later is not investable capital
//     until it posts, so dating it earlier would understate the return the
//     account had to earn on it.
//
//   Income, fees, taxes
//     Use postedDate. These are recognised when they hit the account.
//
//   Opening in-kind transfers
//     Forced to the tracking inception date. The transfer process starts before
//     inception, so its timestamps predate July 3 — but the securities become
//     the account's OPENING STATE on July 3. Dating them earlier would create a
//     pre-inception window; treating them as inception-day activity would book
//     the transfer as performance. Neither is correct, so they are pinned.
//
// Timestamps are interpreted in US Eastern, the exchange calendar the trades
// executed on. Parsing an ISO timestamp in UTC would push a late-afternoon
// Eastern execution onto the following calendar day.

const ET_TIMEZONE = "America/New_York";

/** Calendar date (YYYY-MM-DD) of an ISO timestamp, in US Eastern. */
export function easternCalendarDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export interface EffectiveDateInput {
  postedDate: string;
  transactionDatetime?: string;
  isTrade: boolean;
  isOpeningInKind?: boolean;
  inceptionDate?: string;
}

export function effectiveDate(input: EffectiveDateInput): string {
  if (input.isOpeningInKind && input.inceptionDate) return input.inceptionDate;
  if (input.isTrade && input.transactionDatetime) {
    return easternCalendarDate(input.transactionDatetime);
  }
  return input.postedDate.slice(0, 10);
}

/** Human-readable convention summary, surfaced in the reconstruction report. */
export const DATE_CONVENTION_SUMMARY = [
  "Trades are dated by execution (transaction_datetime, US Eastern calendar date), not settlement.",
  "External cash flows, income and fees are dated by posted/settlement date.",
  "Opening in-kind transfers are pinned to the tracking inception date and booked as opening NAV, not as return.",
].join(" ");


/**
 * Snap a date to the first trading session on or after it.
 *
 * Applied at INGESTION so every downstream consumer — ownership episodes,
 * current-interval detection, lifecycle events, Decision Log weights, holding
 * periods — sees one canonical date. Normalizing further downstream produced an
 * inconsistency where a position's public start date and its private episode
 * start disagreed: a Saturday-stamped CBRS purchase read 2026-08-15 in the
 * episode diagnostic and 2026-08-17 everywhere else.
 *
 * A trade cannot execute when the exchange is shut, so rolling forward is the
 * only defensible direction.
 */
export function normalizeToSession(date: string, sessions: string[]): string {
  if (sessions.length === 0) return date;
  return sessions.find((s) => s >= date) ?? date;
}
