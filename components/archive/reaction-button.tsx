"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The single 🥲 reaction. Local optimistic state for now; this is the seam
 * where a Convex mutation will plug in (the rest of the card stays presentational).
 */
export function ReactionButton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  const [reactions, setReactions] = React.useState(count);
  const [reacted, setReacted] = React.useState(false);

  const toggle = () => {
    setReacted((prev) => {
      setReactions((n) => n + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={reacted}
      aria-label="React with a tear-smile"
      className={cn(
        "flex items-center gap-1 font-mono text-xs font-bold transition-colors",
        reacted ? "text-primary" : "text-secondary hover:text-primary",
        className,
      )}
    >
      <span className="text-sm leading-none">🥲</span>
      <span>{reactions}</span>
    </button>
  );
}
