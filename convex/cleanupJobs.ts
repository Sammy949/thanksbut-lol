import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { assertAdminSecret, assertServerSecret } from "./lib/identity";
import type { Id } from "./_generated/dataModel";

/** Created in the same transaction as removal/replacement, before keys are lost. */
export async function enqueueCleanup(
  ctx: MutationCtx,
  key: string,
): Promise<Id<"fileCleanup">> {
  const existing = await ctx.db
    .query("fileCleanup")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (existing) {
    await ctx.db.patch(existing._id, {
      purpose: "removed",
      nextAttemptAt: Date.now() + 300_000,
    });
    return existing._id;
  }
  return await ctx.db.insert("fileCleanup", {
    key,
    attempts: 0,
    purpose: "removed",
    nextAttemptAt: Date.now() + 300_000,
  });
}

export const trackUpload = mutation({
  args: { key: v.string(), secret: v.string() },
  handler: async (ctx, { key, secret }) => {
    assertServerSecret(secret);
    const existing = await ctx.db
      .query("fileCleanup")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (!existing)
      await ctx.db.insert("fileCleanup", {
        key,
        purpose: "unpublished",
        attempts: 0,
        nextAttemptAt: Date.now() + 86_400_000,
      });
  },
});

export async function claimUpload(ctx: MutationCtx, key: string) {
  const job = await ctx.db
    .query("fileCleanup")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (job?.purpose === "removed")
    throw new ConvexError(
      "This screenshot upload has expired. Choose the image again.",
    );
  if (job?.purpose === "unpublished") {
    if (job.cleanupStarted || job.expired || job.nextAttemptAt <= Date.now())
      throw new ConvexError(
        "This screenshot upload has expired. Choose the image again.",
      );
    await ctx.db.delete(job._id);
  }
}

export const get = internalQuery({
  args: { id: v.id("fileCleanup") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

export const record = internalMutation({
  args: { id: v.id("fileCleanup"), success: v.boolean() },
  handler: async (ctx, { id, success }) => {
    const job = await ctx.db.get(id);
    if (!job) return;
    if (success) {
      if (job.purpose === "unpublished")
        await ctx.db.patch(id, {
          expired: true,
          nextAttemptAt: Number.MAX_SAFE_INTEGER,
        });
      else await ctx.db.delete(id);
      return;
    }
    const attempts = job.attempts + 1;
    await ctx.db.patch(id, {
      attempts,
      nextAttemptAt:
        Date.now() + Math.min(86_400_000, 300_000 * 2 ** Math.min(attempts, 9)),
    });
  },
});

/** Next can acknowledge a confirmed delete; failed/ambiguous calls retain the job. */
export const confirm = mutation({
  args: { id: v.id("fileCleanup"), secret: v.string(), admin: v.boolean() },
  handler: async (ctx, { id, secret, admin }) => {
    if (admin) assertAdminSecret(secret);
    else assertServerSecret(secret);
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});

export const retryDue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("fileCleanup")
      .withIndex("by_attempt", (q) => q.lte("nextAttemptAt", Date.now()))
      .take(20);
    for (const job of jobs) {
      // A lease also makes an interrupted action retryable on the next cron pass.
      await ctx.db.patch(job._id, {
        nextAttemptAt: Date.now() + 300_000,
        cleanupStarted: true,
      });
      await ctx.scheduler.runAfter(0, internal.uploadCleanup.run, { id: job._id });
    }
  },
});

export const pendingCount = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    assertAdminSecret(secret);
    const jobs = await ctx.db
      .query("fileCleanup")
      .filter((q) => q.eq(q.field("purpose"), "removed"))
      .take(101);
    return { count: Math.min(jobs.length, 100), more: jobs.length > 100 };
  },
});
