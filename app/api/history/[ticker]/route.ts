import { NextResponse } from "next/server";
import { getHistoryProvider } from "@/lib/marketData";

export const dynamic = "force-dynamic";

const RANGES: Record<string, { from: () => number; resolution: string }> = {
  "1y": { from: () => Math.floor(Date.now() / 1000) - 365 * 86400, resolution: "W" },
  "3y": { from: () => Math.floor(Date.now() / 1000) - 3 * 365 * 86400, resolution: "W" },
  "5y": { from: () => Math.floor(Date.now() / 1000) - 5 * 365 * 86400, resolution: "W" },
  "max": { from: () => 946684800, resolution: "M" }, // 2000-01-01
};

const empty = NextResponse.json({ points: [] }, { headers: { "Cache-Control": "no-store" } });

export async function GET(
  request: Request,
  ctx: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const rangeKey = searchParams.get("range") ?? "1y";
  const range = RANGES[rangeKey] ?? RANGES["1y"];

  const now = Math.floor(Date.now() / 1000);
  const from = range.from();

  let provider;
  try {
    provider = getHistoryProvider();
  } catch (err) {
    console.warn("[api/history] provider unavailable:", err);
    return empty;
  }

  try {
    const points = await provider.fetchHistory(ticker, from, now, range.resolution);
    return NextResponse.json({ points }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error(`[api/history] fetch failed for ${ticker}:`, err);
    return empty;
  }
}
