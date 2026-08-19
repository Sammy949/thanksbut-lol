"use client";

import { createContext, useContext } from "react";

/** Lets any trigger (navbar, hero, empty state) open the single submission drawer. */
export interface SubmissionContextValue {
  openDrawer: () => void;
  /**
   * Warm the code-split drawer chunk before it's needed. Triggers call this on
   * hover / focus / touch so the drawer (and its ~130KB-gzip compose+upload
   * stack) is ready by click time, without ever landing on the first-paint path.
   */
  prefetchDrawer: () => void;
}

export const SubmissionContext = createContext<SubmissionContextValue | null>(null);

export function useSubmissionDrawer(): SubmissionContextValue {
  const ctx = useContext(SubmissionContext);
  if (!ctx) {
    throw new Error("useSubmissionDrawer must be used within <SubmissionProvider>");
  }
  return ctx;
}

/**
 * Props to spread on a "Archive Yours" trigger button: opens the drawer on click
 * and warms its chunk the moment the user shows intent (hover / keyboard focus /
 * touch), so the split-out drawer feels instant to open.
 */
export function useSubmissionTrigger() {
  const { openDrawer, prefetchDrawer } = useSubmissionDrawer();
  return {
    onClick: openDrawer,
    onPointerEnter: prefetchDrawer,
    onFocus: prefetchDrawer,
    onTouchStart: prefetchDrawer,
  };
}
