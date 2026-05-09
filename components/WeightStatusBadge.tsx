import type { WeightStatus } from "@/lib/portfolioCalculations";

const STATUS_STYLE: Record<WeightStatus, { color: string; bg: string }> = {
  "No target":        { color: "#5a6e82", bg: "rgba(15,30,53,0.06)" },
  Underweight:        { color: "#5a6e82", bg: "rgba(15,30,53,0.06)" },
  "In range":         { color: "#15542e", bg: "rgba(26,74,46,0.08)" },
  Watch:              { color: "#7a4520", bg: "rgba(122,69,32,0.10)" },
  "Review for trim":  { color: "#8b1a1a", bg: "rgba(139,26,26,0.10)" },
};

export default function WeightStatusBadge({
  status,
  size = "sm",
}: {
  status: WeightStatus;
  size?: "sm" | "md";
}) {
  const { color, bg } = STATUS_STYLE[status];
  const padding = size === "md" ? "4px 10px" : "3px 8px";
  const textSize = size === "md" ? "text-[11px]" : "text-[10px]";

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md font-mono ${textSize} font-semibold uppercase tracking-[0.12em]`}
      style={{ color, background: bg, padding }}
    >
      {status}
    </span>
  );
}
