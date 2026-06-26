"use client";

import { useMutation } from "convex/react";

import { api } from "@/lib/convex-api";
import type { ReportReason } from "@/types/report";
import { useVisitorId } from "./use-visitor-id";

/** File a report against an archive (backend exists; UI already built). */
export function useReport() {
  const visitorId = useVisitorId();
  const create = useMutation(api.reports.create);

  return (archiveId: string, reason: ReportReason) =>
    create({ archiveId, reason, visitorId: visitorId || undefined });
}
