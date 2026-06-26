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
