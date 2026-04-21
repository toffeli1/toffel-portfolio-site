// Shared market-data types — safe to import in both server and client code.

export interface Quote {
  symbol: string;
  price: number | null;
  change: number | null;       // absolute daily change
  changePercent: number | null; // daily % change
  updatedAt: string;            // ISO timestamp of when the server fetched this
}

export type QuoteMap = Record<string, Quote>;

export interface MarketDataProvider {
  fetchQuotes(symbols: string[]): Promise<QuoteMap>;
}

// Historical OHLCV types
export interface HistoricalPoint {
  t: number; // unix timestamp (seconds)
  c: number; // close price
}

export interface HistoricalProvider {
  fetchHistory(
    symbol: string,
    from: number,
    to: number,
    resolution: string
  ): Promise<HistoricalPoint[]>;
}
