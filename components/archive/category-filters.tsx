"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CATEGORY_FILTERS } from "@/constants/categories";
import type { ArchiveCategory } from "@/types/archive";

const ALL = "all";

interface CategoryFiltersProps {
  value: ArchiveCategory | null;
  onChange: (value: ArchiveCategory | null) => void;
}

/** Index-card filter tabs — monospace, the active one inked solid. */
export function CategoryFilters({ value, onChange }: CategoryFiltersProps) {
  return (
    <div className="no-scrollbar mx-auto -mb-px max-w-[1120px] overflow-x-auto px-5 md:px-16">
      <ToggleGroup
        type="single"
        value={value ?? ALL}
        onValueChange={(v) => {
          if (v) onChange(v === ALL ? null : (v as ArchiveCategory));
        }}
        className="border-outline-variant flex w-max gap-2 border-b"
      >
        {CATEGORY_FILTERS.map((filter) => (
          <ToggleGroupItem
            key={filter.label}
            value={filter.value ?? ALL}
            className="text-label-caps text-secondary hover:text-on-surface data-[state=on]:text-primary data-[state=on]:border-primary -mb-px shrink-0 border-b-2 border-transparent px-3 pb-2 font-mono whitespace-nowrap uppercase"
          >
            {filter.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
