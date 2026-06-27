import { cn } from "@/lib/utils";

/**
 * Decorative "office supplies" that attach paper to the board. Purely cosmetic
 * and aria-hidden. Position them with absolute utility classes from the parent.
 */

export function MaskingTape({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("masking-tape pointer-events-none absolute", className)}
    />
  );
}

export function PushPin({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("push-pin pointer-events-none absolute", className)}
    />
  );
}

export function PaperClip({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute text-[28px] drop-shadow-[2px_2px_1px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      📎
    </span>
  );
}
