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

export async function retrySession(): Promise<string> {
  if (sessionId || typeof window === "undefined") return sessionId;
  if (inflight) {
    await inflight;
    if (!sessionId)
      throw new Error(
        "Couldn't prepare your session. Check your connection and try again.",
      );
    return sessionId;
  }
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
  await inflight;
  if (!sessionId)
    throw new Error(
      "Couldn't prepare your session. Check your connection and try again.",
    );
  return sessionId;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  void retrySession().catch(() => undefined);
  return () => listeners.delete(onChange);
}

export function useSessionId(): string {
  return useSyncExternalStore(
    subscribe,
    () => sessionId,
    () => "",
  );
}
