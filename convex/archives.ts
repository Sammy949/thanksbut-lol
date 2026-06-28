import { paginationOptsValidator } from "convex/server";
import { v, ConvexError } from "convex/values";
import { ZodError } from "zod";

import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { categoryValidator, imageValidator } from "./schema";
import { serializeArchive } from "./lib/serialize";
import { resolveIdentity } from "./lib/identity";
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

/** Single archive by id (or null if missing/removed). */
export const getById = query({
  args: { id: v.id("archives"), sessionId: v.optional(v.string()) },
  handler: async (ctx, { id, sessionId }) => {
    const doc = await ctx.db.get(id);
    if (!doc || doc.status !== "visible") return null;
    return serializeArchive(doc, await hasReacted(ctx, id, sessionId));
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
