"use client";

import { useMutation } from "convex/react";

import { api } from "@/lib/convex-api";
import { useUploadThing } from "@/lib/uploadthing";
import { getImageDimensions, generateBlurDataUrl } from "@/lib/image";
import type { ArchiveImage } from "@/types/archive";

/**
 * Submission primitives, split so the screenshot can be uploaded eagerly (in the
 * background, right after the editor) and the archive created later — instead of
 * doing both on the final tap. `uploadImage` resolves to the persisted image
 * payload; `createArchive` is the Convex mutation.
 */
export function useArchiveSubmission() {
  const createArchive = useMutation(api.archives.create);
  const { startUpload } = useUploadThing("archiveImage");

  const uploadImage = async (file: File): Promise<ArchiveImage> => {
    const [dims, blurDataUrl, uploaded] = await Promise.all([
      getImageDimensions(file).catch(() => undefined),
      generateBlurDataUrl(file).catch(() => null),
      startUpload([file]),
    ]);

    const result = uploaded?.[0];
    if (!result) throw new Error("Upload failed — no file came back from UploadThing.");

    const url = result.ufsUrl ?? result.url ?? result.serverData?.url;
    if (!url) throw new Error("Upload finished but returned no file URL.");

    // Only include optional fields when defined — Convex rejects explicit undefined.
    return {
      url,
      key: result.key,
      name: result.name,
      size: result.size,
      type: result.type,
      ...(dims?.width ? { width: dims.width } : {}),
      ...(dims?.height ? { height: dims.height } : {}),
      ...(blurDataUrl ? { blurDataUrl } : {}),
    };
  };

  return { uploadImage, createArchive };
}
