/**
 * Metadata for an uploaded screenshot, returned by UploadThing and persisted
 * with the archive. Shared between the upload flow, Convex, and the UI.
 */
export type UploadPayload = {
  /** Public URL of the stored image. */
  url: string;
  /** UploadThing file key (used for deletion later). */
  key: string;
  /** Original file name. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** MIME type, e.g. "image/png". */
  type: string;
  /** Natural pixel width, if measured client-side before upload. */
  width?: number;
  /** Natural pixel height, if measured client-side before upload. */
  height?: number;
  /** Tiny base64 blur placeholder for lazy loading, if generated. */
  blurDataUrl?: string;
};
