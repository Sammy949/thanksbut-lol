"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CATEGORY_FILTERS } from "@/constants/categories";
import type { ArchiveCategory } from "@/types/archive";

const ALL = "all";

interface CategoryFiltersProps {
  value: ArchiveCategory | null;
  onChange: (value: ArchiveCategory | null) => void;
}

/** Horizontal, scrollable pill row (shadcn ToggleGroup, single-select). */
export function CategoryFilters({ value, onChange }: CategoryFiltersProps) {
  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ToggleGroup
        type="single"
        value={value ?? ALL}
        onValueChange={(v) => {
          // Radix returns "" when deselecting the active item — keep one active.
          if (v) onChange(v === ALL ? null : (v as ArchiveCategory));
        }}
        className="min-w-max gap-3"
      >
        {CATEGORY_FILTERS.map((filter) => (
          <ToggleGroupItem
            key={filter.label}
            value={filter.value ?? ALL}
            className="text-label-caps text-secondary border-outline-variant hover:bg-surface-variant hover:text-on-surface-variant data-[state=on]:bg-ink-black data-[state=on]:text-paper-white data-[state=on]:border-ink-black rounded-full border px-6 py-2 font-mono uppercase"
          >
            {filter.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
