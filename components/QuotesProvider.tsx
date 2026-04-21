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

// ── Adjust this to change how often quotes refresh ────────────────────────────
export const QUOTE_REFRESH_INTERVAL_MS = 15 * 60 * 1_000; // 15 minutes
// ─────────────────────────────────────────────────────────────────────────────

interface QuotesState {
  quotes: QuoteMap;
  loading: boolean;       // true only during the initial fetch
  lastUpdated: Date | null;
}

const QuotesContext = createContext<QuotesState>({
  quotes: {},
  loading: true,
  lastUpdated: null,
});

export function useQuotes(): QuotesState {
  return useContext(QuotesContext);
}

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: QuoteMap = await res.json();
      setQuotes(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[QuotesProvider] Failed to fetch quotes:", err);
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
    <QuotesContext.Provider value={{ quotes, loading, lastUpdated }}>
      {children}
    </QuotesContext.Provider>
  );
}
