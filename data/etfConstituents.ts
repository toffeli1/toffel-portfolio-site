// ─── ETF constituent / underlying holdings ────────────────────────────────────
// Edit this file to update ETF top-holdings lists.
// Initial data shows representative top-10 holdings for each ETF.
// Replace with full constituent lists when available.
//
// constituentsNote is displayed on the ETF detail page as a disclaimer.

export interface EtfConstituent {
  ticker: string;
  company: string;
  weightPct: number;
  sector?: string;
}

export interface EtfProfile {
  ticker: string;
  fullName: string;
  description: string;
  constituents: EtfConstituent[];
  constituentsNote: string;
}

export const etfProfiles: Record<string, EtfProfile> = {
  QQQM: {
    ticker: "QQQM",
    fullName: "Invesco Nasdaq-100 ETF",
    description:
      "Tracks the Nasdaq-100 Index, comprising 100 of the largest non-financial companies listed on the Nasdaq Stock Market.",
    constituentsNote:
      "Representative top-10 holdings shown. Edit data/etfConstituents.ts to replace with a full constituent list.",
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
      "Representative top-10 holdings shown. Edit data/etfConstituents.ts to replace with a full constituent list.",
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
      "Tracks the S&P 500 Index, providing low-cost, diversified exposure to 500 of the largest U.S. publicly traded companies.",
    constituentsNote:
      "Representative top-10 holdings shown. Edit data/etfConstituents.ts to replace with a full constituent list.",
    constituents: [
      { ticker: "AAPL",  company: "Apple",              weightPct: 7.1, sector: "Technology" },
      { ticker: "MSFT",  company: "Microsoft",          weightPct: 6.5, sector: "Technology" },
      { ticker: "NVDA",  company: "NVIDIA",             weightPct: 6.2, sector: "Semiconductors" },
      { ticker: "AMZN",  company: "Amazon",             weightPct: 3.7, sector: "Consumer / Cloud" },
      { ticker: "META",  company: "Meta Platforms",     weightPct: 2.8, sector: "Technology" },
      { ticker: "GOOGL", company: "Alphabet",           weightPct: 2.5, sector: "Technology" },
      { ticker: "BRK.B", company: "Berkshire Hathaway", weightPct: 1.9, sector: "Financials" },
      { ticker: "LLY",   company: "Eli Lilly",          weightPct: 1.7, sector: "Healthcare" },
      { ticker: "AVGO",  company: "Broadcom",           weightPct: 1.7, sector: "Semiconductors" },
      { ticker: "TSLA",  company: "Tesla",              weightPct: 1.6, sector: "Consumer / EV" },
    ],
  },
};
