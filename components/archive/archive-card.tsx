"use client";

import type { CSSProperties } from "react";
import { Eye, Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { CATEGORY_LABELS } from "@/constants/categories";
import type { Archive } from "@/types/archive";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StampMark } from "./stamp-mark";
import { MaskingTape, PushPin, PaperClip } from "./decorations";
import { ReactionButton } from "./reaction-button";
import { ProgressiveImage } from "./progressive-image";

export type CardDecoration = "pin" | "tape" | "clip" | "none";

interface ArchiveCardProps {
  archive: Archive;
  onOpen: (archive: Archive) => void;
  onReport: (archive: Archive) => void;
  /** Live 🥲 toggle. When omitted the reaction button stays locally optimistic. */
  onReact?: (id: string) => void;
  rotation?: number;
  decoration?: CardDecoration;
  /** Decorative rubber stamp slapped across the card (assigned by the wall). */
  stamp?: string;
  /** Position + rotation for the stamp, so it scatters instead of being uniform. */
  stampStyle?: CSSProperties;
}

/** A pinned-up "rejection letter" artifact: paper card, stamp, tape/pin. */
export function ArchiveCard({
  archive,
  onOpen,
  onReport,
  onReact,
  rotation = 0,
  decoration = "none",
  stamp,
  stampStyle,
}: ArchiveCardProps) {
  return (
    <article
      className="paper-card paper-card-hover group relative p-5"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {decoration === "pin" && (
        <PushPin className="top-2 left-1/2 z-10 -translate-x-1/2" />
      )}
      {decoration === "tape" && (
        // Seated deep onto the card (h-6, top only -6px) with a gentle tilt, so
        // the rotated far end still overlaps the paper instead of lifting off
        // into the gap above the card. A steeper angle made the strip "float".
        <MaskingTape className="top-[-6px] left-5 z-10 h-6 w-16 -rotate-[7deg]" />
      )}
      {decoration === "clip" && <PaperClip className="top-[-12px] left-6 z-10" />}

      {stamp && (
        <StampMark
          label={stamp}
          style={stampStyle}
          className="absolute z-20 text-[22px]"
        />
      )}

      {/* Letterhead */}
      <div className="border-outline-variant mb-3 flex items-end justify-between gap-2 border-b border-dashed pb-2">
        <span className="text-on-surface min-w-0 truncate font-mono text-sm font-bold">
          {archive.company ?? "Rejection"}
        </span>
        <Badge variant="square" className="shrink-0">
          {CATEGORY_LABELS[archive.category]}
        </Badge>
      </div>

      {/* Mobile cards keep their 4:3 crop; desktop keeps natural proportions. */}
      {archive.image ? (
        <div className="border-outline-variant border">
          <ProgressiveImage
            src={archive.image}
            alt={`Rejection from ${archive.company ?? "an organisation"}`}
            width={archive.imageWidth}
            height={archive.imageHeight}
            blurDataUrl={archive.blurDataUrl}
          >
            <button
              type="button"
              onClick={() => onOpen(archive)}
              aria-label="Open rejection"
              className="bg-on-surface/25 focus-visible:ring-ring absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset"
            >
              <Eye className="text-surface size-7" />
            </button>
          </ProgressiveImage>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(archive)}
          aria-label="Open rejection"
          className="block w-full text-left"
        >
          <p className="text-on-surface-variant text-code-snippet line-clamp-5 font-mono leading-relaxed">
            {archive.text}
          </p>
        </button>
      )}

      {/* Margin note + reaction */}
      <div className="border-outline-variant mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <span
          className={cn(
            "text-secondary truncate font-mono text-xs",
            archive.caption && "italic",
          )}
          suppressHydrationWarning
        >
          {archive.caption
            ? `“${archive.caption}”`
            : formatRelativeTime(archive.createdAt)}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onReport(archive)}
                aria-label="Report rejection"
                className="text-secondary hover:text-primary flex size-7 items-center justify-center transition-colors"
              >
                <Flag className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Report</TooltipContent>
          </Tooltip>
          <ReactionButton
            count={archive.reactions}
            pending={archive.reactionPending}
            reacted={archive.reacted}
            onToggle={onReact ? () => onReact(archive.id) : undefined}
          />
        </div>
      </div>
    </article>
  );
}
