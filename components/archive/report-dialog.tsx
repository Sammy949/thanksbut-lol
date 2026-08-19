"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ReportReason } from "@/types/report";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "pii", label: "Contains personal information" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Live mode: persist the report. When omitted, the dialog only toasts. */
  onSubmit?: (reason: ReportReason) => void | Promise<void>;
}

/** "What is wrong with this submission?" — the report flow from the mockups. */
export function ReportDialog({ open, onOpenChange, onSubmit }: ReportDialogProps) {
  const [reason, setReason] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!reason || submitting) return;

    // Mock mode (no handler): nothing to persist, just acknowledge and close.
    if (!onSubmit) {
      onOpenChange(false);
      setReason("");
      toast.success("Report received", {
        description: "Thanks for helping keep the archive clean.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(reason as ReportReason);
      onOpenChange(false);
      setReason("");
      toast.success("Report received", {
        description: "Thanks for helping keep the archive clean.",
      });
    } catch {
      // Keep the dialog open so the reason isn't lost — let them retry.
      toast.error("Couldn't file that report", {
        description: "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Artifact</DialogTitle>
          <DialogDescription>
            Help us maintain the integrity of the archive. What is wrong with this
            submission?
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={reason} onValueChange={setReason} className="py-2">
          {REASONS.map((r) => (
            <label
              key={r.value}
              className="text-body-md text-on-surface font-body flex cursor-pointer items-center gap-3"
            >
              <RadioGroupItem value={r.value} />
              {r.label}
            </label>
          ))}
        </RadioGroup>

        <DialogFooter className="border-outline-variant border-t pt-4">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            shape="sheet"
            disabled={!reason || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
