import { cn } from "@/lib/utils";

/**
 * A rubber-ink stamp (REJECTED / ARCHIVED / GHOSTED / VOID / NOPE …).
 * The `.stamp` utility supplies the ink colour, distressed fill and tilt.
 */
export function StampMark({ label, className }: { label: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "stamp pointer-events-none font-mono text-[18px] font-bold tracking-widest uppercase select-none",
        className,
      )}
    >
      {label}
    </span>
  );
}
