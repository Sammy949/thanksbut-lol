"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_FILTERS } from "@/constants/categories";
import type { ArchiveCategory } from "@/types/archive";

interface CategoryFiltersProps {
  value: ArchiveCategory | null;
  onChange: (value: ArchiveCategory | null) => void;
}

/** Horizontal, scrollable pill row. Active pill is solid ink-black. */
export function CategoryFilters({ value, onChange }: CategoryFiltersProps) {
  return (
    <div className="no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <div className="flex min-w-max gap-3">
        {CATEGORY_FILTERS.map((filter) => {
          const active = filter.value === value;
          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => onChange(filter.value)}
              aria-pressed={active}
              className={cn(
                "text-label-caps rounded-full border px-6 py-2 font-mono uppercase transition-colors",
                active
                  ? "bg-ink-black text-paper-white border-ink-black"
                  : "text-secondary border-outline-variant hover:bg-surface-variant hover:text-on-surface-variant",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
