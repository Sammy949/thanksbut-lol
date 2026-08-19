import {
  makeFunctionReference,
  type PaginationOptions,
  type PaginationResult,
} from "convex/server";

import type { ArchiveResponse, ArchiveCategory, ArchiveInput } from "@/types/archive";
import type { ReportReason } from "@/types/report";

/** One reported archive as shown on the admin dashboard (from reports:listOpen). */
export interface OpenReportItem {
  archiveId: string;
  reportCount: number;
  reasons: ReportReason[];
  firstReportedAt: number;
  archive: {
    id: string;
    category: ArchiveCategory;
    image: { url: string } | null;
    text: string | null;
    company: string | null;
    caption: string | null;
    displayName: string | null;
    status: "visible" | "removed";
    createdAt: number;
  } | null;
}

/**
 * Typed references to the Convex functions, by name.
 *
 * We intentionally avoid importing `convex/_generated/api` so the frontend
 * typechecks and builds WITHOUT a provisioned Convex deployment. Running
 * `npx convex dev` deploys the matching functions; these string names
 * ("module:export") resolve at runtime. The generics keep call sites fully typed.
 */
export const api = {
  archives: {
    list: makeFunctionReference<
      "query",
      {
        paginationOpts: PaginationOptions;
        category?: ArchiveCategory;
        sessionId?: string;
      },
      PaginationResult<ArchiveResponse>
    >("archives:list"),
    getById: makeFunctionReference<
      "query",
      { id: string; sessionId?: string },
      ArchiveResponse | null
    >("archives:getById"),
    stats: makeFunctionReference<"query", Record<string, never>, { total: number }>(
      "archives:stats",
    ),
    create: makeFunctionReference<
      "mutation",
      ArchiveInput,
      { id: string; manageToken: string }
    >("archives:create"),
    removeByToken: makeFunctionReference<
      "mutation",
      { id: string; manageToken: string; secret: string },
      { deleted: boolean; imageKey: string | null }
    >("archives:removeByToken"),
    moderateRemove: makeFunctionReference<
      "mutation",
      { archiveId: string; secret: string },
      { removed: boolean; imageKey: string | null }
    >("archives:moderateRemove"),
  },
  reactions: {
    toggle: makeFunctionReference<
      "mutation",
      { archiveId: string; sessionId: string; secret: string },
      { reacted: boolean; reactions: number }
    >("reactions:toggle"),
  },
  reports: {
    create: makeFunctionReference<
      "mutation",
      { archiveId: string; reason: ReportReason; sessionId: string; secret: string },
      { ok: true; deduped: boolean }
    >("reports:create"),
    listOpen: makeFunctionReference<"query", { secret: string }, OpenReportItem[]>(
      "reports:listOpen",
    ),
    dismissForArchive: makeFunctionReference<
      "mutation",
      { archiveId: string; secret: string },
      { resolved: number }
    >("reports:dismissForArchive"),
  },
} as const;
