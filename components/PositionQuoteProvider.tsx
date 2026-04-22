"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Quote, QuoteMap } from "@/lib/types";
import { QuotesContext, QUOTE_REFRESH_INTERVAL_MS } from "./QuotesProvider";

/**
 * Single-ticker variant of QuotesProvider for use on position detail pages.
 * Fetches /api/quote/[ticker] (one Finnhub call) instead of the full batch,
 * and feeds the same QuotesContext so PriceCell / ChangeCell / LastUpdated
 * continue to work without modification.
 */
export function PositionQuoteProvider({
  ticker,
  children,
}: {
  ticker: string;
  children: React.ReactNode;
}) {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch(`/api/quote/${encodeURIComponent(ticker)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const quote: Quote | null = await res.json();

      if (quote) {
        // Merge into map so ReturnSinceSection and other consumers keep working.
        setQuotes((prev) => ({ ...prev, [ticker]: quote }));
      }
      // A null response (unsupported ticker / c:0) still counts as a successful
      // round-trip — we got an answer, we just have no data.
      setError(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`[PositionQuoteProvider] fetch failed for ${ticker}:`, err);
      setError(true);
      // Do NOT clear quotes — preserve last known-good price.
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchQuote();
    intervalRef.current = setInterval(fetchQuote, QUOTE_REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQuote]);

  return (
    <QuotesContext.Provider value={{ quotes, loading, error, lastUpdated }}>
      {children}
    </QuotesContext.Provider>
  );
}
