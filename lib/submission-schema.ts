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
export const submissionSchema = z
  .object({
    image: z
      .instanceof(File)
      .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image must be 8MB or smaller.")
      .refine(
        (f) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type),
        "Use a PNG, JPG, or WebP image.",
      )
      .optional(),
    text: z.string().trim().max(2000).optional(),
    company: z.string().trim().max(80).optional(),
    category: categorySchema,
    caption: z.string().trim().max(280).optional(),
    displayName: z.string().trim().max(40).optional(),
  })
  .refine((v) => Boolean(v.image) || Boolean(v.text && v.text.length > 0), {
    message: "Add a screenshot or paste the rejection text.",
    path: ["image"],
  });

export type SubmissionValues = z.infer<typeof submissionSchema>;
