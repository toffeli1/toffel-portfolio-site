# Investment Portfolio Site

A dark, premium, data-driven investment portfolio website built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Market Data (Live Quotes)

The site fetches live delayed stock quotes and refreshes them automatically while the page is open.

### 1. Get a Finnhub API key

Sign up for a free account at **https://finnhub.io** and copy your API key from the dashboard. The free tier supports 60 API calls per minute, which is well above what this site needs.

### 2. Create `.env.local`

In the project root, create a file called `.env.local` and add:

```
FINNHUB_API_KEY=your_api_key_here
```

This file is already in `.gitignore` and will never be committed.

### 3. Restart the dev server

```bash
npm run dev
```

The `Price` and `Day %` columns in the holdings tables will now show live data. Without an API key the columns show `—` and the server logs a clear error message.

---

## How quote refreshing works

1. When the page loads, `QuotesProvider` (`components/QuotesProvider.tsx`) immediately calls `GET /api/quotes`.
2. The API route (`app/api/quotes/route.ts`) calls `getProvider()` from `lib/marketData.ts`, which constructs a `FinnhubProvider` using the server-side env var.
3. The provider fetches all 14 holding tickers in parallel from Finnhub and returns a `QuoteMap` (`Record<symbol, Quote>`).
4. `QuotesProvider` stores the result in React context. `PriceCell` and `ChangeCell` (in `components/QuoteCell.tsx`) read from that context and update their cells.
5. A `setInterval` repeats step 1 every **15 minutes**. The interval is cleaned up on unmount.

The API key is **never sent to the browser** — all provider logic runs server-side inside the API route.

---

## Changing the refresh interval

Open `components/QuotesProvider.tsx` and edit the constant at the top:

```ts
export const QUOTE_REFRESH_INTERVAL_MS = 15 * 60 * 1_000; // 15 minutes
```

Examples:
- `5 * 60 * 1_000` — every 5 minutes
- `60 * 1_000` — every 1 minute (watch Finnhub rate limits on the free tier)
- `30 * 60 * 1_000` — every 30 minutes

---

## Switching quote providers

All provider logic is isolated:

| File | Purpose |
|------|---------|
| `lib/types.ts` | `Quote`, `QuoteMap`, `MarketDataProvider` interface |
| `lib/providers/finnhub.ts` | Finnhub implementation |
| `lib/marketData.ts` | `getProvider()` factory — **edit this to swap providers** |

To add a new provider:
1. Create `lib/providers/yourprovider.ts` implementing `MarketDataProvider`.
2. In `lib/marketData.ts`, import your class and return it from `getProvider()`.
3. Add the new provider's API key to `.env.local`.

---

## Disabling live pricing for a specific holding

In `data/holdings.ts`, add `livePricing: false` to any holding entry:

```ts
{
  ticker: 'AVEX',
  company: 'AEVEX Corp',
  livePricing: false,   // ← opt out of live quotes
  ...
}
```

---

## Portfolio data

All holdings, weights, categories, subcategories, and thesis notes live in **`data/holdings.ts`**. Edit that file to update the portfolio. The market data layer reads tickers from the same file automatically.
