// Yahoo Finance unofficial chart API — no API key required, free tier.
// Used only for historical price data (the Finnhub free tier doesn't support candles).
//
// Endpoint: https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
// Params:   interval (1wk | 1mo), range (1y | 2y | 5y | max)

import type { HistoricalProvider, HistoricalPoint } from "../types";

interface YahooChartResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{ close: (number | null)[] }>;
      };
    }> | null;
    error: { code: string; description: string } | null;
  };
}

function toYahooParams(
  from: number,
  resolution: string
): { range: string; interval: string } {
  const ageDays = (Date.now() / 1000 - from) / 86400;
  const interval = resolution === "M" ? "1mo" : "1wk";

  let range: string;
  if (ageDays <= 420) range = "1y";
  else if (ageDays <= 800) range = "2y";
  else if (ageDays <= 2000) range = "5y";
  else range = "max";

  return { range, interval };
}

export class YahooHistoricalProvider implements HistoricalProvider {
  async fetchHistory(
    symbol: string,
    from: number,
    _to: number,
    resolution: string
  ): Promise<HistoricalPoint[]> {
    const { range, interval } = toYahooParams(from, resolution);
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      `?interval=${interval}&range=${range}`;

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(12_000),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; portfolio-site/1.0)",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.warn(`[yahoo] HTTP ${res.status} for ${symbol}`);
        return [];
      }

      const data: YahooChartResponse = await res.json();

      if (data.chart.error || !data.chart.result?.length) {
        return [];
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp ?? [];
      const closes = result.indicators.quote[0]?.close ?? [];

      const points: HistoricalPoint[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i];
        const c = closes[i];
        if (t && c !== null && c !== undefined && isFinite(c)) {
          // Only include points on or after the requested 'from' timestamp.
          if (t >= from) {
            points.push({ t, c });
          }
        }
      }

      return points;
    } catch (err) {
      console.error(`[yahoo] fetch failed for ${symbol}:`, err);
      return [];
    }
  }
}
