"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

import { formatRelativeTime } from "@/lib/format";
import { CATEGORY_LABELS } from "@/constants/categories";
import type { Archive } from "@/types/archive";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ReactionButton } from "./reaction-button";
import { ProgressiveImage } from "./progressive-image";

interface ArchiveLightboxProps {
  archive: Archive | null;
  previewMode?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReport: (archive: Archive) => void;
  onReact?: (id: string) => void;
}

/** Inspect view — the letter lifted off the wall and laid flat for reading. */
export function ArchiveLightbox({
  archive,
  previewMode = false,
  onPrevious,
  onNext,
  open,
  onOpenChange,
  onReport,
  onReact,
}: ArchiveLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] max-w-2xl overflow-y-auto"
        onKeyDown={(e) => {
          if (
            e.target instanceof HTMLElement &&
            e.target.closest("input, textarea, select, [contenteditable]")
          )
            return;
          if (e.key === "ArrowLeft" && onPrevious) {
            e.preventDefault();
            onPrevious();
          }
          if (e.key === "ArrowRight" && onNext) {
            e.preventDefault();
            onNext();
          }
        }}
      >
        {archive && (
          <div className="relative flex flex-col gap-5">
            {/* No stamp here — the inspect view stays clean so the screenshot is
                fully readable; stamps live on the board cards. */}
            <div className="border-outline-variant flex items-end justify-between gap-3 border-b border-dashed pr-8 pb-3">
              <DialogTitle>{archive.company ?? "Rejection"}</DialogTitle>
              <Badge variant="square">{CATEGORY_LABELS[archive.category]}</Badge>
            </div>

            {archive.image && (
              <div className="bg-surface-variant border-outline-variant flex max-h-[70vh] w-full items-center justify-center overflow-hidden border">
                <ProgressiveImage
                  src={archive.image}
                  alt={`Rejection from ${archive.company ?? "an organisation"}`}
                  width={archive.imageWidth}
                  height={archive.imageHeight}
                  blurDataUrl={archive.blurDataUrl}
                  variant="inspect"
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
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={previewMode}
                  onClick={() => onReport(archive)}
                  className="text-secondary hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <Flag className="size-4" />
                  <span className="text-label-caps font-mono uppercase">Report</span>
                </button>
                {!previewMode && (
                  <ReactionButton
                    key={archive.id}
                    count={archive.reactions}
                    reacted={archive.reacted}
                    pending={archive.reactionPending}
                    onToggle={onReact ? () => onReact(archive.id) : undefined}
                    className="gap-1.5 text-sm"
                  />
                )}
              </div>
            </div>
            {!previewMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const url = `${window.location.origin}/?a=${archive.id}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Public link copied");
                  } catch {
                    window.prompt("Copy this public rejection link", url);
                  }
                }}
              >
                Share rejection
              </Button>
            )}
            {(onPrevious || onNext) && (
              <nav
                aria-label="Browse rejections"
                className="flex justify-between gap-3"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!onPrevious}
                  onClick={onPrevious}
                >
                  Previous rejection
                </Button>
                <Button variant="ghost" size="sm" disabled={!onNext} onClick={onNext}>
                  Next rejection
                </Button>
              </nav>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
