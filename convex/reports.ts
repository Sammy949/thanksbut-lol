import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { reportReasonValidator } from "./schema";

/**
 * File a report against an archive. Post-moderation: the archive stays visible
 * until an admin acts on the open report.
 */
export const create = mutation({
  args: {
    archiveId: v.id("archives"),
    reason: reportReasonValidator,
    visitorId: v.optional(v.string()),
  },
  handler: async (ctx, { archiveId, reason, visitorId }) => {
    const archive = await ctx.db.get(archiveId);
    if (!archive) throw new Error("Archive not found");

    await ctx.db.insert("reports", {
      archiveId,
      reason,
      visitorId,
      status: "open",
    });

    return { ok: true as const };
  },
});
