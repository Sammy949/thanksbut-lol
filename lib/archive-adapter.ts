import type { Archive, ArchiveResponse } from "@/types/archive";

/**
 * Adapt a Convex `ArchiveResponse` to the display `Archive` shape the existing
 * card/wall components consume: image URL plus dimensions and inline preview.
 * Older entries and text-only submissions can omit image metadata.
 */
export function responseToArchive(r: ArchiveResponse): Archive {
  return {
    id: r.id,
    category: r.category,
    image: r.image?.url,
    imageWidth: r.image?.width,
    imageHeight: r.image?.height,
    blurDataUrl: r.image?.blurDataUrl,
    text: r.text,
    company: r.company,
    caption: r.caption,
    displayName: r.displayName,
    stamp: r.stamp,
    reactions: r.reactions,
    reacted: r.reacted,
    createdAt: r.createdAt,
  };
}
