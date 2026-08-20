import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { reportReasonValidator } from "./schema";
import {
  resolveIdentity,
  assertServerSecret,
  assertAdminSecret,
} from "./lib/identity";

/**
 * File a report against an archive.
 *
 * TRUST MODEL mirrors reactions (see convex/reactions.ts): this runs
 * server-to-server from the Next `/api/report` route. `sessionId` is recovered
 * there from the HMAC-signed httpOnly cookie; `secret` proves the call came from
 * our server, not a forged browser request. Together they make the reporter
 * identity un-forgeable, which is what lets us dedupe.
 *
 * Post-moderation: the archive stays visible until an admin acts on the report.
 * At most one OPEN report per identity per archive — re-reporting is a no-op so
 * a single visitor can't flood the moderation queue.
 */
export const create = mutation({
  args: {
    archiveId: v.id("archives"),
    reason: reportReasonValidator,
    sessionId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { archiveId, reason, sessionId, secret }) => {
    assertServerSecret(secret);

    const archive = await ctx.db.get(archiveId);
    if (!archive) throw new Error("Archive not found");

    const identity = await resolveIdentity(ctx, sessionId);

    // Dedup: if this identity already has an OPEN report on this archive, keep
    // the first one (don't stack duplicates or reopen a resolved one).
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_archive_identity", (q) =>
        q.eq("archiveId", archiveId).eq("identity", identity),
      )
      .collect();
    if (existing.some((r) => r.status === "open")) {
      return { ok: true as const, deduped: true as const };
    }

    await ctx.db.insert("reports", {
      archiveId,
      reason,
      identity,
      status: "open",
    });

    return { ok: true as const, deduped: false as const };
  },
});

/**
 * Admin: list open reports grouped by archive, joined with the archive doc.
 *
 * Owner-only — gated by CONVEX_ADMIN_SECRET (the Next admin route verifies the
 * signed admin cookie before calling this). Returns one entry per reported
 * archive with its individual reports (reason + when) and the joined archive,
 * so the dashboard can show "what's flagged, why, and when" — plus the full
 * image (url + key, the key is needed to redact/replace the file) — without
 * N+1 lookups on the client. Skips archives that were already removed or
 * hard-deleted (stale reports).
 */
export const listOpen = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertAdminSecret(secret);

    const open = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    // Group the individual reports by archive.
    const byArchive = new Map<
      Id<"archives">,
      { reason: string; createdAt: number }[]
    >();
    for (const r of open) {
      const list = byArchive.get(r.archiveId);
      const entry = { reason: r.reason, createdAt: r._creationTime };
      if (list) list.push(entry);
      else byArchive.set(r.archiveId, [entry]);
    }

    const items = await Promise.all(
      [...byArchive.entries()].map(async ([archiveId, reports]) => {
        // Oldest report first — the timeline reads top-to-bottom.
        reports.sort((a, b) => a.createdAt - b.createdAt);
        const doc = await ctx.db.get(archiveId);
        return {
          archiveId: archiveId as string,
          reportCount: reports.length,
          reports,
          firstReportedAt: reports[0]?.createdAt ?? 0,
          archive: doc
            ? {
                id: doc._id as string,
                category: doc.category,
                image: doc.image
                  ? { url: doc.image.url, key: doc.image.key }
                  : null,
                text: doc.text ?? null,
                company: doc.company ?? null,
                caption: doc.caption ?? null,
                displayName: doc.displayName ?? null,
                status: doc.status,
                createdAt: doc._creationTime,
              }
            : null,
        };
      }),
    );

    // Newest-flagged first.
    items.sort((a, b) => b.firstReportedAt - a.firstReportedAt);
    return items;
  },
});

/**
 * Admin: resolve (dismiss) all open reports for an archive without removing it.
 * Owner-only. Used when a report is judged unfounded.
 */
export const dismissForArchive = mutation({
  args: { archiveId: v.id("archives"), secret: v.string() },
  handler: async (ctx, { archiveId, secret }) => {
    assertAdminSecret(secret);

    const open = await ctx.db
      .query("reports")
      .withIndex("by_archive", (q) => q.eq("archiveId", archiveId))
      .collect();

    let resolved = 0;
    for (const r of open) {
      if (r.status === "open") {
        await ctx.db.patch(r._id, { status: "resolved" });
        resolved++;
      }
    }
    return { resolved };
  },
});
