import { paginationOptsValidator } from "convex/server";
import { v, ConvexError } from "convex/values";
import { ZodError } from "zod";

import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { categoryValidator, imageValidator } from "./schema";
import { serializeArchive } from "./lib/serialize";
import { resolveIdentity, assertServerSecret, assertAdminSecret } from "./lib/identity";
import { archiveInputSchema, type ArchiveInputValues } from "../lib/validation";

/**
 * Has this caller reacted to the given archive? Keyed on the server-issued
 * session id (the same identity the trusted reaction write uses), passed from
 * the client purely to render the 🥲 pressed state — forging it only fakes your
 * own checkbox, never the count.
 */
async function hasReacted(
  ctx: QueryCtx,
  archiveId: Id<"archives">,
  sessionId: string | undefined,
): Promise<boolean> {
  if (!sessionId) return false;
  const identity = await resolveIdentity(ctx, sessionId);
  const existing = await ctx.db
    .query("reactions")
    .withIndex("by_archive_identity", (q) =>
      q.eq("archiveId", archiveId).eq("identity", identity),
    )
    .unique();
  return existing !== null;
}

/** Paginated wall, newest-first, optionally filtered by category. */
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(categoryValidator),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { paginationOpts, category, sessionId }) => {
    const archivesQuery = category
      ? ctx.db
          .query("archives")
          .withIndex("by_category", (q) =>
            q.eq("status", "visible").eq("category", category),
          )
      : ctx.db
          .query("archives")
          .withIndex("by_status", (q) => q.eq("status", "visible"));

    const result = await archivesQuery.order("desc").paginate(paginationOpts);

    const page = await Promise.all(
      result.page.map(async (doc) =>
        serializeArchive(doc, await hasReacted(ctx, doc._id, sessionId)),
      ),
    );

    return { ...result, page };
  },
});

/** Single archive by id (or null if missing/removed/malformed). */
export const getById = query({
  args: { id: v.string(), sessionId: v.optional(v.string()) },
  handler: async (ctx, { id, sessionId }) => {
    // `id` arrives from an untrusted `?a=<id>` share link. normalizeId returns
    // null for anything that isn't a well-formed archives id, so a junk param
    // resolves to "not found" instead of throwing and crashing the homepage.
    const archiveId = ctx.db.normalizeId("archives", id);
    if (!archiveId) return null;
    const doc = await ctx.db.get(archiveId);
    if (!doc || doc.status !== "visible") return null;
    return serializeArchive(doc, await hasReacted(ctx, archiveId, sessionId));
  },
});

/**
 * Total visible archive count for the hero stat.
 * NOTE: collects the table — fine at small scale. Replace with a maintained
 * counter document if the archive ever grows large.
 */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const visible = await ctx.db
      .query("archives")
      .withIndex("by_status", (q) => q.eq("status", "visible"))
      .collect();
    return { total: visible.length };
  },
});

/** Create a new archive (post-upload). Returns its id + secret manage token. */
export const create = mutation({
  args: {
    category: categoryValidator,
    image: v.optional(imageValidator),
    text: v.optional(v.string()),
    company: v.optional(v.string()),
    caption: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Shared business validation (image-or-text, lengths) — same rules as the
    // client. Surface a readable, specific message instead of a raw ZodError.
    let input: ArchiveInputValues;
    try {
      input = archiveInputSchema.parse(args);
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        const field = issue?.path.join(".");
        throw new ConvexError(
          issue
            ? `${field ? `${field}: ` : ""}${issue.message}`
            : "That submission didn't pass validation.",
        );
      }
      throw err;
    }
    const manageToken = crypto.randomUUID();

    const id = await ctx.db.insert("archives", {
      ...input,
      reactions: 0,
      status: "visible",
      manageToken,
    });

    return { id, manageToken };
  },
});

/**
 * Delete an archive by its secret manage token (self-serve, no accounts).
 *
 * TRUST MODEL: server-to-server like the other trusted writes. `secret` proves
 * the call came from the Next `/api/manage/delete` route; the unguessable
 * `manageToken` (a random UUID handed to the submitter at create time) is the
 * capability that authorizes deleting THIS archive — possession is proof.
 *
 * Cascades: deletes the archive's reaction and report rows too, so nothing
 * dangles. Returns the stored image key (if any) so the route can delete the
 * actual file from UploadThing — deleting only the row would leave the
 * screenshot (often the PII) live on the CDN forever.
 */
export const removeByToken = mutation({
  args: { id: v.string(), manageToken: v.string(), secret: v.string() },
  handler: async (ctx, { id, manageToken, secret }) => {
    assertServerSecret(secret);

    const archiveId = ctx.db.normalizeId("archives", id);
    if (!archiveId) return { deleted: false as const, imageKey: null };

    const doc = await ctx.db.get(archiveId);
    // Constant-ish behaviour: a wrong/missing token is indistinguishable from a
    // missing archive to the caller.
    if (!doc || doc.manageToken !== manageToken) {
      return { deleted: false as const, imageKey: null };
    }

    // Cascade: reaction rows, then report rows, then the archive itself.
    const reactionRows = await ctx.db
      .query("reactions")
      .withIndex("by_archive_identity", (q) => q.eq("archiveId", archiveId))
      .collect();
    for (const row of reactionRows) await ctx.db.delete(row._id);

    const reportRows = await ctx.db
      .query("reports")
      .withIndex("by_archive", (q) => q.eq("archiveId", archiveId))
      .collect();
    for (const row of reportRows) await ctx.db.delete(row._id);

    const imageKey = doc.image?.key ?? null;
    await ctx.db.delete(archiveId);

    return { deleted: true as const, imageKey };
  },
});

/**
 * Admin: remove an archive from the wall (owner moderation).
 *
 * Owner-only — gated by CONVEX_ADMIN_SECRET (the Next admin route verifies the
 * signed admin cookie first). Soft delete: sets status:"removed" so the row
 * stays as an audit trail (unlike self-serve delete, which hard-deletes the
 * owner's own data). The wall already filters to status:"visible", so a removed
 * archive vanishes from the public view. Resolves the archive's open reports and
 * returns the image key so the route can delete the file from UploadThing.
 */
export const moderateRemove = mutation({
  args: { archiveId: v.id("archives"), secret: v.string() },
  handler: async (ctx, { archiveId, secret }) => {
    assertAdminSecret(secret);

    const doc = await ctx.db.get(archiveId);
    if (!doc) return { removed: false as const, imageKey: null };

    await ctx.db.patch(archiveId, { status: "removed" });

    // Resolve the reports that flagged it — they've been actioned.
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_archive", (q) => q.eq("archiveId", archiveId))
      .collect();
    for (const r of reports) {
      if (r.status === "open") await ctx.db.patch(r._id, { status: "resolved" });
    }

    return { removed: true as const, imageKey: doc.image?.key ?? null };
  },
});

/**
 * Admin: replace an archive's image with a moderator-redacted version.
 *
 * Owner-only — gated by CONVEX_ADMIN_SECRET. The Next route uploads the redacted
 * screenshot first (new UploadThing file) and passes the resulting image payload
 * here; we swap it onto the archive and return the OLD image key so the route can
 * delete the original file from UploadThing. Leaving the original live would keep
 * the un-redacted screenshot (the PII we're redacting) reachable on the CDN
 * forever, defeating the whole point. The redaction is silent — no status change,
 * no visible "edited" mark — so a clean post just quietly loses its leaked info.
 */
export const moderateReplaceImage = mutation({
  args: {
    archiveId: v.id("archives"),
    image: imageValidator,
    secret: v.string(),
  },
  handler: async (ctx, { archiveId, image, secret }) => {
    assertAdminSecret(secret);

    const doc = await ctx.db.get(archiveId);
    if (!doc) return { replaced: false as const, oldImageKey: null };

    const oldImageKey = doc.image?.key ?? null;
    await ctx.db.patch(archiveId, { image });

    return { replaced: true as const, oldImageKey };
  },
});
