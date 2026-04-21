import { NextResponse } from "next/server";
import { getProvider } from "@/lib/marketData";
import { holdings } from "@/data/holdings";
import { rothIraHoldings, etfsSleeveHoldings } from "@/data/sleeveHoldings";

// Never cache this route — always fetch fresh data on each request.
export const dynamic = "force-dynamic";

export async function GET() {
  const retailSymbols = holdings
    .filter((h) => h.livePricing !== false)
    .map((h) => h.ticker);

  const sleeveSymbols = [
    ...rothIraHoldings.map((h) => h.ticker),
    ...etfsSleeveHoldings.map((h) => h.ticker),
  ];

  // Deduplicate across all sources.
  const symbols = [...new Set([...retailSymbols, ...sleeveSymbols])];

  if (symbols.length === 0) {
    return NextResponse.json({});
  }

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[api/quotes] provider unavailable:", message);
    return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const quotes = await provider.fetchQuotes(symbols);
    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/quotes] fetch failed:", message);
    return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } });
  }
}
