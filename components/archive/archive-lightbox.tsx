"use client";

import Image from "next/image";
import { Flag } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";
import { CATEGORY_LABELS } from "@/constants/categories";
import type { Archive } from "@/types/archive";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StampMark } from "@/components/archive/stamp-mark";

interface ArchiveLightboxProps {
  archive: Archive | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReport: (archive: Archive) => void;
}

/** Full-size view of one artifact. Inferred from the card's "view" affordance. */
export function ArchiveLightbox({
  archive,
  open,
  onOpenChange,
  onReport,
}: ArchiveLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {archive && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 pr-8">
              <DialogTitle>{archive.company ?? "Anonymous"}</DialogTitle>
              <Badge variant="outline">{CATEGORY_LABELS[archive.category]}</Badge>
            </div>

            {archive.image ? (
              <div className="bg-surface-variant relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image
                  src={archive.image}
                  alt={`Rejection from ${archive.company ?? "an organisation"}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover"
                />
                {archive.stamp && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <StampMark
                      label={archive.stamp}
                      className="bg-surface/70 text-label-caps font-mono backdrop-blur-sm"
                    />
                  </div>
                )}
              </div>
            ) : null}

            {archive.text && (
              <DialogDescription className="border-rejection-red text-body-lg text-on-surface border-l-2 pl-4 italic">
                &ldquo;{archive.text}&rdquo;
              </DialogDescription>
            )}

            {archive.caption && (
              <p className="text-body-md text-muted-type font-body">
                {archive.caption}
              </p>
            )}

            <div className="border-gallery-gray flex items-center justify-between border-t pt-4">
              <span
                className="text-meta-data text-muted-type font-mono"
                suppressHydrationWarning
              >
                {formatRelativeTime(archive.createdAt)}
                {archive.displayName ? ` · ${archive.displayName}` : ""}
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onReport(archive)}
                  className="text-muted-type hover:text-rejection-red flex items-center gap-1.5 transition-colors"
                >
                  <Flag className="size-4" />
                  <span className="text-meta-data font-mono">Report</span>
                </button>
                <span className="text-on-surface flex items-center gap-1.5">
                  <span className="text-base leading-none">🥲</span>
                  <span className="text-meta-data font-mono">{archive.reactions}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
