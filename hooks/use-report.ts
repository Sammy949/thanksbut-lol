"use client";

import type { ReportReason } from "@/types/report";

/**
 * File a report against an archive.
 *
 * Writes through the trusted `/api/report` route (HMAC session cookie + rate
 * limit + server secret), mirroring reactions — the reporter identity is issued
 * server-side so a single visitor can't flood the moderation queue. Returns a
 * promise so the dialog can await it and toast success/failure honestly.
 */
export function useReport() {
  return async (archiveId: string, reason: ReportReason): Promise<void> => {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ archiveId, reason }),
    });
    if (!res.ok) throw new Error(`Report failed: ${res.status}`);
  };
}
