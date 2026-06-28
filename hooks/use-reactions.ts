"use client";

import * as React from "react";
import { toast } from "sonner";

import type { ArchiveResponse } from "@/types/archive";
import { useSessionId } from "./use-session-id";

type Overlay = Map<string, { reacted: boolean; reactions: number }>;

/** Are these the same reaction values? */
function matches(
  o: { reacted: boolean; reactions: number },
  a: ArchiveResponse,
): boolean {
  return o.reacted === a.reacted && o.reactions === a.reactions;
}

/**
 * Reaction state for the live wall.
 *
 * The write no longer goes through Convex's `useMutation` (it's a trusted POST
 * to `/api/react` now), so we can't lean on `withOptimisticUpdate`. Instead we
 * keep a small per-archive overlay for instant feedback and reconcile it against
 * the live Convex query:
 *
 *  - click            → flip the overlay immediately (instant 🥲 + count)
 *  - server responds  → store the authoritative {reacted, reactions}
 *  - live query syncs → prune the overlay entry, so other clients' updates flow
 *  - request fails    → revert the entry and surface a toast
 *
 * Counts still arrive live from the subscription; the overlay only masks the
 * round-trip gap for the caller's own click. Once a live value matches an
 * overlay entry, the entry is pruned — leaving it would let a later count change
 * from another visitor "reactivate" the stale value and fight the live data.
 */
export function useReactions(archives: ArchiveResponse[]) {
  const sessionId = useSessionId();
  const [overlay, setOverlay] = React.useState<Overlay>(() => new Map());

  // Prune entries the live query has caught up to, during render (React's
  // supported "adjust state from changed inputs" pattern — re-runs render
  // without committing, converges since each pass drops ≥1 entry). Leaving a
  // matched entry would let a later count change from another visitor
  // "reactivate" the stale value and fight the live data. Doing this in an
  // effect would instead trigger cascading-render churn.
  let live = overlay;
  if (overlay.size > 0) {
    let pruned: Overlay | null = null;
    for (const a of archives) {
      const o = overlay.get(a.id);
      if (o && matches(o, a)) {
        pruned ??= new Map(overlay);
        pruned.delete(a.id);
      }
    }
    if (pruned) {
      live = pruned;
      setOverlay(pruned);
    }
  }

  const merged = React.useMemo(
    () =>
      live.size === 0
        ? archives
        : archives.map((a) => {
            const o = live.get(a.id);
            return o ? { ...a, ...o } : a;
          }),
    [archives, live],
  );

  const react = React.useCallback(
    (id: string) => {
      if (!sessionId) {
        toast("One sec — getting you ready to react.");
        return;
      }

      // Optimistic flip from the currently displayed value.
      setOverlay((prev) => {
        const base = prev.get(id) ?? archives.find((a) => a.id === id);
        if (!base) return prev;
        const reacted = !base.reacted;
        const reactions = Math.max(0, base.reactions + (reacted ? 1 : -1));
        const next = new Map(prev);
        next.set(id, { reacted, reactions });
        return next;
      });

      void fetch("/api/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ archiveId: id }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status));
          const data = (await res.json()) as {
            reacted: boolean;
            reactions: number;
          };
          // Pin to the authoritative result; pruned when the query catches up.
          setOverlay((prev) => {
            const next = new Map(prev);
            next.set(id, { reacted: data.reacted, reactions: data.reactions });
            return next;
          });
        })
        .catch(() => {
          // Revert: drop the optimistic entry and let the live value stand.
          setOverlay((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Map(prev);
            next.delete(id);
            return next;
          });
          toast("Couldn't save that reaction. Try again?");
        });
    },
    [sessionId, archives],
  );

  return { archives: merged, react };
}
