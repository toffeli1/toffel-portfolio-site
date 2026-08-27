// ─── Post-mortems ───────────────────────────────────────────────────────────
// Specific, first-person accounts of what went wrong on the account's current
// worst holdings. Real, published content, not analysis generated here.
//
// isPlaceholder follows the identical pattern used on thesis pages (see
// data/thesis/types.ts): gated out of production by the renderer in
// components/PostMortemSection.tsx, shown with a dashed dev-only treatment
// locally. None of the current entries use it; it exists so a future entry
// can be scaffolded the same way without inventing a new mechanism.

export interface PostMortem {
  ticker: string;
  body: string[];
  isPlaceholder?: boolean;
}

export const POST_MORTEM_LEAD_IN =
  "Three positions are down. Two of them are down for the same reason, which is the more useful lesson.";

export const postMortems: PostMortem[] = [
  {
    ticker: "ASTS",
    body: [
      "I bought ASTS in January 2026 as an asymmetric bet on satellite-to-cell, and added on weakness in May. The thesis was that orbital deployment would de-risk the technical story, which it partly did.",
      "What I got wrong was the timing structure, not the technology. ASTS needs a constellation deployed, regulators cleared, and carriers signed. None of those produce a readable signal in a quarter, so I sized a position I could not monitor as if I would get feedback along the way. The weight fell from 3.7% to 1.5% on price alone, not because I made a decision. I still hold it, but at a size that reflects a multi-year binary rather than a thesis I can track.",
    ],
  },
  {
    ticker: "RKLB",
    body: [
      "I opened RKLB three days after ASTS, in the same week, on the same theme. I told myself they were different: Rocket Lab has Electron revenue today and a space systems segment, while ASTS has none. Both of those things are true and neither of them mattered.",
      "The two moved together, because what actually drives both is sentiment toward pre-profit space names, not their individual business models. Combined they were about 5% of the book at entry, which is a real position, and I had not sized them as one. Diversification by ticker is not diversification by driver. I added to RKLB in July, which I would size differently now knowing I already own the exposure.",
    ],
  },
  {
    ticker: "META",
    body: [
      "META is the position where I let price be the thesis. I initiated small in January 2026 and added meaningfully in June, and the reason I gave myself at the time was that the stock had fallen.",
      "That is not a reason. Adding on weakness only works when the weakness is disconnected from the business, and I never established that it was. I just liked the entry better. It is down about 9% since. It also sits at roughly 9% of the book today, up from 4.4% in July, and that happened because I sold VOO rather than because I bought more META. Same mechanic as ASTS in reverse: the weight moved without a decision behind it. The lesson is not that the add was unprofitable. It is that I could not have told you what had improved.",
    ],
  },
];
