"use client";

import * as React from "react";

import { useArchives } from "@/hooks/use-archives";
import { useReaction } from "@/hooks/use-reaction";
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
  const react = useReaction();
  const report = useReport();

  return (
    <ArchiveFeed
      archives={archives.map(responseToArchive)}
      category={category}
      onCategoryChange={setCategory}
      onReact={(id) => react(id)}
      onReportSubmit={(id, reason) => report(id, reason)}
      onLoadMore={loadMore}
      hasMore={canLoadMore}
      loadingMore={status === "LoadingMore"}
      loading={status === "LoadingFirstPage"}
    />
  );
}
