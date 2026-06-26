/** Why an archive was reported. */
export type ReportReason = "spam" | "pii" | "harassment" | "other";

export interface Report {
  id: string;
  archiveId: string;
  reason: ReportReason;
  /** Anonymous reporter identity (localStorage UUID), if available. */
  visitorId?: string;
  status: "open" | "resolved";
  createdAt: number;
}

/** Human-facing labels for each reason (matches the existing report dialog). */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam",
  pii: "Contains personal information",
  harassment: "Harassment",
  other: "Other",
};
