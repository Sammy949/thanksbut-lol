"use client";

import * as React from "react";

/**
 * Reads the `?a=<id>` share deep link once, then strips it from the URL.
 *
 * The URL is an external store, so we read it with `useSyncExternalStore` (like
 * `use-session-id`): the server snapshot is null, so there's no hydration
 * mismatch. The read is LATCHED — captured once on the first client read and
 * held forever after — so the strip effect below (which rewrites the address
 * bar) can't flip the returned id back to null mid-flight and abort the lightbox
 * before the archive query resolves.
 *
 * Deliberately NOT `useSearchParams()` — that opts the whole route out of static
 * prerendering (see the render-path perf work).
 */

let latched = false;
let shareId: string | null = null;

function getShareId(): string | null {
  if (!latched && typeof window !== "undefined") {
    latched = true;
    shareId = new URLSearchParams(window.location.search).get("a");
  }
  return shareId;
}

const subscribe = () => () => {};

export function useShareTarget(): string | null {
  const id = React.useSyncExternalStore(subscribe, getShareId, () => null);

  // Clear `?a=` from the address bar once, so a refresh (or copying the now-open
  // URL) doesn't re-trigger. replaceState only — no setState, and the latch above
  // means this doesn't change what the hook returns.
  React.useEffect(() => {
    if (!id) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("a")) return;
    params.delete("a");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash,
    );
  }, [id]);

  return id;
}
