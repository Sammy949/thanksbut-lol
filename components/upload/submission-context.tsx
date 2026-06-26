"use client";

import { createContext, useContext } from "react";

/** Lets any trigger (navbar, hero, empty state) open the single submission drawer. */
export interface SubmissionContextValue {
  openDrawer: () => void;
}

export const SubmissionContext = createContext<SubmissionContextValue | null>(null);

export function useSubmissionDrawer(): SubmissionContextValue {
  const ctx = useContext(SubmissionContext);
  if (!ctx) {
    throw new Error("useSubmissionDrawer must be used within <SubmissionProvider>");
  }
  return ctx;
}
