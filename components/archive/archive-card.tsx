"use client";

import * as React from "react";
import Image from "next/image";
import { Eye, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { CATEGORIES } from "@/constants/categories";
import type { Archive } from "@/types/archive";
import { Badge } from "@/components/ui/badge";
import { StampMark } from "@/components/archive/stamp-mark";

const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<Archive["category"], string>;

interface ArchiveCardProps {
  archive: Archive;
  onOpen: (archive: Archive) => void;
  onReport: (archive: Archive) => void;
}

/** A single artifact card. Image-primary; falls back to a quoted text block. */
export function ArchiveCard({ archive, onOpen, onReport }: ArchiveCardProps) {
  const [reactions, setReactions] = React.useState(archive.reactions);
  const [reacted, setReacted] = React.useState(false);

  const toggleReaction = () => {
    setReacted((prev) => {
      setReactions((n) => n + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <article className="bg-surface-container-lowest border-gallery-gray group/card relative flex flex-col gap-4 overflow-hidden rounded-[1.5rem] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-headline-md text-ink-black font-display">
          {archive.company ?? "Anonymous"}
        </h2>
        <Badge variant="outline">{CATEGORY_LABEL[archive.category]}</Badge>
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
            <div className="absolute inset-0 flex items-center justify-center">
              <StampMark
                label={archive.stamp}
                className="bg-surface/70 text-label-caps font-mono backdrop-blur-sm"
              />
            </div>
          )}
          <div className="bg-background/40 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-sm transition-opacity group-hover/media:opacity-100">
            <Eye className="text-on-surface size-8" />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(archive)}
          className="border-rejection-red text-body-lg text-on-surface font-body border-l-2 pl-4 text-left italic"
        >
          &ldquo;{archive.text}&rdquo;
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
          <button
            type="button"
            onClick={() => onReport(archive)}
            aria-label="Report artifact"
            className="text-muted-type hover:text-on-surface flex size-8 items-center justify-center rounded-full transition-colors"
          >
            <MoreHorizontal className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggleReaction}
            aria-pressed={reacted}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors",
              reacted ? "text-on-surface" : "text-muted-type hover:text-on-surface",
            )}
          >
            <span className="text-base leading-none">🥲</span>
            <span className="text-meta-data font-mono">{reactions}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
