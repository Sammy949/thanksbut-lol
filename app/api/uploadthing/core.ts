import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

/**
 * UploadThing file router.
 *
 * One route: a single rejection screenshot, the hero of every archive.
 * Persistence is intentionally NOT wired yet — `onUploadComplete` just returns
 * the file URL. When the Convex backend exists, create the Archive document here.
 */
export const ourFileRouter = {
  archiveImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } }).onUploadComplete(
    async ({ file }) => {
      return { url: file.ufsUrl };
    },
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
