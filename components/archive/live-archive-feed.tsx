"use client";

import * as React from "react";
import { useQuery, useConvexConnectionState } from "convex/react";

import { api } from "@/lib/convex-api";
import { useArchives } from "@/hooks/use-archives";
import { useReactions } from "@/hooks/use-reactions";
import { useReport } from "@/hooks/use-report";
import { useSessionId } from "@/hooks/use-session-id";
import { useShareTarget } from "@/hooks/use-share-target";
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
  const connection = useConvexConnectionState();
  const [category, setCategory] = React.useState<ArchiveCategory | null>(null);
  const { archives, status, loadMore, canLoadMore } = useArchives(category, 24);
  // Reactions write through /api/react (trusted session); overlay gives instant
  // feedback over the live query before the subscription catches up.

  const report = useReport();

  // `?a=<id>` deep link (from the share button). Resolve the shared artifact
  // directly — it may not be on the loaded page — and pop the lightbox on it.
  const sessionId = useSessionId();
  const shareId = useShareTarget();
  const shared = useQuery(
    api.archives.getById,
    shareId ? { id: shareId, sessionId: sessionId || undefined } : "skip",
  );

  const reactionSources =
    shared && !archives.some((a) => a.id === shared.id)
      ? [...archives, shared]
      : archives;
  const { archives: reactiveArchives, react } = useReactions(reactionSources);
  const sharedReactive = shared
    ? reactiveArchives.find((a) => a.id === shared.id)
    : undefined;

  return (
    <>
      {!connection.isWebSocketConnected &&
        (connection.hasEverConnected || connection.connectionRetries > 0) && (
          <p
            role="status"
            className="text-secondary px-5 text-center font-mono text-sm"
          >
            Connection interrupted. The wall will update when reconnected.{" "}
            <button className="underline" onClick={() => window.location.reload()}>
              Reload
            </button>
          </p>
        )}
      <ArchiveFeed
        archives={reactiveArchives
          .filter((a) => archives.some((original) => original.id === a.id))
          .map((a) => ({
            ...responseToArchive(a),
            reactionPending: a.reactionPending,
          }))}
        category={category}
        onCategoryChange={setCategory}
        onReact={react}
        onReportSubmit={(id, reason) => report(id, reason)}
        onLoadMore={loadMore}
        hasMore={canLoadMore}
        loadingMore={status === "LoadingMore"}
        loading={status === "LoadingFirstPage"}
        deepLinked={
          sharedReactive
            ? {
                ...responseToArchive(sharedReactive),
                reactionPending: sharedReactive.reactionPending,
              }
            : null
        }
        sharedUnavailable={Boolean(shareId) && shared === null}
        sharedLoading={Boolean(shareId) && shared === undefined}
      />
    </>
  );
}
