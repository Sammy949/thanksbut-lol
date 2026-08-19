"use client";

import * as React from "react";

import type { Archive, ArchiveCategory } from "@/types/archive";
import type { ReportReason } from "@/types/report";
import { CategoryFilters } from "./category-filters";
import { ArchiveWall } from "./archive-wall";
import { ArchiveLightbox } from "./archive-lightbox";
import { ReportDialog } from "./report-dialog";
import { EmptyState } from "./empty-state";
import { ArchiveLoading } from "./archive-loading";

interface ArchiveFeedProps {
  archives: Archive[];
  /**
   * Live mode (all optional). When `onCategoryChange` is given the feed is
   * controlled by the parent (server-side filtering + pagination); otherwise it
   * self-manages category with client-side filtering over the mock data.
   */
  category?: ArchiveCategory | null;
  onCategoryChange?: (category: ArchiveCategory | null) => void;
  onReact?: (id: string) => void;
  onReportSubmit?: (id: string, reason: ReportReason) => void | Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  /** First-page load in progress — show the skeleton in the wall slot, keep tabs. */
  loading?: boolean;
  /**
   * A shared artifact resolved from a `?a=<id>` deep link. When it arrives we
   * pop the lightbox open on it, even if it isn't on the currently-loaded page.
   */
  deepLinked?: Archive | null;
}

/**
 * Client wrapper that owns the browse experience: category filtering plus the
 * lightbox and report dialogs (one of each, opened by any card). Drives live
 * Convex data when given live handlers, and the mock wall otherwise.
 */
export function ArchiveFeed({
  archives,
  category: categoryProp,
  onCategoryChange,
  onReact,
  onReportSubmit,
  onLoadMore,
  hasMore,
  loadingMore,
  loading,
  deepLinked,
}: ArchiveFeedProps) {
  const controlled = onCategoryChange !== undefined;

  const [internalCategory, setInternalCategory] =
    React.useState<ArchiveCategory | null>(null);
  const category = controlled ? (categoryProp ?? null) : internalCategory;
  const setCategory = controlled ? onCategoryChange : setInternalCategory;

  const [active, setActive] = React.useState<Archive | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);

  // Open the lightbox on a `?a=<id>` shared artifact once it resolves. Keyed on
  // the id (via a ref) so we auto-open each distinct share exactly once and
  // never yank it back open after the visitor closes it.
  const openedShareRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (deepLinked && openedShareRef.current !== deepLinked.id) {
      openedShareRef.current = deepLinked.id;
      setActive(deepLinked);
      setLightboxOpen(true);
    }
  }, [deepLinked]);

  // Live data is already filtered server-side; only the mock needs client filtering.
  const filtered =
    controlled || !category
      ? archives
      : archives.filter((a) => a.category === category);

  const handleOpen = (archive: Archive) => {
    setActive(archive);
    setLightboxOpen(true);
  };

  const handleReport = (archive: Archive) => {
    setActive(archive);
    setReportOpen(true);
  };

  // Infinite scroll: a sentinel near the end of the wall triggers loadMore.
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const loadMoreRef = React.useRef(onLoadMore);
  React.useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current?.();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <section className="flex flex-col gap-10 pt-2 pb-24">
      <CategoryFilters value={category} onChange={setCategory} />

      {filtered.length > 0 ? (
        <ArchiveWall
          archives={filtered}
          onOpen={handleOpen}
          onReport={handleReport}
          onReact={onReact}
        />
      ) : loading ? (
        <ArchiveLoading />
      ) : (
        <EmptyState />
      )}

      {onLoadMore && hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-2">
          {loadingMore && (
            <span className="text-label-caps text-secondary font-mono uppercase">
              loading more…
            </span>
          )}
        </div>
      )}

      <ArchiveLightbox
        archive={active}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onReact={onReact}
        onReport={(archive) => {
          setLightboxOpen(false);
          handleReport(archive);
        }}
      />
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={
          onReportSubmit && active
            ? (reason) => onReportSubmit(active.id, reason)
            : undefined
        }
      />
    </section>
  );
}
