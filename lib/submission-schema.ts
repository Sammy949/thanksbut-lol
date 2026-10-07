import { z } from "zod";

import {
  categorySchema,
  MAX_IMAGE_BYTES,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/validation";

/**
 * Browser-only submission form schema (uses the File type). Builds on the
 * shared `categorySchema` from `validation.ts`; the post-upload persisted shape
 * is `archiveInputSchema` there. Image-primary: a screenshot OR text is required.
 */
export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_IMAGE_BYTES, "Choose an image of 8MB or smaller.")
  .refine(
    (f) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type),
    "Choose a PNG, JPG, or WebP image.",
  );

export const submissionSchema = z
  .object({
    image: imageFileSchema.optional(),
    text: z
      .string()
      .trim()
      .max(2000, "Keep rejection text to 2,000 characters or fewer.")
      .optional(),
    company: z
      .string()
      .trim()
      .max(80, "Keep the organisation name to 80 characters or fewer.")
      .optional(),
    category: categorySchema,
    caption: z
      .string()
      .trim()
      .max(280, "Keep the caption to 280 characters or fewer.")
      .optional(),
    displayName: z
      .string()
      .trim()
      .max(40, "Keep the display name to 40 characters or fewer.")
      .optional(),
  })
  .refine((v) => Boolean(v.image) || Boolean(v.text), {
    message: "Add a screenshot or paste the rejection text.",
    path: ["text"],
  });
export type SubmissionValues = z.infer<typeof submissionSchema>;
