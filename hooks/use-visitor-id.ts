"use client";

import { useSyncExternalStore } from "react";

import { getVisitorId } from "@/lib/visitor-id";

const subscribe = () => () => {};

/**
 * The anonymous visitor id. Returns "" during SSR and on the first client
 * render, then the stable localStorage UUID. `useSyncExternalStore` keeps this
 * hydration-safe without a mount effect.
 */
export function useVisitorId(): string {
  return useSyncExternalStore(
    subscribe,
    () => getVisitorId(),
    () => "",
  );
}
