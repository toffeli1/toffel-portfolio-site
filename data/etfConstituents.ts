export interface EtfConstituent {
  ticker: string;
  company: string;
  weightPct: number;
  sector?: string;
}

export interface SectorAllocation {
  sector: string;
  weightPct: number;
}

export interface EtfProfile {
  ticker: string;
  fullName: string;
  description: string;
  constituents: EtfConstituent[];
  constituentsNote: string;
  /** When present, rendered as the primary breakdown instead of individual constituents. */
  sectorBreakdown?: SectorAllocation[];
}

export const etfProfiles: Record<string, EtfProfile> = {
  QQQM: {
    ticker: "QQQM",
    fullName: "Invesco Nasdaq-100 ETF",
    description:
      "Tracks the Nasdaq-100 Index, comprising 100 of the largest non-financial companies listed on the Nasdaq Stock Market.",
    constituentsNote:
      "Representative top-10 holdings shown. Actual weights shift with market prices.",
    constituents: [
      { ticker: "MSFT",  company: "Microsoft",       weightPct: 8.5, sector: "Technology" },
      { ticker: "AAPL",  company: "Apple",            weightPct: 8.2, sector: "Technology" },
      { ticker: "NVDA",  company: "NVIDIA",           weightPct: 7.9, sector: "Semiconductors" },
      { ticker: "AMZN",  company: "Amazon",           weightPct: 5.4, sector: "Consumer / Cloud" },
      { ticker: "META",  company: "Meta Platforms",   weightPct: 5.1, sector: "Technology" },
      { ticker: "GOOGL", company: "Alphabet",         weightPct: 4.7, sector: "Technology" },
      { ticker: "TSLA",  company: "Tesla",            weightPct: 3.1, sector: "Consumer / EV" },
      { ticker: "AVGO",  company: "Broadcom",         weightPct: 2.9, sector: "Semiconductors" },
      { ticker: "COST",  company: "Costco",           weightPct: 2.8, sector: "Consumer" },
      { ticker: "NFLX",  company: "Netflix",          weightPct: 2.5, sector: "Media / Streaming" },
    ],
  },

  SMH: {
    ticker: "SMH",
    fullName: "VanEck Semiconductor ETF",
    description:
      "Tracks the MVIS US Listed Semiconductor 25 Index, providing targeted exposure to global semiconductor equipment, materials, and chip leaders.",
    constituentsNote:
      "Representative top-10 holdings shown. Actual weights shift with market prices.",
    constituents: [
      { ticker: "NVDA",  company: "NVIDIA",                  weightPct: 19.8, sector: "GPUs / AI" },
      { ticker: "TSM",   company: "Taiwan Semiconductor",    weightPct: 11.6, sector: "Foundry" },
      { ticker: "ASML",  company: "ASML Holding",            weightPct: 8.1,  sector: "Lithography" },
      { ticker: "AVGO",  company: "Broadcom",                weightPct: 5.9,  sector: "Networking / RF" },
      { ticker: "AMAT",  company: "Applied Materials",       weightPct: 5.3,  sector: "Equipment" },
      { ticker: "QCOM",  company: "Qualcomm",                weightPct: 5.0,  sector: "Mobile / IoT" },
      { ticker: "MU",    company: "Micron Technology",       weightPct: 4.8,  sector: "Memory" },
      { ticker: "AMD",   company: "Advanced Micro Devices",  weightPct: 4.5,  sector: "CPUs / GPUs" },
      { ticker: "LRCX",  company: "Lam Research",            weightPct: 4.2,  sector: "Equipment" },
      { ticker: "TXN",   company: "Texas Instruments",       weightPct: 4.0,  sector: "Analog" },
    ],
  },

  VOO: {
    ticker: "VOO",
    fullName: "Vanguard S&P 500 ETF",
    description:
      "Tracks the S&P 500 Index, providing broad, low-cost exposure to 500 of the largest U.S. publicly traded companies across all sectors — technology, financials, healthcare, consumer, industrials, communication services, energy, utilities, materials, and real estate.",
    constituentsNote: "",
    constituents: [],
    sectorBreakdown: [
      { sector: "Information Technology",    weightPct: 32.90 },
      { sector: "Financials",                weightPct: 12.60 },
      { sector: "Communication Services",    weightPct: 10.30 },
      { sector: "Consumer Discretionary",    weightPct:  9.90 },
      { sector: "Health Care",               weightPct:  9.50 },
      { sector: "Industrials",               weightPct:  9.00 },
      { sector: "Consumer Staples",          weightPct:  5.30 },
      { sector: "Energy",                    weightPct:  4.00 },
      { sector: "Utilities",                 weightPct:  2.50 },
      { sector: "Materials",                 weightPct:  2.10 },
      { sector: "Real Estate",               weightPct:  1.90 },
    ],
  },
};
