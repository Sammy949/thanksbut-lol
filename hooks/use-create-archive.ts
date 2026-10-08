"use client";

import { useMutation } from "convex/react";

import { api } from "@/lib/convex-api";
import { useUploadThing } from "@/lib/uploadthing";
import { prepareArchiveImage } from "@/lib/image";
import type { ArchiveImage } from "@/types/archive";

/**
 * Submission primitives. The drawer uploads the prepared screenshot only on
 * Archive Yours, then publishes it. Admin redaction also uses uploadImage.
 */
export function useArchiveSubmission() {
  const createArchive = useMutation(api.archives.create);
  const { startUpload } = useUploadThing("archiveImage");

  const uploadImage = async (file: File): Promise<ArchiveImage> => {
    const [metadata, uploaded] = await Promise.all([
      prepareArchiveImage(file).catch(() => ({})),
      startUpload([file]),
    ]);

    const result = uploaded?.[0];
    if (!result)
      throw new Error(
        "Couldn’t upload your screenshot. Check your connection and try again.",
      );

    const url = result.ufsUrl ?? result.url ?? result.serverData?.url;
    if (!url) throw new Error("Couldn’t confirm your screenshot upload. Try again.");

    // Only include optional fields when defined — Convex rejects explicit undefined.
    return {
      url,
      key: result.key,
      name: result.name,
      size: result.size,
      type: result.type,
      ...metadata,
    };
  };

  return { uploadImage, createArchive };
}
