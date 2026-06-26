/**
 * Core domain type for thanksbut.lol.
 *
 * An "archive" is a single submitted rejection. The screenshot is the hero —
 * everything else (company, caption, display name) is optional metadata.
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

export interface Archive {
  /** Stable unique id (Convex document id once the backend exists). */
  id: string;
  /** URL of the uploaded rejection screenshot — the hero of every card. */
  image: string;
  /** Category, used for the homepage filter row. */
  category: ArchiveCategory;
  /** Optional company / organisation name. */
  company?: string;
  /** Optional short caption written by the submitter. */
  caption?: string;
  /** Optional display name; archives are anonymous by default. */
  displayName?: string;
  /** Reaction count (the single "laughs" reaction). */
  laughs: number;
  /** Creation timestamp, epoch milliseconds. */
  createdAt: number;
  /**
   * Anonymous browser identity (localStorage UUID) of the submitter.
   * Used later to dedupe reactions and recall drafts — never an account.
   */
  visitorId?: string;
}
