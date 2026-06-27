import { z } from "zod";

/**
 * Shared validation, safe to import from BOTH the browser and Convex.
 * Deliberately contains no browser-only types (e.g. File) so the Convex runtime
 * can import it. The File-based form schema lives in `submission-schema.ts`.
 */

export const MAX_IMAGE_BYTES = 16 * 1024 * 1024; // 16MB (originals shrink client-side before upload)
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export const categorySchema = z.enum([
  "job",
  "internship",
  "scholarship",
  "hackathon",
  "university",
  "other",
]);

export const reportReasonSchema = z.enum(["spam", "pii", "harassment", "other"]);

export const stampSchema = z.enum(["REJECTED", "GHOSTED"]);

/** UploadThing metadata, validated before persistence. */
export const uploadPayloadSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  name: z.string(),
  size: z.number().int().nonnegative().max(MAX_IMAGE_BYTES),
  type: z
    .string()
    .refine((t) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(t), {
      message: "Unsupported image type.",
    }),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  blurDataUrl: z.string().optional(),
});

/**
 * The persisted archive input (post-upload). Requires an image OR text.
 * Used by the Convex create mutation and reusable on the client after upload.
 */
export const archiveInputSchema = z
  .object({
    category: categorySchema,
    image: uploadPayloadSchema.optional(),
    text: z.string().trim().max(2000).optional(),
    company: z.string().trim().max(80).optional(),
    caption: z.string().trim().max(280).optional(),
    displayName: z.string().trim().max(40).optional(),
  })
  .refine((v) => Boolean(v.image) || Boolean(v.text && v.text.length > 0), {
    message: "An archive needs a screenshot or some text.",
    path: ["image"],
  });

export type ArchiveInputValues = z.infer<typeof archiveInputSchema>;

/** Report submission. */
export const reportSchema = z.object({
  archiveId: z.string().min(1),
  reason: reportReasonSchema,
});

export type ReportValues = z.infer<typeof reportSchema>;
