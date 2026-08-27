import Link from "next/link";
import TickerLogo from "./TickerLogo";
import { getCompany } from "@/data/companies";
import { thesisHrefIfPublished } from "@/lib/routes";
import { postMortems, POST_MORTEM_LEAD_IN, type PostMortem } from "@/data/postMortems";

const INK = "#0f1e35";
const BODY = "#2d3d52";
const MUTED = "#5a6e82";

function PostMortemCard({ entry }: { entry: PostMortem }) {
  const isDev = process.env.NODE_ENV !== "production";
  if (entry.isPlaceholder && !isDev) return null;

  const c = getCompany(entry.ticker);
  const href = thesisHrefIfPublished(entry.ticker);
  const textColor = entry.isPlaceholder ? "#7a4520" : INK;
  const bodyColor = entry.isPlaceholder ? "#7a4520" : BODY;

  const identity = (
    <div className="flex items-center gap-3">
      <TickerLogo ticker={entry.ticker} name={c?.name} size="sm" />
      <div>
        <p className="font-mono text-[12px] font-semibold" style={{ color: textColor }}>{entry.ticker}</p>
        <p className="text-[12px]" style={{ color: entry.isPlaceholder ? "#7a4520" : MUTED }}>
          {c?.name ?? entry.ticker}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-2xl p-7"
      style={
        entry.isPlaceholder
          ? { background: "#fdf1e7", border: "1px dashed #c98a4b" }
          : { background: "#ffffff", border: "1px solid rgba(15,30,53,0.09)", boxShadow: "0 1px 4px rgba(15,30,53,0.04)" }
      }
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        {href ? (
          <Link href={href} className="transition-opacity hover:opacity-70">
            {identity}
          </Link>
        ) : (
          identity
        )}
        {entry.isPlaceholder && (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#7a4520" }}>
            TODO, dev only
          </span>
        )}
      </div>
      <div className="max-w-2xl space-y-4">
        {entry.body.map((para, i) => (
          <p key={i} className="text-[14px] leading-[1.85]" style={{ color: bodyColor }}>
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function PostMortemSection() {
  return (
    <div>
      <p className="mb-8 max-w-2xl text-[15px] leading-[1.8]" style={{ color: INK }}>
        {POST_MORTEM_LEAD_IN}
      </p>
      <div className="space-y-5">
        {postMortems.map((entry) => (
          <PostMortemCard key={entry.ticker} entry={entry} />
        ))}
      </div>
    </div>
  );
}
