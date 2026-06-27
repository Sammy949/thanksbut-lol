import type { Archive, ArchiveResponse } from "@/types/archive";

/**
 * Adapt a Convex `ArchiveResponse` to the display `Archive` shape the existing
 * (locked) card/wall components already consume — image object → url string.
 * Lets us swap mock for live data without touching any presentation component.
 */
export function responseToArchive(r: ArchiveResponse): Archive {
  return {
    id: r.id,
    category: r.category,
    image: r.image?.url,
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
