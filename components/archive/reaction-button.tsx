"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  count: number;
  className?: string;
  /**
   * Live mode: whether the visitor has reacted, and a toggle handler. By default
   * `onToggle` makes the button fully controlled by these props (the wall, where
   * the query's optimistic update re-renders the card). Pass `optimistic` for
   * surfaces that DON'T re-render from the query (e.g. the lightbox snapshot):
   * the button then manages its own count locally AND still fires `onToggle`.
   */
  reacted?: boolean;
  onToggle?: () => void;
  optimistic?: boolean;
}

/** The single 🥲 reaction. Controlled on the wall, locally optimistic elsewhere. */
export function ReactionButton({
  count,
  className,
  reacted,
  onToggle,
  optimistic,
}: ReactionButtonProps) {
  const controlled = onToggle !== undefined && !optimistic;

  const [localReactions, setLocalReactions] = React.useState(count);
  const [localReacted, setLocalReacted] = React.useState(Boolean(reacted));

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
    onToggle?.(); // optimistic mode: update locally AND fire the mutation
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
