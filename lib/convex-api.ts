import {
  makeFunctionReference,
  type PaginationOptions,
  type PaginationResult,
} from "convex/server";

import type { ArchiveResponse, ArchiveCategory, ArchiveInput } from "@/types/archive";
import type { ReportReason } from "@/types/report";

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
      { archiveId: string; reason: ReportReason; visitorId?: string },
      { ok: true }
    >("reports:create"),
  },
} as const;
