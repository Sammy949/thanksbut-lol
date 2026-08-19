"use client";

import { Trash2, Check, ScanLine, Loader2, Flag } from "lucide-react";

import type { OpenReportItem } from "@/lib/convex-api";
import { REPORT_REASON_LABELS } from "@/types/report";
import { CATEGORY_LABELS } from "@/constants/categories";
import { formatRelativeTime } from "@/lib/format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Which action is mid-flight, so the buttons can show a spinner and lock. */
export type DetailBusy = "remove" | "dismiss" | "redact" | null;

interface ReportDetailDialogProps {
  item: OpenReportItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
  onDismiss: () => void;
  onRedact: () => void;
  busy: DetailBusy;
}

/**
 * Owner moderation detail view. Unlike the public lightbox (which carries Report
 * + React actions that make no sense for a moderator), this shows the FULL
 * artifact, the per-report timeline, and the moderation actions: remove, dismiss,
 * or redact the image in place.
 */
export function ReportDetailDialog({
  item,
  open,
  onOpenChange,
  onRemove,
  onDismiss,
  onRedact,
  busy,
}: ReportDetailDialogProps) {
  const a = item?.archive ?? null;
  const anyBusy = busy !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {item && (
          <div className="flex max-h-[85vh] flex-col gap-5 overflow-y-auto">
            <div className="border-outline-variant flex items-end justify-between gap-3 border-b border-dashed pr-8 pb-3">
              <DialogTitle>{a?.company ?? "Anonymous"}</DialogTitle>
              <div className="flex items-center gap-2">
                {a && <Badge variant="square">{CATEGORY_LABELS[a.category]}</Badge>}
                {a?.status === "removed" && (
                  <span className="text-error font-mono text-[11px] uppercase">
                    removed
                  </span>
                )}
              </div>
            </div>

            {/* Full artifact — natural ratio, letterboxed (mirrors the lightbox). */}
            {a?.image ? (
              <div className="bg-surface-variant border-outline-variant flex max-h-[60vh] w-full items-center justify-center overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element -- natural-ratio
                    artifact of unknown dimensions; next/image needs fixed w/h or fill. */}
                <img
                  src={a.image.url}
                  alt={`Reported artifact from ${a.company ?? "an organisation"}`}
                  className="max-h-[60vh] w-auto max-w-full object-contain"
                />
              </div>
            ) : a?.text ? (
              <p className="text-on-surface text-body-md border-outline-variant bg-surface-container-low border p-4 font-mono leading-relaxed whitespace-pre-line">
                {a.text}
              </p>
            ) : (
              <p className="text-secondary font-mono text-sm">
                This artifact is no longer available (removed or deleted).
              </p>
            )}

            {a?.caption && (
              <p className="text-on-surface-variant border-primary font-display border-l-2 pl-4 text-[18px] italic">
                &ldquo;{a.caption}&rdquo;
              </p>
            )}

            {/* Report timeline */}
            <div className="border-outline-variant border-t pt-4">
              <div className="mb-3 flex items-center gap-2">
                <Flag className="text-primary size-4" />
                <span className="text-on-surface font-mono text-sm font-bold">
                  {item.reportCount} report{item.reportCount === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {item.reports.map((r, i) => (
                  <li
                    key={i}
                    className="text-on-surface-variant flex items-center justify-between gap-4 font-mono text-xs"
                  >
                    <span>{REPORT_REASON_LABELS[r.reason] ?? r.reason}</span>
                    <span className="text-secondary shrink-0" suppressHydrationWarning>
                      {formatRelativeTime(r.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
              {a && (
                <p
                  className="text-secondary mt-3 font-mono text-[11px]"
                  suppressHydrationWarning
                >
                  Submitted {formatRelativeTime(a.createdAt)}
                  {a.displayName ? ` · ${a.displayName}` : ""}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="border-outline-variant flex flex-wrap items-center justify-end gap-3 border-t pt-4">
              {a?.image && a.status !== "removed" && (
                <Button
                  variant="secondary"
                  size="sm"
                  shape="sheet"
                  className="mr-auto"
                  disabled={anyBusy}
                  onClick={onRedact}
                >
                  {busy === "redact" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <ScanLine className="size-4" /> Redact image
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                shape="sheet"
                disabled={anyBusy}
                onClick={onDismiss}
              >
                {busy === "dismiss" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Check className="size-4" /> Dismiss
                  </>
                )}
              </Button>
              <Button
                variant="accent"
                size="sm"
                shape="sheet"
                disabled={anyBusy || a?.status === "removed"}
                onClick={onRemove}
              >
                {busy === "remove" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="size-4" /> Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
