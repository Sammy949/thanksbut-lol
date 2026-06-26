import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Category chip / archival label — monospace caps, used on cards and filters. */
const badgeVariants = cva(
  "inline-flex items-center font-mono text-label-caps uppercase tracking-[0.1em] whitespace-nowrap",
  {
    variants: {
      variant: {
        outline:
          "border border-outline-variant/50 text-muted-type px-3 py-1 rounded-full",
        square: "border border-gallery-gray text-muted-type px-2 py-0.5 rounded-sm",
        solid: "bg-ink-black text-paper-white px-3 py-1 rounded-full",
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
