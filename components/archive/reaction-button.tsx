"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  count: number;
  className?: string;
  /**
   * Live mode: whether the visitor has reacted, and a toggle handler. When
   * `onToggle` is provided the button is fully controlled by these props (the
   * Convex mutation drives the count via its optimistic update). When omitted
   * the button keeps its own local optimistic state — used by the mock wall.
   */
  reacted?: boolean;
  onToggle?: () => void;
}

/** The single 🥲 reaction. Controlled in live mode, locally optimistic in mock. */
export function ReactionButton({
  count,
  className,
  reacted,
  onToggle,
}: ReactionButtonProps) {
  const controlled = onToggle !== undefined;

  const [localReactions, setLocalReactions] = React.useState(count);
  const [localReacted, setLocalReacted] = React.useState(false);

  const displayReactions = controlled ? count : localReactions;
  const displayReacted = controlled ? Boolean(reacted) : localReacted;

  const toggle = () => {
    if (controlled) {
      onToggle();
      return;
    }
    setLocalReacted((prev) => {
      setLocalReactions((n) => n + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={displayReacted}
      aria-label="React with a tear-smile"
      className={cn(
        "flex items-center gap-1 font-mono text-xs font-bold transition-colors",
        displayReacted ? "text-primary" : "text-secondary hover:text-primary",
        className,
      )}
    >
      <span className="text-sm leading-none">🥲</span>
      <span>{displayReactions}</span>
    </button>
  );
}
