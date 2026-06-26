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

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "pii", label: "Contains personal information" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** "What is wrong with this submission?" — the report flow from the mockups. */
export function ReportDialog({ open, onOpenChange }: ReportDialogProps) {
  const [reason, setReason] = React.useState<string>("");

  const handleSubmit = () => {
    onOpenChange(false);
    setReason("");
    toast.success("Report received", {
      description: "Thanks for helping keep the archive clean.",
    });
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

        <DialogFooter className="border-gallery-gray border-t pt-4">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" shape="sheet" disabled={!reason} onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
