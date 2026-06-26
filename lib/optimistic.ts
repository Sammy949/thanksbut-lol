import type { ArchiveResponse } from "@/types/archive";

/**
 * Pure helper for the optimistic 🥲 toggle. Given a list of archives and the id
 * being toggled, return a new list with that archive's `reacted` flipped and its
 * count adjusted. Used by the reaction mutation's optimistic update so the wall
 * responds instantly before the server confirms.
 */
export function togglePageReaction(
  page: ArchiveResponse[],
  archiveId: string,
): ArchiveResponse[] {
  return page.map((archive) => {
    if (archive.id !== archiveId) return archive;
    const reacted = !archive.reacted;
    return {
      ...archive,
      reacted,
      reactions: Math.max(0, archive.reactions + (reacted ? 1 : -1)),
    };
  });
}
