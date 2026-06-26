"use client";

import Image from "next/image";
import { Eye, Flag } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";
import { CATEGORY_LABELS } from "@/constants/categories";
import type { Archive } from "@/types/archive";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StampMark } from "@/components/archive/stamp-mark";
import { ReactionButton } from "@/components/archive/reaction-button";

interface ArchiveCardProps {
  archive: Archive;
  onOpen: (archive: Archive) => void;
  onReport: (archive: Archive) => void;
}

/** A single artifact card. Image-primary; falls back to a quoted text block. */
export function ArchiveCard({ archive, onOpen, onReport }: ArchiveCardProps) {
  return (
    <article className="bg-surface-container-lowest border-gallery-gray group/card relative flex flex-col gap-4 overflow-hidden rounded-[1.5rem] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-headline-md text-ink-black font-display">
          {archive.company ?? "Anonymous"}
        </h2>
        <Badge variant="outline">{CATEGORY_LABELS[archive.category]}</Badge>
      </div>

      {archive.image ? (
        <button
          type="button"
          onClick={() => onOpen(archive)}
          className="group/media bg-surface-variant relative aspect-[4/3] w-full overflow-hidden rounded-lg"
          aria-label="View artifact"
        >
          <Image
            src={archive.image}
            alt={`Rejection from ${archive.company ?? "an organisation"}`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-80 grayscale transition-all duration-300 group-hover/media:opacity-100 group-hover/media:grayscale-0"
          />
          {archive.stamp && (
            <StampMark
              label={archive.stamp}
              className="text-label-caps bg-surface/70 absolute top-3 right-3 px-2 py-0.5 font-mono backdrop-blur-sm"
            />
          )}
          <div className="bg-background/40 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-sm transition-opacity group-hover/media:opacity-100">
            <Eye className="text-on-surface size-8" />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(archive)}
          className="border-rejection-red text-body-lg text-on-surface font-body relative border-l-2 pl-4 text-left italic"
        >
          &ldquo;{archive.text}&rdquo;
          {archive.stamp && (
            <StampMark
              label={archive.stamp}
              className="text-label-caps pointer-events-none absolute -top-1 right-0 px-2 py-0.5 font-mono opacity-40"
            />
          )}
        </button>
      )}

      {archive.image && archive.text && (
        <p className="text-body-md text-on-surface-variant font-body line-clamp-3 italic">
          &ldquo;{archive.text}&rdquo;
        </p>
      )}

      {archive.caption && (
        <p className="text-body-md text-muted-type font-body">{archive.caption}</p>
      )}

      <div className="border-gallery-gray mt-auto flex items-center justify-between border-t pt-4">
        <span
          className="text-meta-data text-muted-type font-mono"
          suppressHydrationWarning
        >
          {formatRelativeTime(archive.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onReport(archive)}
                aria-label="Report artifact"
                className="text-muted-type hover:text-rejection-red flex size-8 items-center justify-center rounded-full transition-colors"
              >
                <Flag className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Report</TooltipContent>
          </Tooltip>
          <ReactionButton count={archive.reactions} />
        </div>
      </div>
    </article>
  );
}
