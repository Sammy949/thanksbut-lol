import type { ArchiveCategory } from "@/types/archive";

/** A selectable category with its human-facing label. */
export interface CategoryOption {
  value: ArchiveCategory;
  label: string;
}

/**
 * Categories offered when submitting an archive.
 * Order here is the order shown in the upload form.
 */
export const CATEGORIES: readonly CategoryOption[] = [
  { value: "job", label: "Job" },
  { value: "internship", label: "Internship" },
  { value: "scholarship", label: "Scholarship" },
  { value: "hackathon", label: "Hackathon" },
  { value: "university", label: "University" },
  { value: "other", label: "Other" },
] as const;

/**
 * Filter row shown above the wall. "All" is the default and has no category.
 * `null` means "no filter".
 */
export const CATEGORY_FILTERS: readonly {
  value: ArchiveCategory | null;
  label: string;
}[] = [
  { value: null, label: "All" },
  { value: "job", label: "Jobs" },
  { value: "internship", label: "Internships" },
  { value: "scholarship", label: "Scholarships" },
  { value: "hackathon", label: "Hackathons" },
  { value: "university", label: "Universities" },
] as const;
