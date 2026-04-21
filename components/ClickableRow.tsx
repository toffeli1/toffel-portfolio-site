"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClickableRow({
  href,
  children,
  className,
  style,
  hoverStyle,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverStyle?: React.CSSProperties;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onClick={() => router.push(href)}
      className={`cursor-pointer ${className ?? ""}`}
      style={hovered && hoverStyle ? { ...style, ...hoverStyle } : style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </tr>
  );
}
