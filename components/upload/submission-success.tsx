"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { type SubmissionValues } from "@/lib/submission-schema";
import { CATEGORY_LABELS } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StampMark } from "@/components/archive/stamp-mark";

/** Post-submit success view: "Archived for the culture." with the ARCHIVED stamp. */
export function SubmissionSuccess({
  id,
  category,
  manageToken,
  onView,
  onShare,
}: {
  id: string;
  category: SubmissionValues["category"];
  /** Secret capability to edit/delete this post later. Null if create didn't return it. */
  manageToken: string | null;
  onView: () => void;
  onShare: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const copyManageLink = async () => {
    if (!manageToken) return;
    // Token rides in the hash so it never lands in server/CDN access logs.
    const url = `${window.location.origin}/manage/${id}#${manageToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Manage link copied", {
        description: "Keep it safe — it's the only way to remove this later.",
      });
    } catch {
      toast.error("Couldn't copy the link", { description: url });
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between">
        <DialogPrimitive.Close className="text-on-surface flex size-9 items-center justify-center rounded-none">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <h2 className="text-headline-md text-primary font-display">
          Archived for the culture.
        </h2>
        <p className="text-body-lg text-on-surface-variant font-display italic">
          Your artifact is now part of the internet&apos;s history.
        </p>
      </div>

      <div className="border-primary/40 relative mt-8 flex-1 overflow-hidden rounded-none border p-6">
        <div className="flex items-center justify-between">
          <span className="text-code-snippet text-on-surface font-mono">ID: {id}</span>
          <Badge variant="solid">{CATEGORY_LABELS[category]}</Badge>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="bg-surface-container-high h-3 w-2/3 rounded-none" />
          <div className="bg-surface-container-high h-3 w-full rounded-none" />
          <div className="bg-surface-container-high h-3 w-5/6 rounded-none" />
          <div className="bg-surface-container-high h-3 w-1/2 rounded-none" />
        </div>
        <div className="mt-8 flex justify-center">
          <StampMark label="Archived" className="text-headline-md" />
        </div>
      </div>

      {/* Private manage link — the only way to delete this later (no accounts). */}
      {manageToken && (
        <div className="border-outline-variant mt-6 border border-dashed p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-label-caps text-on-surface font-mono uppercase">
                Keep this link
              </p>
              <p className="text-secondary mt-1 font-mono text-xs leading-relaxed">
                It&apos;s the private key to remove this post. We can&apos;t recover it
                for you — save it somewhere safe.
              </p>
            </div>
            <button
              type="button"
              onClick={copyManageLink}
              aria-label="Copy manage link"
              className="text-secondary hover:text-primary flex size-8 shrink-0 items-center justify-center transition-colors"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
      )}

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
