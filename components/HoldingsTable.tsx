import Link from "next/link";
import { Holding, Category } from "@/data/holdings";
import { PriceCell, ChangeCell } from "./QuoteCell";
import { ClickableRow } from "./ClickableRow";

const COLOR: Record<Category, string> = {
  AI: "#1a3a5c",
  "Defense / Drone": "#8b2530",
  Energy: "#1a4a2e",
};

const BG: Record<Category, string> = {
  AI: "rgba(26,58,92,0.08)",
  "Defense / Drone": "rgba(139,37,48,0.08)",
  Energy: "rgba(26,74,46,0.08)",
};

export default function HoldingsTable({
  holdings,
  showCategory = true,
}: {
  holdings: Holding[];
  showCategory?: boolean;
}) {
  const maxPct = Math.max(...holdings.map((h) => h.portfolioPct));

  return (
    <div
      className="overflow-x-auto rounded-2xl"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,30,53,0.09)",
        boxShadow: "0 1px 4px rgba(15,30,53,0.04)",
      }}
    >
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr style={{ background: "#f8f4ee", borderBottom: "1px solid rgba(15,30,53,0.07)" }}>
            <Th w="w-[100px]">Ticker</Th>
            <Th w="w-[165px]">Company</Th>
            <Th w="w-[155px]" right>Weight</Th>
            <Th w="w-[100px]" right>Price</Th>
            <Th w="w-[95px]" right>Day %</Th>
            {showCategory && <Th w="w-[135px]">Theme</Th>}
            <Th w="w-[200px]">Subcategory</Th>
            <Th>Thesis</Th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const color = COLOR[h.category];
            const bg = BG[h.category];
            return (
              <ClickableRow
                key={h.ticker}
                href={`/positions/${h.ticker}`}
                className="last:border-0 transition-colors"
                style={{ borderBottom: "1px solid rgba(15,30,53,0.05)" }}
                hoverStyle={{ background: "rgba(15,30,53,0.02)" }}
              >
                {/* Ticker */}
                <td className="px-5 py-5">
                  <Link
                    href={`/positions/${h.ticker}`}
                    className="font-mono text-xs font-semibold tracking-wide hover:opacity-75 transition-opacity"
                    style={{ color, backgroundColor: bg, padding: "4px 10px", borderRadius: "5px" }}
                  >
                    {h.ticker}
                  </Link>
                </td>

                {/* Company */}
                <td className="px-5 py-5 text-sm font-medium text-[#0f1e35]">
                  {h.company}
                </td>

                {/* Weight */}
                <td className="px-5 py-5">
                  <div className="flex items-center justify-end gap-3">
                    <div
                      className="w-20 overflow-hidden rounded-full"
                      style={{ background: "rgba(15,30,53,0.08)" }}
                    >
                      <div
                        className="h-[3px] rounded-full"
                        style={{
                          width: `${(h.portfolioPct / maxPct) * 100}%`,
                          backgroundColor: color,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <span className="w-11 text-right font-mono text-sm font-bold text-[#0f1e35]">
                      {h.portfolioPct.toFixed(1)}%
                    </span>
                  </div>
                </td>

                {/* Price — client island */}
                <td className="px-5 py-5 text-right">
                  <PriceCell ticker={h.ticker} />
                </td>

                {/* Daily change — client island */}
                <td className="px-5 py-5 text-right">
                  <ChangeCell ticker={h.ticker} />
                </td>

                {/* Theme */}
                {showCategory && (
                  <td className="px-5 py-5">
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider"
                      style={{ color, backgroundColor: bg, padding: "3px 9px", borderRadius: "999px" }}
                    >
                      {h.category}
                    </span>
                  </td>
                )}

                {/* Subcategory */}
                <td className="px-5 py-5">
                  <span
                    className="rounded-md px-2.5 py-1 font-mono text-[10px] text-[#7a8799]"
                    style={{ border: "1px solid rgba(15,30,53,0.1)" }}
                  >
                    {h.subcategory}
                  </span>
                </td>

                {/* Thesis */}
                <td className="px-5 py-5">
                  <span className="line-clamp-2 text-[12px] leading-[1.65] text-[#7a8799]">
                    {h.thesis}
                  </span>
                </td>
              </ClickableRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  right = false,
  w = "",
}: {
  children: React.ReactNode;
  right?: boolean;
  w?: string;
}) {
  return (
    <th
      className={`px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-[#7a8799] ${
        right ? "text-right" : "text-left"
      } ${w}`}
    >
      {children}
    </th>
  );
}
