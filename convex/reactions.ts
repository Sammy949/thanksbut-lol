import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { resolveIdentity } from "./lib/identity";

/**
 * Toggle the single 🥲 reaction for the calling identity on an archive.
 * One reaction per identity (enforced by the by_archive_identity index).
 * Returns the new state so the client can reconcile its optimistic update.
 */
export const toggle = mutation({
  args: { archiveId: v.id("archives"), visitorId: v.string() },
  handler: async (ctx, { archiveId, visitorId }) => {
    const archive = await ctx.db.get(archiveId);
    if (!archive) throw new Error("Archive not found");

    const identity = await resolveIdentity(ctx, visitorId);
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
