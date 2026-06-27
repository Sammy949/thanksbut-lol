"use client";

import Image from "next/image";
import { Flag } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";
import { CATEGORY_LABELS } from "@/constants/categories";
import type { Archive } from "@/types/archive";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ReactionButton } from "./reaction-button";

interface ArchiveLightboxProps {
  archive: Archive | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReport: (archive: Archive) => void;
  onReact?: (id: string) => void;
}

/** Inspect view — the letter lifted off the wall and laid flat for reading. */
export function ArchiveLightbox({
  archive,
  open,
  onOpenChange,
  onReport,
  onReact,
}: ArchiveLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {archive && (
          <div className="relative flex flex-col gap-5">
            {/* No stamp here — the inspect view stays clean so the screenshot is
                fully readable; stamps live on the board cards. */}
            <div className="border-outline-variant flex items-end justify-between gap-3 border-b border-dashed pr-8 pb-3">
              <DialogTitle>{archive.company ?? "Anonymous"}</DialogTitle>
              <Badge variant="square">{CATEGORY_LABELS[archive.category]}</Badge>
            </div>

            {archive.image && (
              <div className="bg-surface-variant border-outline-variant relative aspect-[4/3] w-full overflow-hidden border">
                <Image
                  src={archive.image}
                  alt={`Rejection from ${archive.company ?? "an organisation"}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover"
                />
              </div>
            )}

            {archive.text && (
              <p className="text-on-surface text-body-md font-mono leading-relaxed whitespace-pre-line">
                {archive.text}
              </p>
            )}

            {archive.caption && (
              <p className="text-on-surface-variant border-primary font-display border-l-2 pl-4 text-[18px] italic">
                &ldquo;{archive.caption}&rdquo;
              </p>
            )}

            <div className="border-outline-variant flex items-center justify-between border-t pt-4">
              <span
                className="text-secondary text-code-snippet font-mono"
                suppressHydrationWarning
              >
                {formatRelativeTime(archive.createdAt)}
                {archive.displayName ? ` · ${archive.displayName}` : ""}
              </span>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => onReport(archive)}
                  className="text-secondary hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <Flag className="size-4" />
                  <span className="text-label-caps font-mono uppercase">Report</span>
                </button>
                <ReactionButton
                  key={archive.id}
                  count={archive.reactions}
                  reacted={archive.reacted}
                  optimistic
                  onToggle={onReact ? () => onReact(archive.id) : undefined}
                  className="gap-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
