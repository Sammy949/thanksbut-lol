"use client";

import { Button } from "@/components/ui/button";
import { CATEGORY_FILTERS } from "@/constants/categories";

/**
 * Horizontal category filter row above the wall. Placeholder — selection state
 * and wall filtering are wired later. Client component because it will be
 * interactive.
 */
export function CategoryFilters() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {CATEGORY_FILTERS.map((filter) => (
        <Button key={filter.label} variant="outline" size="sm">
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
