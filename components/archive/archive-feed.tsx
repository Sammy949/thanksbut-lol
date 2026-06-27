"use client";

import * as React from "react";

import type { Archive, ArchiveCategory } from "@/types/archive";
import { CategoryFilters } from "./category-filters";
import { ArchiveWall } from "./archive-wall";
import { ArchiveLightbox } from "./archive-lightbox";
import { ReportDialog } from "./report-dialog";
import { EmptyState } from "./empty-state";

/**
 * Client wrapper that owns the browse experience: category filtering plus the
 * lightbox and report dialogs (one of each, opened by any card).
 */
export function ArchiveFeed({ archives }: { archives: Archive[] }) {
  const [category, setCategory] = React.useState<ArchiveCategory | null>(null);
  const [active, setActive] = React.useState<Archive | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);

  const filtered = category
    ? archives.filter((a) => a.category === category)
    : archives;

  const handleOpen = (archive: Archive) => {
    setActive(archive);
    setLightboxOpen(true);
  };

  const handleReport = (archive: Archive) => {
    setActive(archive);
    setReportOpen(true);
  };

  return (
    <section className="flex flex-col gap-10 pt-2 pb-24">
      <CategoryFilters value={category} onChange={setCategory} />

      {filtered.length > 0 ? (
        <ArchiveWall archives={filtered} onOpen={handleOpen} onReport={handleReport} />
      ) : (
        <EmptyState />
      )}

      <ArchiveLightbox
        archive={active}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onReport={(archive) => {
          setLightboxOpen(false);
          handleReport(archive);
        }}
      />
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </section>
  );
}
