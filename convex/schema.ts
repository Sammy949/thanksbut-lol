import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * thanksbut.lol data model.
 *
 * Shared value validators live here so functions can reuse them. The matching
 * TypeScript shapes live in `types/archive.ts` (frontend-facing) and are kept
 * deliberately aligned with these tables.
 */

export const categoryValidator = v.union(
  v.literal("job"),
  v.literal("internship"),
  v.literal("scholarship"),
  v.literal("hackathon"),
  v.literal("university"),
  v.literal("other"),
);

export const stampValidator = v.union(v.literal("REJECTED"), v.literal("GHOSTED"));

export const reportReasonValidator = v.union(
  v.literal("spam"),
  v.literal("pii"),
  v.literal("harassment"),
  v.literal("other"),
);

/** Uploaded image metadata returned by UploadThing, persisted with the archive. */
export const imageValidator = v.object({
  url: v.string(),
  key: v.string(),
  name: v.string(),
  size: v.number(),
  type: v.string(),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  blurDataUrl: v.optional(v.string()),
});

export default defineSchema({
  archives: defineTable({
    category: categoryValidator,
    image: v.optional(imageValidator),
    text: v.optional(v.string()),
    company: v.optional(v.string()),
    caption: v.optional(v.string()),
    displayName: v.optional(v.string()),
    stamp: v.optional(stampValidator),
    /** Denormalised reaction count (source of truth = `reactions` table). */
    reactions: v.number(),
    /** Moderation flag; "removed" archives are hidden from the wall. */
    status: v.union(v.literal("visible"), v.literal("removed")),
    /** Secret link for the submitter to edit/delete later (no accounts). */
    manageToken: v.string(),
  })
    // Newest-first wall: eq(status) then order desc by _creationTime.
    .index("by_status", ["status"])
    // Category filter: eq(status, category) then order desc by _creationTime.
    .index("by_category", ["status", "category"]),

  reactions: defineTable({
    archiveId: v.id("archives"),
    /**
     * Resolved caller identity (see convex/lib/identity). Today "visitor:<uuid>"
     * from localStorage; becomes "user:<id>" once accounts exist — no schema
     * change needed.
     */
    identity: v.string(),
  })
    .index("by_archive_identity", ["archiveId", "identity"])
    .index("by_identity", ["identity"]),

  reports: defineTable({
    archiveId: v.id("archives"),
    reason: reportReasonValidator,
    visitorId: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("resolved")),
  })
    .index("by_archive", ["archiveId"])
    .index("by_status", ["status"]),
});
