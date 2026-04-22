"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { QuoteMap } from "@/lib/types";

export const QUOTE_REFRESH_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutes

export interface QuotesState {
  quotes: QuoteMap;
  loading: boolean;   // true only during the initial fetch
  error: boolean;     // true when the most recent fetch attempt failed
  lastUpdated: Date | null;
}

export const QuotesContext = createContext<QuotesState>({
  quotes: {},
  loading: true,
  error: false,
  lastUpdated: null,
});

export function useQuotes(): QuotesState {
  return useContext(QuotesContext);
}

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: QuoteMap = await res.json();
      setQuotes(data);
      setError(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[QuotesProvider] fetch failed:", err);
      setError(true);
      // Intentionally do NOT clear quotes — preserve last known-good data.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    intervalRef.current = setInterval(fetchQuotes, QUOTE_REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQuotes]);

  return (
    <QuotesContext.Provider value={{ quotes, loading, error, lastUpdated }}>
      {children}
    </QuotesContext.Provider>
  );
}
