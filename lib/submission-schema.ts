import { z } from "zod";

/**
 * Submission form schema. Image-primary: a screenshot OR pasted text is
 * required, everything else is optional. Used by the Compose form (RHF + zod).
 */
export const submissionSchema = z
  .object({
    image: z.instanceof(File).optional(),
    text: z.string().trim().max(2000).optional(),
    company: z.string().trim().max(80).optional(),
    category: z.enum([
      "job",
      "internship",
      "scholarship",
      "hackathon",
      "university",
      "other",
    ]),
    caption: z.string().trim().max(280).optional(),
    displayName: z.string().trim().max(40).optional(),
  })
  .refine((v) => Boolean(v.image) || Boolean(v.text && v.text.length > 0), {
    message: "Add a screenshot or paste the rejection text.",
    path: ["image"],
  });

export type SubmissionValues = z.infer<typeof submissionSchema>;
