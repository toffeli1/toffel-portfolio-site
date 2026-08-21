// ─── Transaction classification ───────────────────────────────────────────────
// Maps the provider's own type/description strings onto TxKind.
//
// DESIGN RULE: unrecognised rows resolve to "unknown" and are collected, never
// guessed. A mis-classified row silently corrupts NAV, the TWR and every weight
// downstream, so the pipeline REFUSES to publish a reconstruction while any row
// is unresolved (see engine.ts). Better to stop and extend the table.
//
// The patterns below are ordered most-specific first. They are matched against
// the concatenation of the provider's type and description, lowercased.

import type { TxKind } from "./types";

interface Rule {
  kind: TxKind;
  /** All must appear for the rule to fire. */
  all?: string[];
  /** Any one is sufficient. */
  any?: string[];
  /** None may appear. */
  none?: string[];
}

const RULES: Rule[] = [
  // Corporate actions first — their descriptions often also contain "stock".
  { kind: "split", any: ["stock split", "forward split", "reverse split", "split adjustment"] },
  { kind: "stock_distribution", any: ["stock distribution", "spin-off", "spinoff", "share distribution"] },

  // In-kind transfers must beat the generic transfer rules.
  { kind: "transfer_in_kind", all: ["transfer"], any: ["in kind", "in-kind", "acat", "securities received", "received securities"], none: ["out", "delivered"] },
  { kind: "transfer_out_kind", all: ["transfer"], any: ["in kind", "in-kind", "acat"], },

  // Income.
  { kind: "dividend", any: ["dividend", "distribution received", "cash div"], none: ["stock distribution"] },
  { kind: "interest", any: ["interest", "gold cash sweep", "cash sweep"] },

  // Costs.
  { kind: "fee", any: ["fee", "commission", "adr fee", "regulatory", "taf", "sec fee"] },
  { kind: "tax", any: ["tax withheld", "withholding", "backup withholding"] },

  // External cash.
  { kind: "contribution", any: ["contribution", "deposit", "ach in", "incoming ach"], none: ["withdraw", "reversal"] },
  { kind: "withdrawal", any: ["withdrawal", "ach out", "outgoing ach", "distribution to"] },
  { kind: "transfer_in_cash", all: ["transfer"], any: ["in", "received", "incoming"], none: ["out", "kind"] },
  { kind: "transfer_out_cash", all: ["transfer"], any: ["out", "sent", "outgoing"], none: ["kind"] },

  // Trades last — the broadest patterns.
  { kind: "buy", any: ["buy", "bought", "purchase"] },
  { kind: "sell", any: ["sell", "sold", "sale"] },
];

/**
 * Resolve a transaction kind.
 *
 * The export carries a clean `type` column (buy | sell | transfer | cash), which
 * is far more reliable than text matching and is therefore dispatched on FIRST.
 * Description patterns are only a fallback.
 *
 * Why this ordering matters: "Schwab US Dividend Equity ETF" and the
 * "dividend reinvestment" subtype both contain the word "dividend", so a
 * description-first classifier books share purchases as income — inventing cash
 * that never arrived and losing the shares that did. `type: "buy"` settles it.
 */
export function classify(
  rawType?: string,
  rawDescription?: string,
  subtype?: string,
  hasTicker?: boolean,
  quantity?: number
): TxKind {
  const type = (rawType ?? "").trim().toLowerCase();
  const sub = (subtype ?? "").trim().toLowerCase();
  const desc = (rawDescription ?? "").toLowerCase();

  // Corporate actions win over everything, including an explicit type.
  if (/split/.test(sub) || /\bsplit\b/.test(desc)) return "split";
  if (/stock distribution|spin-?off/.test(sub + " " + desc)) return "stock_distribution";

  // Explicit trade types. A dividend-reinvestment purchase is still a purchase:
  // the cash dividend arrives as its own `cash/dividend` row, and this row is
  // the buy that spends it.
  if (type === "buy") return "buy";
  if (type === "sell") return "sell";

  if (type === "cash") {
    if (/dividend/.test(sub + " " + desc)) return "dividend";
    if (/interest|sweep/.test(sub + " " + desc)) return "interest";
    if (/fee|commission/.test(sub + " " + desc)) return "fee";
    if (/tax|withholding/.test(sub + " " + desc)) return "tax";
  }

  if (type === "transfer") {
    // Securities moving in kind: a ticker and a non-zero quantity.
    if (hasTicker && (quantity ?? 0) !== 0) {
      return /out|delivered|sent/.test(desc) ? "transfer_out_kind" : "transfer_in_kind";
    }
    // Cash transfers. "Contribution"/"deposit" is the retirement-account
    // funding language; anything else incoming is a plain account transfer.
    if (/contribution|deposit/.test(desc)) return "contribution";
    if (/withdraw|distribution to/.test(desc)) return "withdrawal";
    if (/outgoing|sent|out of/.test(desc)) return "transfer_out_cash";
    return "transfer_in_cash";
  }

  const hay = `${rawType ?? ""} ${rawDescription ?? ""} ${subtype ?? ""}`.toLowerCase();
  if (!hay.trim()) return "unknown";

  for (const rule of RULES) {
    if (rule.all && !rule.all.every((t) => hay.includes(t))) continue;
    if (rule.any && !rule.any.some((t) => hay.includes(t))) continue;
    if (rule.none && rule.none.some((t) => hay.includes(t))) continue;
    return rule.kind;
  }
  return "unknown";
}

export function isTradeKind(kind: TxKind): boolean {
  return kind === "buy" || kind === "sell";
}
