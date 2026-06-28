"use client";

import * as React from "react";

import { useArchives } from "@/hooks/use-archives";
import { useReactions } from "@/hooks/use-reactions";
import { useReport } from "@/hooks/use-report";
import { responseToArchive } from "@/lib/archive-adapter";
import type { ArchiveCategory } from "@/types/archive";
import { ArchiveFeed } from "./archive-feed";

/**
 * Live wall backed by Convex. Mounted only when a deployment is configured
 * (see ArchiveBoard), so the paginated query + mutations always have a
 * ConvexProvider above them. Owns the selected category (drives the query);
 * the presentational ArchiveFeed handles the rest.
 */
export function LiveArchiveFeed() {
  const [category, setCategory] = React.useState<ArchiveCategory | null>(null);
  const { archives, status, loadMore, canLoadMore } = useArchives(category, 24);
  // Reactions write through /api/react (trusted session); overlay gives instant
  // feedback over the live query before the subscription catches up.
  const { archives: reactiveArchives, react } = useReactions(archives);
  const report = useReport();

  return (
    <ArchiveFeed
      archives={reactiveArchives.map(responseToArchive)}
      category={category}
      onCategoryChange={setCategory}
      onReact={react}
      onReportSubmit={(id, reason) => report(id, reason)}
      onLoadMore={loadMore}
      hasMore={canLoadMore}
      loadingMore={status === "LoadingMore"}
      loading={status === "LoadingFirstPage"}
    />
  );
}
