// ─── Shared design tokens ──────────────────────────────────────────────────
// The one place every page/component should read color, radius, shadow and
// border values from, instead of re-typing the same hex/rgba strings. Values
// below are unchanged from what was already in use site-wide (this is a
// consolidation, not a repaint) except NEGATIVE, which had drifted into two
// different reds used for the same meaning; RADIUS_CARD, which is smaller
// than the rounded-2xl every card used before; and SHADOW_CARD, which is now
// flat (definition comes from CARD_BORDER, not a drop shadow).

export const INK = "#0f1e35";      // primary text, headlines
export const BODY = "#2d3d52";     // body paragraph text
export const MUTED = "#5a6e82";    // secondary / meta text
export const FAINT = "#7a8799";    // tertiary text, eyebrows, captions
export const CREAM = "#faf7f2";    // page background

export const ACCENT = "#1a4a2e";   // brand green — UI chrome, buy/add tags
export const POSITIVE = "#15542e"; // numeric positive — deliberately darker
                                    // than ACCENT so a return figure reads as
                                    // data, not as the same green as UI chrome
export const NEGATIVE = "#8b2530"; // numeric negative, exits, losses — the
                                    // single red; #8b1a1a is retired
export const AMBER = "#7a4520";    // trims, pending, dev-only states

export const HAIRLINE = "rgba(15,30,53,0.08)";     // section/row dividers
export const CARD_BORDER = "rgba(15,30,53,0.10)";  // card/panel edges

export const RADIUS_CARD = 10; // px — cards, panels, chart wrappers
export const RADIUS_TAG = 4;   // px — status/action/meta tags
export const RADIUS_PILL = 999; // legend dots and the rare true toggle pill

export const SHADOW_CARD = "none";
// Reserved for things that are genuinely floating above the page (nav on
// scroll, chart tooltips, the chat overlay) — never the default card state.
export const SHADOW_ELEVATED = "0 2px 12px rgba(15,30,53,0.08)";

/** Spread onto any card/panel container. */
export const CARD = {
  background: "#ffffff",
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: RADIUS_CARD,
  boxShadow: SHADOW_CARD,
} as const;

/** Standard vertical rhythm for stacked page sections. */
export const SECTION_Y = "py-16 lg:py-20";
export const HERO_Y = "py-16 lg:py-24";

export function tone(n: number): string {
  return n >= 0 ? POSITIVE : NEGATIVE;
}
