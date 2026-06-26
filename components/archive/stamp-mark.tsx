import { cn } from "@/lib/utils";

/** Decorative rubber-stamp overlay (REJECTED / GHOSTED / ARCHIVED). Cosmetic only. */
export function StampMark({ label, className }: { label: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "stamp text-rejection-red border-rejection-red text-headline-md font-display pointer-events-none border-2 px-4 py-1 tracking-widest uppercase opacity-80 select-none",
        className,
      )}
    >
      {label}
    </div>
  );
}
