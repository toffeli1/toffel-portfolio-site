// ─── Permanent Portfolio Strategy note ────────────────────────────────────────
// Pinned to the top of the Decision Log. Not a dated trade — it is the standing
// explanation for why the book moved away from broad S&P 500 indexing, which is
// the decision every other entry sits underneath.
//
// Written to be analytical rather than inspirational: it states the reasoning
// and the accepted trade-off, and does not editorialise about the outcome.

export interface StrategyNote {
  heading: string;
  body: string[];
}

export const portfolioStrategy: StrategyNote = {
  heading: "Portfolio Strategy",
  body: [
    "Passive indexing is not treated here as a bad strategy. The S&P 500 is one of the most efficient low-effort ways to compound capital, and moving away from it was not a judgement that indexing is flawed.",
    "The decision rested on two things. The first was evidence: the portfolio beat the market in the prior year, and the intent now is to test whether that excess return can be repeated by allocating directly to companies and sectors where conviction is strongest. A single year is not proof of skill, which is precisely why it is worth testing rather than assuming.",
    "The second is deliberate: the portfolio is meant to force improvement as an investor. At twenty, learning how to analyse companies, size positions, manage volatility, react to earnings, understand concentration, and live through incorrect decisions carries value that a single index position cannot provide.",
    "The trade-off is accepted explicitly. Continuing to outperform the S&P 500 would be a strong outcome. Underperforming by a few hundred basis points while developing substantially stronger investing skill is still considered worthwhile at this stage.",
  ],
};
