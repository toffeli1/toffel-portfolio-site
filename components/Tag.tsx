import { CSSProperties } from "react";
import { FAINT, RADIUS_TAG, CARD_BORDER } from "@/lib/theme";

// One shared small tag/status marker — sharp corners, not a pill. Replaces
// ~10 visually distinct one-off badge recipes (status, action, meta,
// pending) that all did the same job with different radii/fills/padding.

export type TagVariant = "solid" | "outline" | "dashed";

export function Tag({
  children,
  color = FAINT,
  variant = "outline",
  title,
}: {
  children: React.ReactNode;
  color?: string;
  variant?: TagVariant;
  title?: string;
}) {
  const base: CSSProperties = {
    borderRadius: RADIUS_TAG,
    padding: "3px 7px",
  };
  const byVariant: Record<TagVariant, CSSProperties> = {
    solid: { color, background: `${color}14`, border: "1px solid transparent" },
    outline: { color, background: "transparent", border: `1px solid ${color}40` },
    dashed: { color: FAINT, background: "transparent", border: `1px dashed ${CARD_BORDER}` },
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]"
      style={{ ...base, ...byVariant[variant] }}
      title={title}
    >
      {children}
    </span>
  );
}
