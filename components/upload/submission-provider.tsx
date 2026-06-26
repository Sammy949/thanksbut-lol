"use client";

import * as React from "react";

import { SubmissionContext } from "./submission-context";
import { SubmissionDrawer } from "./submission-drawer";

/**
 * Owns the single submission drawer and exposes `openDrawer()` to the tree via
 * context, so the navbar, hero and empty state can all trigger it.
 */
export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const value = React.useMemo(() => ({ openDrawer: () => setOpen(true) }), []);

  return (
    <SubmissionContext.Provider value={value}>
      {children}
      <SubmissionDrawer open={open} onOpenChange={setOpen} />
    </SubmissionContext.Provider>
  );
}
