import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";

const modules = {
  "../convex/_generated/server.js": () => import("../convex/_generated/server.js"),
  "../convex/archives.ts": () => import("../convex/archives"),
  "../convex/cleanupJobs.ts": () => import("../convex/cleanupJobs"),
  "../convex/uploadCleanup.ts": () => import("../convex/uploadCleanup"),
};
const image = {
  key: "test-screenshot",
  url: "https://example.com/screenshot.jpg",
  name: "screenshot.jpg",
  size: 10,
  type: "image/jpeg",
};
const serverSecret = "test-server-secret";
const adminSecret = "test-admin-secret";
const previous = {
  server: process.env.CONVEX_REACTION_SECRET,
  admin: process.env.CONVEX_ADMIN_SECRET,
};
before(() => {
  process.env.CONVEX_REACTION_SECRET = serverSecret;
  process.env.CONVEX_ADMIN_SECRET = adminSecret;
});
after(() => {
  if (previous.server === undefined) delete process.env.CONVEX_REACTION_SECRET;
  else process.env.CONVEX_REACTION_SECRET = previous.server;
  if (previous.admin === undefined) delete process.env.CONVEX_ADMIN_SECRET;
  else process.env.CONVEX_ADMIN_SECRET = previous.admin;
});

test("post deletion retains the screenshot key in a durable job and requires the private link", async () => {
  const t = convexTest(schema, modules);
  const post = await t.mutation(api.archives.create, { category: "job", image });
  const denied = await t.mutation(api.archives.removeByToken, {
    id: post.id,
    manageToken: "wrong",
    secret: serverSecret,
  });
  assert.equal(denied.deleted, false);
  assert.equal(
    await t.run((ctx) => ctx.db.query("fileCleanup").collect()).then((a) => a.length),
    0,
  );
  const result = await t.mutation(api.archives.removeByToken, {
    ...post,
    secret: serverSecret,
  });
  assert.equal(result.deleted, true);
  assert.ok(result.cleanupId);
  assert.equal(await t.query(api.archives.getById, { id: post.id }), null);
  const job = await t.query(internal.cleanupJobs.get, { id: result.cleanupId });
  assert.equal(job?.key, image.key);
  await t.mutation(internal.cleanupJobs.record, {
    id: result.cleanupId,
    success: false,
  });
  const retry = await t.query(internal.cleanupJobs.get, { id: result.cleanupId });
  assert.equal(retry?.attempts, 1);
  assert.ok(retry!.nextAttemptAt > job!.nextAttemptAt);
  await t.mutation(internal.cleanupJobs.record, {
    id: result.cleanupId,
    success: true,
  });
  assert.equal(await t.query(internal.cleanupJobs.get, { id: result.cleanupId }), null);
});

test("redaction queues the original, claims the replacement, and refuses removed posts", async () => {
  const t = convexTest(schema, modules);
  const post = await t.mutation(api.archives.create, { category: "job", image });
  const replacement = {
    ...image,
    key: "test-redacted",
    url: "https://example.com/redacted.jpg",
  };
  await t.mutation(api.cleanupJobs.trackUpload, {
    key: replacement.key,
    secret: serverSecret,
  });
  const result = await t.mutation(api.archives.moderateReplaceImage, {
    archiveId: post.id,
    image: replacement,
    secret: adminSecret,
  });
  assert.equal(result.replaced, true);
  assert.equal(result.oldImageKey, image.key);
  const jobs = await t.run((ctx) => ctx.db.query("fileCleanup").collect());
  assert.deepEqual(
    jobs.map((j) => j.key),
    [image.key],
  );
  await t.mutation(api.archives.moderateRemove, {
    archiveId: post.id,
    secret: adminSecret,
  });
  assert.equal(
    (
      await t.mutation(api.archives.moderateReplaceImage, {
        archiveId: post.id,
        image,
        secret: adminSecret,
      })
    ).replaced,
    false,
  );
});

test("publication claims an upload; expired uploads cannot race cleanup into a new post", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.cleanupJobs.trackUpload, {
    key: image.key,
    secret: serverSecret,
  });
  await t.mutation(api.archives.create, { category: "job", image });
  assert.equal((await t.run((ctx) => ctx.db.query("fileCleanup").collect())).length, 0);
  await t.mutation(api.cleanupJobs.trackUpload, {
    key: "expired",
    secret: serverSecret,
  });
  const id = await t.run(async (ctx) => {
    const job = await ctx.db.query("fileCleanup").first();
    await ctx.db.patch(job!._id, { cleanupStarted: true });
    return job!._id;
  });
  await assert.rejects(
    t.mutation(api.archives.create, {
      category: "job",
      image: { ...image, key: "expired" },
    }),
    /expired/,
  );
  await t.mutation(internal.cleanupJobs.record, { id, success: true });
  await assert.rejects(
    t.mutation(api.archives.create, {
      category: "job",
      image: { ...image, key: "expired" },
    }),
    /expired/,
  );
  assert.equal(
    (await t.query(api.cleanupJobs.pendingCount, { secret: adminSecret })).count,
    0,
  );
});

test("cleanup acknowledgements and upload tracking reject untrusted calls", async () => {
  const t = convexTest(schema, modules);
  await assert.rejects(
    t.mutation(api.cleanupJobs.trackUpload, { key: image.key, secret: "wrong" }),
    /Unauthorized/,
  );
  await t.mutation(api.cleanupJobs.trackUpload, {
    key: image.key,
    secret: serverSecret,
  });
  const job = (await t.run((ctx) => ctx.db.query("fileCleanup").collect()))[0];
  await assert.rejects(
    t.mutation(api.cleanupJobs.confirm, {
      id: job._id,
      secret: serverSecret,
      admin: true,
    }),
    /Unauthorized/,
  );
  await t.mutation(api.cleanupJobs.confirm, {
    id: job._id,
    secret: adminSecret,
    admin: true,
  });
});
