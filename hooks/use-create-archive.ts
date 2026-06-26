"use client";

import { useMutation } from "convex/react";

import { api } from "@/lib/convex-api";
import { useUploadThing } from "@/lib/uploadthing";
import { getImageDimensions, generateBlurDataUrl } from "@/lib/image";
import type { ArchiveCategory, ArchiveImage } from "@/types/archive";

export interface CreateArchiveArgs {
  category: ArchiveCategory;
  /** Optional screenshot — uploaded to UploadThing, then persisted. */
  file?: File;
  text?: string;
  company?: string;
  caption?: string;
  displayName?: string;
}

/**
 * End-to-end submission: upload the screenshot (measuring dimensions + a blur
 * placeholder in parallel), then create the archive. Returns the new id +
 * manage token.
 */
export function useCreateArchive() {
  const create = useMutation(api.archives.create);
  const { startUpload } = useUploadThing("archiveImage");

  return async ({ file, ...rest }: CreateArchiveArgs) => {
    let image: ArchiveImage | undefined;

    if (file) {
      const [dims, blurDataUrl, uploaded] = await Promise.all([
        getImageDimensions(file).catch(() => undefined),
        generateBlurDataUrl(file).catch(() => null),
        startUpload([file]),
      ]);

      const result = uploaded?.[0];
      if (!result) throw new Error("Image upload failed.");

      image = {
        url: result.serverData.url,
        key: result.serverData.key,
        name: result.serverData.name,
        size: result.serverData.size,
        type: result.serverData.type,
        width: dims?.width,
        height: dims?.height,
        blurDataUrl: blurDataUrl ?? undefined,
      };
    }

    return create({ ...rest, image });
  };
}
