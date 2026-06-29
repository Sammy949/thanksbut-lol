"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CATEGORY_FILTERS } from "@/constants/categories";
import type { ArchiveCategory } from "@/types/archive";

const ALL = "all";

interface CategoryFiltersProps {
  value: ArchiveCategory | null;
  onChange: (value: ArchiveCategory | null) => void;
}

/**
 * Index-card filter tabs — monospace, the active one inked solid.
 *
 * Layout: padding lives on the outer rail; the inner element is the *only*
 * horizontal scroll container, holding a `w-max` row of non-shrinking tabs so
 * it overflows and scrolls on narrow screens. A right-edge fade (mobile only)
 * signals there's more to swipe to, since the scrollbar itself is hidden.
 */
export function CategoryFilters({ value, onChange }: CategoryFiltersProps) {
  return (
    <div className="relative mx-auto -mb-px w-full max-w-[1120px] px-5 md:px-16">
      <div className="no-scrollbar overflow-x-auto overflow-y-hidden overscroll-x-contain">
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

      {/* "More this way" hint — the strip scrolls but its scrollbar is hidden. */}
      <div
        aria-hidden
        className="from-background pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent md:hidden"
      />
    </div>
  );
}
