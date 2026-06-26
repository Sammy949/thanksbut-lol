"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { type SubmissionValues } from "@/lib/submission-schema";
import { CATEGORY_LABELS } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StampMark } from "@/components/archive/stamp-mark";

/** Post-submit success view: "Archived for the culture." with the ARCHIVED stamp. */
export function SubmissionSuccess({
  id,
  category,
  onView,
  onShare,
}: {
  id: string;
  category: SubmissionValues["category"];
  onView: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between">
        <DialogPrimitive.Close className="text-on-surface flex size-9 items-center justify-center rounded-full">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <h2 className="text-headline-lg-mobile text-primary font-display">
          Archived for the culture.
        </h2>
        <p className="text-body-lg text-on-surface-variant font-display italic">
          Your artifact is now part of the internet&apos;s history.
        </p>
      </div>

      <div className="border-primary/40 relative mt-8 flex-1 overflow-hidden rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <span className="text-meta-data text-on-surface font-mono">ID: {id}</span>
          <Badge variant="solid">{CATEGORY_LABELS[category]}</Badge>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="bg-surface-container-high h-3 w-2/3 rounded-full" />
          <div className="bg-surface-container-high h-3 w-full rounded-full" />
          <div className="bg-surface-container-high h-3 w-5/6 rounded-full" />
          <div className="bg-surface-container-high h-3 w-1/2 rounded-full" />
        </div>
        <div className="mt-8 flex justify-center">
          <StampMark label="Archived" className="text-headline-lg-mobile" />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button variant="accent" shape="sheet" className="w-full" onClick={onView}>
          View in Archive
        </Button>
        <Button variant="secondary" shape="sheet" className="w-full" onClick={onShare}>
          Share this Rejection
        </Button>
      </div>
    </div>
  );
}
