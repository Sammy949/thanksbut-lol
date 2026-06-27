import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A rubber-ink stamp (REJECTED / ARCHIVED / GHOSTED / VOID / NOPE …).
 * The `.stamp` utility supplies the ink colour and distressed fill; pass `style`
 * (e.g. an inline transform) to override the default tilt with a custom one.
 */
export function StampMark({
  label,
  className,
  style,
}: {
  label: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "stamp pointer-events-none font-mono text-[18px] font-bold tracking-widest uppercase select-none",
        className,
      )}
    >
      {label}
    </span>
  );
}
