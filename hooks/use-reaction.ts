"use client";

import { useMutation } from "convex/react";

import { api } from "@/lib/convex-api";
import { togglePageReaction } from "@/lib/optimistic";
import { useVisitorId } from "./use-visitor-id";

/**
 * Toggle the 🥲 reaction on an archive with an instant optimistic update across
 * every cached page of the wall, then reconcile with the server result.
 */
export function useReaction() {
  const visitorId = useVisitorId();

  const toggle = useMutation(api.reactions.toggle).withOptimisticUpdate(
    (localStore, { archiveId }) => {
      for (const { args, value } of localStore.getAllQueries(api.archives.list)) {
        if (!value) continue;
        localStore.setQuery(api.archives.list, args, {
          ...value,
          page: togglePageReaction(value.page, archiveId),
        });
      }
    },
  );

  return (archiveId: string) => toggle({ archiveId, visitorId });
}
