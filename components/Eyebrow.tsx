import { FAINT } from "@/lib/theme";

// One shared "eyebrow" label — font-mono, uppercase, wide tracking — used
// above nearly every section/page heading. Previously hand-copied into 24+
// files with 11 different tracking values; this is the single definition.

export default function Eyebrow({
  children,
  color,
  className = "mb-3",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <p
      className={`${className} font-mono text-[10px] uppercase tracking-[0.2em]`}
      style={{ color: color ?? FAINT }}
    >
      {children}
    </p>
  );
}
