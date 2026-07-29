# Updating /performance

All performance figures are computed by `lib/perf.ts` from raw inputs — no
return, ratio, or cumulative figure is ever hand-typed into the page.

## Why this isn't a single committed file

The original spec called for one committed data module. This repo is public
on GitHub, so the raw inputs (month-end NAVs, dated cash-flow amounts) are
kept in a **gitignored, local-only** file instead — `data/performanceSeed.local.json`
never leaves your machine. A local script runs the same calc engine and writes
only the *derived, percentage-only* output to a committed file. The page reads
that committed file; it never sees a dollar figure.

## Monthly update steps

1. Edit `data/performanceSeed.local.json` (not tracked by git):
   - Add the new month-end NAV to `navSeries`.
   - Add that month's dated external flows to `flows` (contributions + broker
     match, combined per date). Add nothing if there were none.
   - Add the new month-end benchmark price to `benchmarkPrices`.
2. Run `npm run compute-performance`. This regenerates
   `data/performanceDerived.json` (committed, percentages/dates/ratios only —
   never a dollar amount) from the local seed.
3. If the book changed, update `data/toffel_performance_holdings_public.json`
   (weights + `asOf`). This file has never contained dollar figures and is
   always committed normally.
4. Commit `data/performanceDerived.json` and (if changed)
   `data/toffel_performance_holdings_public.json`. Do not commit
   `data/performanceSeed.local.json` — it's gitignored on purpose.

Everything else — the linked TWR, all risk stats, Sharpe/Sortino and their
confidence intervals, the equity curve, and the monthly-returns chart —
recomputes automatically from what `compute-performance` wrote. No other file
needs editing to publish a new month.

## If you ever lose `performanceSeed.local.json`

It's the only copy of the raw NAV/flow history and isn't backed up by git.
Keep it somewhere durable (local backup, password manager note, etc.) — if
it's lost, `data/performanceDerived.json` still works for display, but you
won't be able to recompute or extend the series.
