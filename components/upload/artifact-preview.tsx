"use client";

import { type SubmissionValues } from "@/lib/submission-schema";
import { CATEGORY_LABELS } from "@/constants/categories";
import { Badge } from "@/components/ui/badge";

/** The Preview tab: a live artifact-card render of the current form values. */
export function ArtifactPreview({
  values,
  preview,
  published = false,
}: {
  values: SubmissionValues;
  preview: string | null;
  published?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label-caps text-secondary font-body text-center uppercase">
        {published ? "Your rejection" : "Submission preview"}
      </p>
      <article className="bg-surface border-outline-variant flex flex-col gap-4 rounded-none border p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-headline-md text-on-surface font-display">
            {values.company || "Rejection"}
          </span>
          <Badge variant="outline">{CATEGORY_LABELS[values.category]}</Badge>
        </div>
        {preview && (
          <div className="bg-surface-variant w-full overflow-hidden rounded-none">
            {/* eslint-disable-next-line @next/next/no-img-element -- full-ratio local screenshot */}
            <img
              src={preview}
              alt="Submission screenshot"
              className="max-h-[50vh] w-full object-contain"
            />
          </div>
        )}
        {values.text && (
          <p className="text-body-md text-secondary font-body whitespace-pre-wrap">
            {values.text}
          </p>
        )}
        {values.caption && (
          <p className="text-body-md text-on-surface-variant font-body">
            {values.caption}
          </p>
        )}
        <div className="border-outline-variant flex items-center justify-between border-t pt-4">
          <span className="text-code-snippet text-secondary font-mono">
            Just now{values.displayName ? ` · ${values.displayName}` : ""}
          </span>
          <span className="text-code-snippet text-secondary font-mono">🥲 0</span>
        </div>
      </article>
      {!published && (
        <p className="text-body-md text-secondary font-body px-4 text-center">
          Review the full submission before publishing. Screenshots may be cropped on
          the wall; readers can open them in full.
        </p>
      )}
    </div>
  );
}
