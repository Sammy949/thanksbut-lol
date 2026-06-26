import { internalMutation } from "./_generated/server";

/**
 * Seed the archive with a few sample rejections so the wall isn't empty right
 * after `npx convex dev`. Run once via the Convex dashboard or
 * `npx convex run seed:run`. No-op if archives already exist.
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("archives").first();
    if (existing) return { inserted: 0 };

    const samples = [
      {
        company: "Big Tech Co",
        category: "job" as const,
        text: "While we were impressed with your background, we have decided to move forward with a candidate whose experience more closely aligns with our current needs.",
        stamp: "REJECTED" as const,
      },
      {
        company: "Cool Startup",
        category: "internship" as const,
        text: "We received a record number of applications this year. Unfortunately, we cannot offer you a position for the summer cohort.",
        caption: "Thought I had this one 🥲",
      },
      {
        company: "Ivy League U",
        category: "university" as const,
        text: "The Admissions Committee has carefully reviewed your application, and I am sorry to inform you that we are unable to offer you a place in this year's class.",
        stamp: "GHOSTED" as const,
      },
      {
        company: "The Grant Council",
        category: "scholarship" as const,
        text: "After careful deliberation, the committee has chosen not to fund your proposal in this cycle.",
        displayName: "still trying",
      },
    ];

    for (const sample of samples) {
      await ctx.db.insert("archives", {
        ...sample,
        reactions: 0,
        status: "visible",
        manageToken: crypto.randomUUID(),
      });
    }

    return { inserted: samples.length };
  },
});
