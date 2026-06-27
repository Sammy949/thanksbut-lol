"use client";

import Image from "next/image";

import { type SubmissionValues } from "@/lib/submission-schema";
import { CATEGORY_LABELS } from "@/constants/categories";
import { Badge } from "@/components/ui/badge";

/** The Preview tab: a live artifact-card render of the current form values. */
export function ArtifactPreview({
  values,
  preview,
}: {
  values: SubmissionValues;
  preview: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label-caps text-secondary font-body text-center uppercase">
        Artifact Preview
      </p>
      <article className="bg-surface border-outline-variant flex flex-col gap-4 rounded-xl border p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-headline-md text-on-surface font-display">
            {values.company || "Anonymous"}
          </span>
          <Badge variant="outline">{CATEGORY_LABELS[values.category]}</Badge>
        </div>
        {preview && (
          <div className="bg-surface-variant relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image src={preview} alt="" fill className="object-cover grayscale" />
          </div>
        )}
        {values.text && (
          <p className="text-body-md text-secondary font-body italic">
            &ldquo;{values.text}&rdquo;
          </p>
        )}
        {values.caption && (
          <p className="text-body-md text-on-surface-variant font-body">
            {values.caption}
          </p>
        )}
        <div className="border-outline-variant flex items-center justify-between border-t pt-4">
          <span className="text-code-snippet text-secondary font-mono">Just now</span>
          <span className="text-code-snippet text-secondary font-mono">🥲 0</span>
        </div>
      </article>
      <p className="text-body-md text-secondary font-body px-4 text-center">
        This is how your rejection will appear in the archive. Ready to share the
        hustle?
      </p>
    </div>
  );
}
