import type { Doc } from "../_generated/dataModel";
import type { ArchiveResponse } from "../../types/archive";

/** Map a stored archive document to the API response shape sent to the UI. */
export function serializeArchive(
  doc: Doc<"archives">,
  reacted: boolean,
): ArchiveResponse {
  return {
    id: doc._id,
    category: doc.category,
    image: doc.image,
    text: doc.text,
    company: doc.company,
    caption: doc.caption,
    displayName: doc.displayName,
    stamp: doc.stamp,
    reactions: doc.reactions,
    reacted,
    createdAt: doc._creationTime,
  };
}
