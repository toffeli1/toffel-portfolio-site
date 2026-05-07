import { NextResponse } from "next/server";
import { getProvider } from "@/lib/marketData";
import { getOrFetchQuotes } from "@/lib/quoteCache";
import { holdings } from "@/data/holdings";
import { rothIraHoldings } from "@/data/sleeveHoldings";

export const dynamic = "force-dynamic";

const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET() {
  const retailSymbols = holdings
    .filter((h) => h.livePricing !== false)
    .map((h) => h.ticker);

  const sleeveSymbols = rothIraHoldings.map((h) => h.ticker);

  // Deduplicate across all sources.
  const symbols = [...new Set([...retailSymbols, ...sleeveSymbols])];

  if (symbols.length === 0) {
    return NextResponse.json({}, noStore);
  }

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[api/quotes] provider unavailable:", message);
    return NextResponse.json({}, noStore);
  }

  try {
    const quotes = await getOrFetchQuotes(symbols, (missing) =>
      provider.fetchQuotes(missing)
    );
    return NextResponse.json(quotes, noStore);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/quotes] fetch failed:", message);
    return NextResponse.json({}, noStore);
  }
}
