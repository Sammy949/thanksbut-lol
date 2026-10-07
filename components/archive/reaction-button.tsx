"use client";
import { cn } from "@/lib/utils";

export function ReactionButton({
  count,
  className,
  reacted,
  pending = false,
  onToggle,
}: {
  count: number;
  className?: string;
  reacted?: boolean;
  pending?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending || !onToggle}
      aria-busy={pending}
      aria-pressed={Boolean(reacted)}
      aria-label={
        reacted ? "Remove your tear-smile reaction" : "React with a tear-smile"
      }
      className={cn(
        "flex items-center gap-1 font-mono text-xs font-bold transition-colors disabled:cursor-default",
        reacted ? "text-primary" : "text-secondary hover:text-primary",
        className,
      )}
    >
      <span className="text-sm leading-none">🥲</span>
      <span>{count}</span>
    </button>
  );
}
