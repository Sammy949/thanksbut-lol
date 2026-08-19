"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { SubmissionContext } from "./submission-context";

/**
 * The drawer carries the whole submission stack — the compose form, image
 * cropper/redactor and upload client (react-hook-form, zod, react-easy-crop,
 * browser-image-compression, uploadthing). That's ~130KB gzipped that used to
 * ride the first-paint bundle of every page even though the drawer starts
 * closed. Splitting it out here keeps it off the critical path; it's fetched on
 * intent (see `prefetchDrawer`) or, at the latest, on first open.
 */
const importDrawer = () => import("./submission-drawer");

const SubmissionDrawer = dynamic(
  () => importDrawer().then((m) => m.SubmissionDrawer),
  {
    ssr: false,
    // Rare path: user clicks before the chunk has warmed. Show the drawer's own
    // dimmed backdrop immediately so the click never feels dead, then the real
    // panel fades in over it — no visible swap.
    loading: () => (
      <div
        className="bg-on-surface/40 fixed inset-0 z-50 backdrop-blur-sm"
        aria-hidden
      />
    ),
  },
);

/**
 * Owns the single submission drawer and exposes `openDrawer()` to the tree via
 * context, so the navbar, hero and empty state can all trigger it.
 */
export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  // Once opened, the drawer stays mounted so Radix can run its close animation.
  const [mounted, setMounted] = React.useState(false);

  const value = React.useMemo(
    () => ({
      openDrawer: () => {
        setMounted(true);
        setOpen(true);
      },
      // Fire-and-forget: import() dedupes, so this just warms the module cache.
      prefetchDrawer: () => {
        void importDrawer();
      },
    }),
    [],
  );

  return (
    <SubmissionContext.Provider value={value}>
      {children}
      {mounted && <SubmissionDrawer open={open} onOpenChange={setOpen} />}
    </SubmissionContext.Provider>
  );
}
