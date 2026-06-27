import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Sharp file-tab / category chip — monospace caps. */
const badgeVariants = cva(
  "inline-flex items-center font-mono text-label-caps uppercase tracking-[0.1em] whitespace-nowrap",
  {
    variants: {
      variant: {
        outline: "border border-outline-variant text-on-surface-variant px-3 py-1",
        square:
          "border border-outline-variant text-on-surface-variant px-2 py-0.5 rounded-[2px]",
        solid: "bg-on-surface text-surface px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
