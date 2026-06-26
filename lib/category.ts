import { CATEGORIES, CATEGORY_LABELS } from "@/constants/categories";
import type { ArchiveCategory } from "@/types/archive";

export { CATEGORIES, CATEGORY_LABELS };

/** Display label for a category value, e.g. "job" -> "Job". */
export function categoryLabel(category: ArchiveCategory): string {
  return CATEGORY_LABELS[category];
}

/** Type guard: is an arbitrary string a known category? */
export function isCategory(value: string): value is ArchiveCategory {
  return CATEGORIES.some((c) => c.value === value);
}
