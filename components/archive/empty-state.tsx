"use client";

import type { ArchiveCategory } from "@/types/archive";
import { CATEGORY_LABELS } from "@/constants/categories";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StampMark } from "@/components/archive/stamp-mark";
import { useSubmissionTrigger } from "@/components/upload/submission-context";

/** Empty board — a lone taped-up note saying nothing's pinned yet. */
export function EmptyState({
  category,
  onClear,
}: {
  category?: ArchiveCategory | null;
  onClear?: () => void;
}) {
  const trigger = useSubmissionTrigger();

  return (
    <div className="mx-auto max-w-[1120px] px-5 md:px-16">
      <div className="paper-card relative mx-auto flex max-w-xl -rotate-1 flex-col items-center gap-6 px-8 py-16 text-center">
        <StampMark label="Empty" className="absolute top-6 right-6 text-[18px]" />
        <Inbox className="text-outline size-9" strokeWidth={1.5} />
        <h2 className="text-headline-md text-on-surface font-display">
          {category
            ? `No ${CATEGORY_LABELS[category].toLowerCase()} rejections yet.`
            : "The archive is empty."}
        </h2>
        <p className="text-on-surface-variant text-body-md max-w-md font-mono">
          {category
            ? "Try another category or add your own rejection."
            : "Be the first to pin a rejection to the wall."}
        </p>
        {category && (
          <Button variant="ghost" onClick={onClear}>
            Browse all rejections
          </Button>
        )}
        <Button size="lg" {...trigger}>
          Archive Yours
        </Button>
      </div>
    </div>
  );
}
