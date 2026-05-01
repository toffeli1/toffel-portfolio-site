// Finnhub REST implementation of MarketDataProvider.
// Swap this file (and the import in marketData.ts) to change vendors.
//
// Finnhub free tier: 60 API calls / minute.
// With 14 symbols polled every 15 min we use ~1 call/min on average.
//
// Docs: https://finnhub.io/docs/api/quote
// Response shape:
//   c  – current price
//   d  – daily change (absolute)
//   dp – daily percent change
//   h/l/o/pc – high / low / open / previous close
//   t  – unix timestamp

import type { MarketDataProvider, Quote, QuoteMap, HistoricalProvider, HistoricalPoint } from "../types";

interface FinnhubResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
  error?: string;
}

interface FinnhubCandleResponse {
  c: number[];
  s: string; // "ok" | "no_data"
  t: number[];
}

export class FinnhubProvider implements MarketDataProvider, HistoricalProvider {
  private readonly apiKey: string;
  private readonly baseUrl = "https://finnhub.io/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchQuotes(symbols: string[]): Promise<QuoteMap> {
    const updatedAt = new Date().toISOString();
    const results: QuoteMap = {};

    // Parallel fetches — Finnhub has no batch endpoint on the free tier.
    await Promise.allSettled(
      symbols.map(async (symbol) => {
        const empty: Quote = {
          symbol,
          price: null,
          change: null,
          changePercent: null,
          updatedAt,
        };

        try {
          const url =
            `${this.baseUrl}/quote` +
            `?symbol=${encodeURIComponent(symbol)}` +
            `&token=${this.apiKey}`;

          const res = await fetch(url, {
            signal: AbortSignal.timeout(8_000),
            headers: { "User-Agent": "portfolio-site/1.0" },
          });

          if (!res.ok) {
            console.warn(`[finnhub] HTTP ${res.status} for ${symbol}`);
            results[symbol] = empty;
            return;
          }

          const data: FinnhubResponse = await res.json();

          if (data.error) {
            console.error(`[finnhub] API error for ${symbol}: ${data.error}`);
            results[symbol] = empty;
            return;
          }

          // Finnhub returns c: 0 for unrecognised symbols or some ETFs when market is closed.
          // Fall back to previous close (pc) so quotes remain visible outside market hours.
          const price = data.c || data.pc || 0;
          if (!price) {
            console.info(`[finnhub] No price data for ${symbol}`);
            results[symbol] = empty;
            return;
          }

          results[symbol] = {
            symbol,
            price,
            change: data.d,
            changePercent: data.dp,
            updatedAt,
          };
        } catch (err) {
          console.error(`[finnhub] fetch failed for ${symbol}:`, err);
          results[symbol] = empty;
        }
      })
    );

    return results;
  }

  async fetchHistory(
    symbol: string,
    from: number,
    to: number,
    resolution: string
  ): Promise<HistoricalPoint[]> {
    try {
      const url =
        `${this.baseUrl}/stock/candle` +
        `?symbol=${encodeURIComponent(symbol)}` +
        `&resolution=${resolution}` +
        `&from=${from}` +
        `&to=${to}` +
        `&token=${this.apiKey}`;

      const res = await fetch(url, {
        signal: AbortSignal.timeout(12_000),
        headers: { "User-Agent": "portfolio-site/1.0" },
      });

      if (!res.ok) {
        console.warn(`[finnhub] candle HTTP ${res.status} for ${symbol}`);
        return [];
      }

      const data: FinnhubCandleResponse = await res.json();

      if (data.s !== "ok" || !data.t?.length || !data.c?.length) {
        return [];
      }

      return data.t.map((t, i) => ({ t, c: data.c[i] }));
    } catch (err) {
      console.error(`[finnhub] candle fetch failed for ${symbol}:`, err);
      return [];
    }
  }
}
