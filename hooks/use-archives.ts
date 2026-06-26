"use client";

import { usePaginatedQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import type { ArchiveCategory } from "@/types/archive";
import { useVisitorId } from "./use-visitor-id";

/**
 * Infinite-scroll archive feed. Newest-first, optionally filtered by category.
 * Returns Convex's paginated `results` + `status` + `loadMore` so the wall can
 * progressively load while scrolling.
 */
export function useArchives(category: ArchiveCategory | null, pageSize = 12) {
  const visitorId = useVisitorId();

  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.archives.list,
    { category: category ?? undefined, visitorId: visitorId || undefined },
    { initialNumItems: pageSize },
  );

  return {
    archives: results,
    status,
    isLoading,
    loadMore: () => loadMore(pageSize),
    canLoadMore: status === "CanLoadMore",
  };
}
