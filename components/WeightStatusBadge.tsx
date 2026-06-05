import type { WeightStatus } from "@/lib/portfolioCalculations";

// Internal status identifiers (left-hand side) drive logic; right-hand side
// is the neutral process-language label rendered publicly. Action verbs
// ("trim", "buy") deliberately avoided — band positioning only.
const STATUS_STYLE: Record<WeightStatus, { color: string; bg: string; label: string }> = {
  "No target":        { color: "#5a6e82", bg: "rgba(15,30,53,0.06)", label: "" },
  Underweight:        { color: "#5a6e82", bg: "rgba(15,30,53,0.06)", label: "Below target" },
  "In range":         { color: "#15542e", bg: "rgba(26,74,46,0.08)", label: "On target" },
  Watch:              { color: "#7a4520", bg: "rgba(122,69,32,0.10)", label: "Slightly above target" },
  "Review for trim":  { color: "#8b1a1a", bg: "rgba(139,26,26,0.10)", label: "Above target" },
};

export default function WeightStatusBadge({
  status,
  size = "sm",
}: {
  status: WeightStatus;
  size?: "sm" | "md";
}) {
  const { color, bg, label } = STATUS_STYLE[status];
  // 'No target' renders nothing in public surfaces — null short-circuit
  // lets callers wrap optionally without checking themselves.
  if (label === "") return null;

  const padding = size === "md" ? "4px 10px" : "3px 8px";
  const textSize = size === "md" ? "text-[11px]" : "text-[10px]";

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md font-mono ${textSize} font-semibold uppercase tracking-[0.12em]`}
      style={{ color, background: bg, padding }}
    >
      {label}
    </span>
  );
}
