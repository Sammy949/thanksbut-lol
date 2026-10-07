"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { type SubmissionValues } from "@/lib/submission-schema";
import { Button } from "@/components/ui/button";
import { ArtifactPreview } from "./artifact-preview";
import { StampMark } from "@/components/archive/stamp-mark";

/** Post-submit success view: "Archived for the culture." with the ARCHIVED stamp. */
export function SubmissionSuccess({
  id,
  values,
  preview,
  manageToken,
  onView,
  onShare,
}: {
  id: string;
  values: SubmissionValues;
  preview: string | null;
  /** Secret capability to edit/delete this post later. Null if create didn't return it. */
  manageToken: string | null;
  onView: () => void;
  onShare: () => void;
}) {
  const [manualLink, setManualLink] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const copyManageLink = async () => {
    if (!manageToken) return;
    // Token rides in the hash so it never lands in server/CDN access logs.
    const url = `${window.location.origin}/manage/${id}#${manageToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Private deletion link copied", {
        description:
          "Anyone with this private link can remove your post. Don't share it publicly.",
      });
    } catch {
      setManualLink(url);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
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
          Your rejection is on the wall.
        </p>
      </div>

      <div className="relative mt-6">
        <ArtifactPreview values={values} preview={preview} published />
        <div className="mt-3 flex justify-center">
          <StampMark label="Archived" className="text-headline-md" />
        </div>
      </div>

      {/* Private manage link — the only way to delete this later (no accounts). */}
      {manageToken && (
        <div className="border-outline-variant mt-6 border border-dashed p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-label-caps text-on-surface font-mono uppercase">
                Save your private deletion link
              </p>
              <p className="text-secondary mt-1 font-mono text-xs leading-relaxed">
                Anyone with this link can remove your post. We can&apos;t recover it.
                Save it privately; use the share action below for a public link.
              </p>
            </div>
            <button
              type="button"
              onClick={copyManageLink}
              aria-label="Copy private deletion link"
              className="text-secondary hover:text-primary flex size-8 shrink-0 items-center justify-center transition-colors"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
          {manualLink && (
            <label className="text-secondary mt-3 block text-xs">
              Copy this private link
              <input
                aria-label="Private deletion link"
                readOnly
                value={manualLink}
                onFocus={(e) => e.target.select()}
                className="mt-2 w-full border p-2 font-mono"
              />
            </label>
          )}
          <Button variant="ghost" size="sm" onClick={copyManageLink}>
            {copied ? "Copied" : "Copy private deletion link"}
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Button variant="accent" shape="sheet" className="w-full" onClick={onView}>
          View your rejection
        </Button>
        <Button variant="secondary" shape="sheet" className="w-full" onClick={onShare}>
          Share rejection
        </Button>
      </div>
    </div>
  );
}
