// ─── Performance window configuration ─────────────────────────────────────────
// Separates two dates that must never be conflated:
//
//   trackingInceptionDate — July 3, 2025. The earliest Robinhood Roth activity,
//                           and the intended inception for reported performance.
//   seriesStartDate       — the earliest month-end NAV mark that actually exists
//                           in data/performanceSeed.local.json.
//
// Right now these disagree, and that disagreement is a DATA GAP, not a reason to
// redefine inception. The engine accepts history starting July 3; it simply has
// none yet. August 1 is NOT the true investment inception and is never labelled
// as such — it is the start of the currently computable series.

export interface InceptionGap {
  /** Intended inception per the account's real activity. */
  trackingInceptionDate: string;
  /** First month-end NAV available in the seed. */
  seriesStartDate: string;
  /** Whether the computable series already reaches tracking inception. */
  complete: boolean;
  /** Exactly what is missing, for the public disclosure and the report. */
  missingInputs: string[];
}

export const TRACKING_INCEPTION_DATE = "2025-07-03";

/**
 * Compare intent against what the seed can support.
 * `seedBaseNavDate` is the seed's base NAV date (currently 2025-07-31).
 */
export function inceptionGap(seedBaseNavDate: string): InceptionGap {
  const complete = seedBaseNavDate <= TRACKING_INCEPTION_DATE;
  return {
    trackingInceptionDate: TRACKING_INCEPTION_DATE,
    seriesStartDate: seedBaseNavDate,
    complete,
    missingInputs: complete
      ? []
      : [
          `Opening portfolio value on ${TRACKING_INCEPTION_DATE} (the first day of Robinhood Roth activity).`,
          `Month-end portfolio value for 2025-07-31 already exists; what is missing is the ${TRACKING_INCEPTION_DATE} starting value that makes July 2025 a measurable period.`,
          "Every deposit, withdrawal and transfer dated between 2025-07-03 and 2025-07-31, so July's Modified Dietz return can be computed without external flows distorting it.",
          "Confirmation of whether the account was funded by ACAT transfer in that window — a transfer-in must be treated as an external flow, not as investment return.",
        ],
  };
}

/** Public-facing description of the window actually being reported. */
export function windowDisclosure(gap: InceptionGap): string {
  if (gap.complete) {
    return `Performance is reported from ${gap.trackingInceptionDate}, the first day of account activity.`;
  }
  return (
    `Tracking inception is ${gap.trackingInceptionDate}, the first day of Robinhood Roth activity. ` +
    `The return series below currently begins ${gap.seriesStartDate}, which is the earliest ` +
    `month-end portfolio value in the dataset — the July 3–31, 2025 period is not yet ` +
    `computable and is excluded rather than estimated. This is a gap in source data, not ` +
    `the account's true inception.`
  );
}
