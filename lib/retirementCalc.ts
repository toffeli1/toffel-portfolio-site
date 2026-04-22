// ── IRS Roth IRA Contribution Limits ──────────────────────────────────────────
// Update these when the IRS adjusts annual limits.
export const ROTH_LIMIT_UNDER_50 = 7_000;  // 2024–2025
export const ROTH_LIMIT_50_PLUS  = 8_000;  // 2024–2025 with catch-up

// ── Taxable Account Tax-Drag Model ────────────────────────────────────────────
//
// The taxable account model has two components:
//
//   1. Annual drag — each year a fraction of gross gains is realized (dividends,
//      short-term turnover) and taxed at the marginal ordinary-income rate.
//      We assume 30 % of annual gross return is realized annually — a
//      conservative figure for a broadly diversified equity portfolio.
//      This reduces the compounding rate each year.
//
//   2. Exit tax — at retirement the remaining unrealized long-term gains are
//      taxed at a flat 20 % LTCG rate (top-bracket assumption; adjust
//      LTCG_RATE_AT_WITHDRAWAL for your actual bracket).
//
// Effective taxable return per year:
//   taxableRate = grossRate × (1 − ANNUAL_REALIZATION_RATE × marginalTaxRate)
//
// At retirement:
//   taxableNet = grossBalance − (grossBalance − costBasis) × LTCG_RATE

export const ANNUAL_REALIZATION_RATE  = 0.30; // fraction of gains realized annually
export const LTCG_RATE_AT_WITHDRAWAL  = 0.20; // applied to unrealized gain at exit

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CalcInputs {
  startingBalance: number;
  currentAge: number;
  annualContribution: number;
  retirementAge: number;
  /** Gross annual return as decimal, e.g. 0.07 */
  returnRate: number;
  /** Marginal income-tax rate as decimal, e.g. 0.24 */
  marginalTaxRate: number;
  maximizeContributions: boolean;
  /** Annual contribution growth rate as decimal, e.g. 0.02 */
  contributionGrowthRate: number;
}

export interface YearlyPoint {
  age: number;
  /** Roth IRA market value */
  roth: number;
  /** Taxable account market value (gross; exit tax applied at final year in result) */
  taxable: number;
}

export interface CalcResult {
  rothFinal: number;
  taxableFinal: number;   // after LTCG exit tax
  advantage: number;      // rothFinal − taxableFinal
  yearsToRetirement: number;
  yearlyData: YearlyPoint[];
  /** Effective annual return applied to taxable account (after annual drag) */
  taxableEffectiveRate: number;
  /** Total contributions made over the period */
  totalContributions: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getRothLimit(age: number): number {
  return age >= 50 ? ROTH_LIMIT_50_PLUS : ROTH_LIMIT_UNDER_50;
}

// ── Core calculation ──────────────────────────────────────────────────────────

export function compute(inputs: CalcInputs): CalcResult {
  const {
    startingBalance,
    currentAge,
    retirementAge,
    returnRate,
    marginalTaxRate,
    maximizeContributions,
    contributionGrowthRate,
    annualContribution,
  } = inputs;

  const years = Math.max(0, Math.floor(retirementAge - currentAge));

  // Effective taxable annual return after annual realization drag
  const taxableEffectiveRate =
    returnRate * (1 - ANNUAL_REALIZATION_RATE * marginalTaxRate);

  const yearlyData: YearlyPoint[] = [];
  let roth       = startingBalance;
  let taxable    = startingBalance;
  let costBasis  = startingBalance;
  let contrib    = annualContribution;
  let totalContribs = 0;

  for (let y = 0; y <= years; y++) {
    const age = currentAge + y;
    yearlyData.push({ age, roth: Math.round(roth), taxable: Math.round(taxable) });

    if (y < years) {
      const c = maximizeContributions ? getRothLimit(age) : contrib;

      roth     = (roth    + c) * (1 + returnRate);
      taxable  = (taxable + c) * (1 + taxableEffectiveRate);
      costBasis   += c;
      totalContribs += c;

      if (!maximizeContributions && contributionGrowthRate > 0) {
        contrib *= 1 + contributionGrowthRate;
      }
    }
  }

  // Apply LTCG at retirement liquidation
  const unrealizedGain   = Math.max(0, taxable - costBasis);
  const taxableAfterExit = taxable - unrealizedGain * LTCG_RATE_AT_WITHDRAWAL;

  return {
    rothFinal: Math.round(roth),
    taxableFinal: Math.round(taxableAfterExit),
    advantage: Math.round(roth - taxableAfterExit),
    yearsToRetirement: years,
    yearlyData,
    taxableEffectiveRate,
    totalContributions: Math.round(totalContribs),
  };
}
