import { NextResponse } from "next/server";
import { getProvider } from "@/lib/marketData";
import type { Quote } from "@/lib/types";

export const dynamic = "force-dynamic";

const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await ctx.params;
  const symbol = ticker.toUpperCase();

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    console.warn("[api/quote] provider unavailable:", err);
    return NextResponse.json(null, { status: 503, ...noStore });
  }

  try {
    const map = await provider.fetchQuotes([symbol]);
    const quote: Quote | null = map[symbol] ?? null;
    return NextResponse.json(quote, noStore);
  } catch (err) {
    console.error(`[api/quote] fetch failed for ${symbol}:`, err);
    return NextResponse.json(null, { status: 502, ...noStore });
  }
}
