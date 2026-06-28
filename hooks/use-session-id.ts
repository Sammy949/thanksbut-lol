"use client";

import { useSyncExternalStore } from "react";

/**
 * The server-issued anonymous session id.
 *
 * Replaces the old localStorage `visitorId` for reactions: the trustworthy
 * identity now comes from an HMAC-signed httpOnly cookie set by `/api/session`.
 * This hook fetches that endpoint once, caches the returned (non-secret)
 * sessionId in module scope, and shares it across every consumer. The id is
 * passed to the live Convex query only to render the 🥲 pressed state — the
 * count is authorised server-side, so the value here is not security-sensitive.
 *
 * Returns "" until resolved; the wall query treats "" as "no session yet".
 */

let sessionId = "";
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function ensureFetched(): void {
  if (sessionId || inflight || typeof window === "undefined") return;
  inflight = fetch("/api/session", { credentials: "same-origin" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { sessionId?: string } | null) => {
      if (data?.sessionId) {
        sessionId = data.sessionId;
        listeners.forEach((l) => l());
      }
    })
    .catch(() => {
      // Network hiccup — reactions just stay disabled until a later attempt.
    })
    .finally(() => {
      inflight = null;
    });
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  ensureFetched();
  return () => listeners.delete(onChange);
}

export function useSessionId(): string {
  return useSyncExternalStore(
    subscribe,
    () => sessionId,
    () => "",
  );
}
