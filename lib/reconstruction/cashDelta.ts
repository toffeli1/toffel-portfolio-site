// ─── Provider convention → portfolio cash delta ───────────────────────────────
// The single most error-prone part of the reconstruction, isolated here so it can
// be tested exhaustively.
//
// WHY THIS EXISTS
// The Robinhood export's `amount` sign does NOT map directly onto "money into or
// out of the portfolio". Observed conventions in this export:
//
//   purchases          → POSITIVE amount   (cash leaves the account)
//   sales              → NEGATIVE amount   (cash enters the account)
//   contributions      → NEGATIVE amount   (cash enters the account)
//
// Taking `amount` at face value would therefore invert buys against sells AND
// treat contributions as outflows. Every branch below converts the provider's
// convention into two explicit, independent quantities:
//
//   cashDelta    — signed change in the settled cash balance
//   externalFlow — signed EXTERNAL flow for TWR purposes
//
// These are deliberately separate. A buy moves cash but is internal (flow 0). A
// contribution moves cash and is external. A dividend moves cash and is return,
// not a flow. Conflating them is what makes a TWR wrong.

import type { Transaction, TxKind } from "./types";

export interface CashEffect {
  /** Change in settled cash. */
  cashDelta: number;
  /** External flow for TWR. Positive = capital entering. Zero for internal events. */
  externalFlow: number;
  /** Dividend / interest recognised as investment return. */
  income: number;
  /** Fees / taxes recognised as a drag on return. */
  fees: number;
  /** Signed change in share count for `ticker`. */
  shareDelta: number;
}

const ZERO: CashEffect = { cashDelta: 0, externalFlow: 0, income: 0, fees: 0, shareDelta: 0 };

/** Every kind the effect function resolves. Exported for the test matrix. */
export const HANDLED_KINDS: TxKind[] = [
  "buy", "sell", "contribution", "withdrawal", "transfer_in_cash",
  "transfer_out_cash", "transfer_in_kind", "transfer_out_kind",
  "dividend", "interest", "fee", "tax", "split", "stock_distribution",
];

/**
 * THE UNIVERSAL RULE, verified against the actual export:
 *
 *   cashDelta = -amount - fees
 *
 * The provider signs `amount` as "value applied against cash", so a positive
 * amount always means cash LEAVING and a negative amount always means cash
 * ENTERING — consistently, across every transaction type:
 *
 *   a purchase            positive amount → cash out  ✓
 *   a sale                negative amount → cash in   ✓
 *   a contribution        negative amount → cash in   ✓
 *   a cash dividend       negative amount → cash in   ✓
 *   an incoming transfer  negative amount → cash in   ✓
 *   an incoming DEBIT     positive amount → cash OUT  ✓
 *
 * That last case is why this is a signed rule rather than a per-kind magnitude
 * rule. An opening balance transfer can arrive NEGATIVE (a margin debit) while
 * its description still reads "incoming transfer". Taking the magnitude and
 * treating any "transfer in" as positive credits the account instead of debiting
 * it — an error of twice the balance, at inception, propagating through every
 * subsequent return.
 *
 * `fees` is a separate column and is NOT included in `amount`, so it is
 * subtracted on top.
 *
 * The transaction KIND is therefore used only to decide what the movement MEANS
 * (external flow vs investment return vs internal reallocation) — never to
 * decide its direction.
 */
export function cashEffect(tx: Transaction): CashEffect {
  const fees = tx.fees ?? 0;
  const cashDelta = -tx.rawAmount - fees;
  const qty = tx.quantity ?? 0;

  switch (tx.kind) {
    // ── Internal: value moves between cash and securities; NAV unchanged ────
    case "buy":
      return { cashDelta, externalFlow: 0, income: 0, fees, shareDelta: +qty };
    case "sell":
      return { cashDelta, externalFlow: 0, income: 0, fees, shareDelta: -qty };

    // ── External: changes NAV without being performance ─────────────────────
    // externalFlow mirrors cashDelta, so a debit transfer is a NEGATIVE flow.
    case "contribution":
    case "withdrawal":
    case "transfer_in_cash":
    case "transfer_out_cash":
      return { cashDelta, externalFlow: cashDelta, income: 0, fees, shareDelta: 0 };

    // In-kind securities: shares move, cash does not. The engine prices the
    // flow, since `amount` is 0 on these rows.
    case "transfer_in_kind":
      return { cashDelta, externalFlow: 0, income: 0, fees, shareDelta: +qty };
    case "transfer_out_kind":
      return { cashDelta, externalFlow: 0, income: 0, fees, shareDelta: -qty };

    // ── Investment return: cash moves, but it is NOT an external flow ───────
    case "dividend":
    case "interest":
      return { cashDelta, externalFlow: 0, income: -tx.rawAmount, fees, shareDelta: 0 };
    case "fee":
    case "tax":
      return { cashDelta, externalFlow: 0, income: 0, fees: fees + tx.rawAmount, shareDelta: 0 };

    // ── Corporate actions ───────────────────────────────────────────────────
    // A split scales the whole position, which a per-row function can't see, so
    // the engine applies it. Returning ZERO guarantees a split can never move
    // cash or masquerade as a flow.
    case "split":
      return ZERO;
    case "stock_distribution":
      return { cashDelta: 0, externalFlow: 0, income: 0, fees: 0, shareDelta: +qty };

    case "unknown":
      return ZERO;
  }
}
/**
 * True when this kind's cash movement is an external flow. Used by the TWR layer
 * so the definition lives in exactly one place.
 */
export function isExternalFlow(kind: TxKind): boolean {
  return (
    kind === "contribution" ||
    kind === "withdrawal" ||
    kind === "transfer_in_cash" ||
    kind === "transfer_out_cash" ||
    kind === "transfer_in_kind" ||
    kind === "transfer_out_kind"
  );
}
