"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { deleteUploadedFiles } from "../lib/uploadthing-admin";

export const run = internalAction({
  args: { id: v.id("fileCleanup") },
  handler: async (ctx, { id }): Promise<void> => {
    const job = await ctx.runQuery(internal.cleanupJobs.get, { id });
    if (!job || job.expired) return;
    const success = await deleteUploadedFiles(job.key);
    await ctx.runMutation(internal.cleanupJobs.record, { id, success });
  },
});
