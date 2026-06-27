/**
 * Core domain type for thanksbut.lol.
 *
 * An "archive" is a single submitted rejection. The screenshot is the hero
 * (image-primary); when there's no screenshot, the raw rejection `text` stands
 * in. Everything else (company, caption, display name) is optional metadata.
 *
 * This is the front-end shape only. The Convex backend is intentionally not
 * built yet; when it is, the persisted document should map onto this type.
 */

import type { UploadPayload } from "./upload";

/** Category of the thing the person was rejected from. */
export type ArchiveCategory =
  | "job"
  | "internship"
  | "scholarship"
  | "hackathon"
  | "university"
  | "other";

/** Decorative rubber-stamp shown on some cards. Purely cosmetic. */
export type ArchiveStamp = "REJECTED" | "GHOSTED";

export interface Archive {
  /** Stable unique id (Convex document id once the backend exists). */
  id: string;
  /** Category, used for the homepage filter row. */
  category: ArchiveCategory;
  /** Uploaded rejection screenshot — the hero of the card when present. */
  image?: string;
  /** Raw rejection text — the fallback hero when there's no screenshot. */
  text?: string;
  /** Optional company / organisation name (the card heading). */
  company?: string;
  /** Optional short caption written by the submitter. */
  caption?: string;
  /** Optional display name; archives are anonymous by default. */
  displayName?: string;
  /** Reaction count (the single 🥲 reaction). */
  reactions: number;
  /** Whether the current visitor has reacted (live data only; mock omits it). */
  reacted?: boolean;
  /** Creation timestamp, epoch milliseconds. */
  createdAt: number;
  /** Optional decorative stamp (REJECTED / GHOSTED). */
  stamp?: ArchiveStamp;
  /**
   * Anonymous browser identity (localStorage UUID) of the submitter.
   * Used later to dedupe reactions and recall drafts — never an account.
   */
  visitorId?: string;
}

/** Alias used by the UI/forms when "category" reads more naturally. */
export type Category = ArchiveCategory;

/** Persisted image shape (UploadThing metadata). */
export type ArchiveImage = UploadPayload;

/**
 * Shape returned by the Convex `archives.list` / `getById` queries to the UI.
 * Distinct from the legacy display `Archive` (string image) used by the current
 * mock — the presentation layer maps this once the redesign is wired.
 */
export interface ArchiveResponse {
  id: string;
  category: ArchiveCategory;
  image?: ArchiveImage;
  text?: string;
  company?: string;
  caption?: string;
  displayName?: string;
  stamp?: ArchiveStamp;
  reactions: number;
  /** Whether the current visitor has reacted (resolved per-request). */
  reacted: boolean;
  /** Creation time in epoch ms. */
  createdAt: number;
}

/** One page of archives from a paginated query. */
export interface ArchivePage {
  page: ArchiveResponse[];
  isDone: boolean;
  continueCursor: string;
}

/** Input accepted by the create-archive mutation (post-upload, no File). */
export type ArchiveInput = {
  category: ArchiveCategory;
  image?: ArchiveImage;
  text?: string;
  company?: string;
  caption?: string;
  displayName?: string;
};
