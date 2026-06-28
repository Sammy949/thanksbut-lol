import { v } from "convex/values";

import { mutation, internalMutation } from "./_generated/server";
import { resolveIdentity, assertReactionSecret } from "./lib/identity";

/**
 * Toggle the single 🥲 reaction for the calling identity on an archive.
 *
 * TRUST MODEL: this is the only path that may change a reaction count, and it
 * runs server-to-server. The `sessionId` is recovered from an HMAC-signed
 * httpOnly cookie by the Next `/api/react` route; `secret` proves the call came
 * from that route and not a forged browser request. Together they make the
 * count un-inflatable — a caller can no longer mint fresh identities at will.
 *
 * One *active* reaction per identity (enforced by by_archive_identity). The
 * denormalised `archive.reactions` is kept in step here and is treated as a
 * cache of `count(reactions where archiveId)` — `reconcile` can rebuild it.
 */
export const toggle = mutation({
  args: {
    archiveId: v.id("archives"),
    sessionId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { archiveId, sessionId, secret }) => {
    assertReactionSecret(secret);

    const archive = await ctx.db.get(archiveId);
    if (!archive) throw new Error("Archive not found");

    const identity = await resolveIdentity(ctx, sessionId);
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_archive_identity", (q) =>
        q.eq("archiveId", archiveId).eq("identity", identity),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      const reactions = Math.max(0, archive.reactions - 1);
      await ctx.db.patch(archiveId, { reactions });
      return { reacted: false, reactions };
    }

    await ctx.db.insert("reactions", { archiveId, identity });
    const reactions = archive.reactions + 1;
    await ctx.db.patch(archiveId, { reactions });
    return { reacted: true, reactions };
  },
});

/**
 * Rebuild an archive's denormalised count from the source-of-truth rows.
 * Run after the trust fix to drop any drift. Admin/maintenance only — invoke
 * from the Convex dashboard or CLI (`convex run reactions:reconcile '{}'`).
 */
export const reconcile = internalMutation({
  args: { archiveId: v.optional(v.id("archives")) },
  handler: async (ctx, { archiveId }) => {
    const archives = archiveId
      ? [await ctx.db.get(archiveId)].filter((a) => a !== null)
      : await ctx.db.query("archives").collect();

    let fixed = 0;
    for (const archive of archives) {
      const rows = await ctx.db
        .query("reactions")
        .withIndex("by_archive_identity", (q) => q.eq("archiveId", archive._id))
        .collect();
      if (archive.reactions !== rows.length) {
        await ctx.db.patch(archive._id, { reactions: rows.length });
        fixed++;
      }
    }
    return { scanned: archives.length, fixed };
  },
});

/**
 * One-time cleanup for an archive whose count was inflated by the
 * forged-identity attack. The junk reaction rows carry fabricated
 * `visitor:<uuid>` identities indistinguishable from the ~2 legitimate ones, so
 * the honest move is a full reset: delete every reaction row for the archive and
 * zero the count. Legitimate reactors simply react again under a trusted session.
 * Admin only (`convex run reactions:purge '{"archiveId":"..."}'`).
 */
export const purge = internalMutation({
  args: { archiveId: v.id("archives") },
  handler: async (ctx, { archiveId }) => {
    const rows = await ctx.db
      .query("reactions")
      .withIndex("by_archive_identity", (q) => q.eq("archiveId", archiveId))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
    await ctx.db.patch(archiveId, { reactions: 0 });
    return { deleted: rows.length };
  },
});
