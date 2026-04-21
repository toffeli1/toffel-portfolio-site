// Server-only — do not import this file in client components.
// To switch providers: change the import below and update the constructor call.

import type { MarketDataProvider, HistoricalProvider } from "./types";
import { FinnhubProvider } from "./providers/finnhub";
import { YahooHistoricalProvider } from "./providers/yahoo";

function requireApiKey(): string {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "FINNHUB_API_KEY is not set. Add it to .env.local — see README for details."
    );
  }
  return apiKey;
}

export function getProvider(): MarketDataProvider {
  return new FinnhubProvider(requireApiKey());
}

export function getHistoryProvider(): HistoricalProvider {
  return new YahooHistoricalProvider();
}

// Re-export types so callers only need one import.
export type { Quote, QuoteMap, MarketDataProvider, HistoricalPoint, HistoricalProvider } from "./types";
