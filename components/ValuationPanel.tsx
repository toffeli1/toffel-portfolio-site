import Link from "next/link";
import TickerLogo from "@/components/TickerLogo";
import { selectPeers, directPeerAverageForwardPE } from "@/lib/peerSelection";
import { PEER_FORWARD_PE } from "@/data/fundamentals/manual";
import { thesisHrefIfPublished } from "@/lib/routes";
import type { Valuation } from "@/data/thesis/types";

// ─── Relative valuation + peer sets ───────────────────────────────────────────
// Renders the valuation architecture whether or not forward P/E is populated.
// When it isn't, a restrained "pending" state appears instead of a number —
// data/fundamentals/manual.ts explains why the fields ship empty rather than
// seeded with plausible-looking multiples.
//
// The direct/strategic split is load-bearing, not decorative: only Direct Peers
// feed the average. Strategic Competitors render with the reason they were held
// out, so a reader can see that excluding them was a decision rather than an
// oversight.

const ACCENT = "#1a4a2e";
const INK = "#0f1e35";
const BODY = "#2d3d52";
const MUTED = "#5a6e82";
const FAINT = "#7a8799";

const CARD = {
  background: "#ffffff",
  border: "1px solid rgba(15,30,53,0.09)",
  boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
} as const;

function PeerRow({
  ticker,
  name,
  score,
  drivers,
  heldOutReason,
}: {
  ticker: string;
  name: string;
  score: number;
  drivers: string[];
  heldOutReason?: string;
}) {
  const href = thesisHrefIfPublished(ticker);
  const pe = PEER_FORWARD_PE[ticker];

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      <TickerLogo ticker={ticker} name={name} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-mono text-[11px]" style={{ color: INK }}>
          {ticker}
        </p>
        <p className="truncate text-[12px]" style={{ color: MUTED }}>
          {name}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-col gap-2 py-3.5"
      style={{ borderTop: "1px solid rgba(15,30,53,0.06)" }}
    >
      <div className="flex items-start justify-between gap-4">
        {href ? (
          <Link href={href} className="min-w-0 transition-opacity hover:opacity-70">
            {identity}
          </Link>
        ) : (
          identity
        )}
        <div className="shrink-0 text-right">
          <p className="font-mono text-[11px] tabular-nums" style={{ color: INK }}>
            {(score * 100).toFixed(0)}% similar
          </p>
          <p className="font-mono text-[10px] tabular-nums" style={{ color: FAINT }}>
            {pe !== undefined ? `${pe.toFixed(1)}x fwd P/E` : "fwd P/E pending"}
          </p>
        </div>
      </div>
      {drivers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {drivers.map((d) => (
            <span
              key={d}
              className="rounded font-mono text-[9px]"
              style={{
                color: FAINT,
                border: "1px solid rgba(15,30,53,0.1)",
                padding: "2px 7px",
              }}
            >
              {d}
            </span>
          ))}
        </div>
      )}
      {heldOutReason && (
        <p className="font-mono text-[9px] leading-[1.5]" style={{ color: "#8b2530", opacity: 0.75 }}>
          Excluded from peer average: {heldOutReason.toLowerCase()}
        </p>
      )}
    </div>
  );
}

export default function ValuationPanel({
  ticker,
  valuation,
}: {
  ticker: string;
  valuation?: Valuation;
}) {
  const peers = selectPeers(ticker);
  const hasPeers = peers.direct.length > 0 || peers.strategic.length > 0;
  if (!valuation && !hasPeers) return null;

  const peerAvg = directPeerAverageForwardPE(peers.direct, PEER_FORWARD_PE);
  const ownPE = valuation?.forwardPE;
  const history = valuation?.history ?? [];

  return (
    <section className="border-b" style={{ borderColor: "rgba(15,30,53,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.28em]"
            style={{ color: FAINT }}
          >
            Relative valuation
          </p>
          {valuation && (
            <p className="font-mono text-[9px]" style={{ color: MUTED }}>
              Valuation updated {valuation.updated}
            </p>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* ── Multiples ───────────────────────────────────────────────── */}
          <div className="rounded-2xl px-6 py-6" style={CARD}>
            {valuation?.notApplicableReason ? (
              <>
                <p
                  className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: MUTED }}
                >
                  Forward P/E
                </p>
                <p className="text-[13px] leading-[1.7]" style={{ color: BODY }}>
                  Not applicable. {valuation.notApplicableReason}
                </p>
                {valuation.alternate && (
                  <div
                    className="mt-5 pt-5"
                    style={{ borderTop: "1px solid rgba(15,30,53,0.07)" }}
                  >
                    <p
                      className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em]"
                      style={{ color: MUTED }}
                    >
                      {valuation.alternate.label}
                    </p>
                    <p className="font-mono text-[20px]" style={{ color: INK }}>
                      {valuation.alternate.value !== undefined
                        ? valuation.alternate.value.toFixed(1)
                        : "Pending"}
                    </p>
                    {valuation.alternate.note && (
                      <p
                        className="mt-2 text-[12px] leading-[1.6]"
                        style={{ color: MUTED }}
                      >
                        {valuation.alternate.note}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p
                      className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em]"
                      style={{ color: MUTED }}
                    >
                      Forward P/E
                    </p>
                    {ownPE !== undefined ? (
                      <p
                        className="font-mono font-bold leading-none"
                        style={{ color: INK, fontSize: "2rem" }}
                      >
                        {ownPE.toFixed(1)}x
                      </p>
                    ) : (
                      <p className="font-mono text-[13px]" style={{ color: FAINT }}>
                        Valuation data pending
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em]"
                      style={{ color: MUTED }}
                    >
                      Direct-peer average
                    </p>
                    {peerAvg ? (
                      <>
                        <p className="font-mono text-[20px]" style={{ color: INK }}>
                          {peerAvg.average.toFixed(1)}x
                        </p>
                        <p className="mt-1 font-mono text-[9px]" style={{ color: FAINT }}>
                          n={peerAvg.sampleSize} · {peerAvg.used.join(", ")}
                        </p>
                      </>
                    ) : (
                      <p className="font-mono text-[13px]" style={{ color: FAINT }}>
                        Pending
                      </p>
                    )}
                  </div>
                </div>

                {/* Own valuation history — the "vs its own past" comparison. */}
                <div
                  className="mt-6 pt-5"
                  style={{ borderTop: "1px solid rgba(15,30,53,0.07)" }}
                >
                  <p
                    className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em]"
                    style={{ color: MUTED }}
                  >
                    Versus its own history
                  </p>
                  {history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((h) => (
                        <div
                          key={h.period}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="font-mono text-[10px]" style={{ color: MUTED }}>
                            {h.period}
                          </span>
                          <span
                            className="font-mono text-[11px] tabular-nums"
                            style={{ color: INK }}
                          >
                            {h.forwardPE.toFixed(1)}x
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] leading-[1.6]" style={{ color: FAINT }}>
                      Historical forward-P/E series pending. Maintained by hand in
                      data/fundamentals/manual.ts. No free, reliable source exists
                      for consensus estimates, so nothing is inferred here.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Peers ──────────────────────────────────────────────────── */}
          <div className="rounded-2xl px-6 py-6" style={CARD}>
            {peers.direct.length > 0 && (
              <>
                <div className="mb-1 flex items-baseline justify-between gap-4">
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: ACCENT }}
                  >
                    Direct peers
                  </p>
                  <p className="font-mono text-[9px]" style={{ color: FAINT }}>
                    used in the average
                  </p>
                </div>
                <p className="mb-2 text-[12px] leading-[1.6]" style={{ color: MUTED }}>
                  Similar enough that comparing multiples is meaningful.
                </p>
                {peers.direct.map((p) => (
                  <PeerRow key={p.ticker} {...p} />
                ))}
              </>
            )}

            {peers.strategic.length > 0 && (
              <div className={peers.direct.length > 0 ? "mt-8" : ""}>
                <div className="mb-1 flex items-baseline justify-between gap-4">
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: "#8b2530" }}
                  >
                    Strategic competitors
                  </p>
                  <p className="font-mono text-[9px]" style={{ color: FAINT }}>
                    never averaged
                  </p>
                </div>
                <p className="mb-2 text-[12px] leading-[1.6]" style={{ color: MUTED }}>
                  Competing for the same customers or budget, but too different
                  financially for their multiple to say much about this holding.
                </p>
                {peers.strategic.map((p) => (
                  <PeerRow
                    key={p.ticker}
                    {...p}
                    heldOutReason={p.excludedFromValuation}
                  />
                ))}
              </div>
            )}

            {!hasPeers && (
              <p className="text-[13px] leading-[1.7]" style={{ color: MUTED }}>
                {peers.method}
              </p>
            )}

            {hasPeers && (
              <p
                className="mt-6 pt-4 font-mono text-[9px] leading-[1.6]"
                style={{ color: FAINT, borderTop: "1px solid rgba(15,30,53,0.06)" }}
              >
                {peers.method}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
