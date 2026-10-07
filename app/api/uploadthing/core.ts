import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/lib/convex-api";

import { MAX_IMAGE_BYTES, ACCEPTED_IMAGE_TYPES } from "@/lib/validation";

const f = createUploadthing();

/**
 * UploadThing file router. One route: a single rejection screenshot.
 *
 * `onUploadComplete` returns the metadata the client needs to persist the
 * archive (shape matches `UploadPayload`). No auth — anonymous uploads — but
 * type/size are validated here and mirrored by the shared Zod schema.
 */
export const ourFileRouter = {
  archiveImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async ({ files }) => {
      if (!process.env.CONVEX_REACTION_SECRET)
        throw new UploadThingError("Uploads are temporarily unavailable.");
      const file = files[0];
      if (file && !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        throw new UploadThingError("Use a PNG, JPG, or WebP image.");
      }
      if (file && file.size > MAX_IMAGE_BYTES) {
        throw new UploadThingError("Image must be 8MB or smaller.");
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const secret = process.env.CONVEX_REACTION_SECRET;
      if (!secret) throw new UploadThingError("Uploads are temporarily unavailable.");
      // Unpublished uploads expire after 24 hours. Publication claims them atomically.
      await fetchMutation(api.cleanupJobs.trackUpload, { key: file.key, secret });
      // Returned to the client as the upload result (UploadPayload-shaped).
      return {
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
