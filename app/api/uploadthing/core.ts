import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

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
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ files }) => {
      const file = files[0];
      if (file && !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        throw new UploadThingError("Use a PNG, JPG, or WebP image.");
      }
      if (file && file.size > MAX_IMAGE_BYTES) {
        throw new UploadThingError("Image must be 16MB or smaller.");
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => {
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
