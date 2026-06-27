import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Archive-board button: a heavy "stamp" box that depresses 2px when pressed.
 * Monospace label-caps text, sharp corners. Variant/size/shape keys are kept
 * stable so existing call sites compile during the redesign.
 */
const buttonVariants = cva(
  "btn-press inline-flex items-center justify-center gap-2 border font-mono text-label-caps tracking-[0.1em] uppercase whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-on-surface text-surface border-on-surface hover:bg-primary hover:border-primary",
        accent: "bg-primary text-on-primary border-primary hover:opacity-90",
        secondary:
          "bg-transparent text-on-surface border-on-surface hover:bg-surface-container-low",
        ghost:
          "border-transparent text-on-surface-variant shadow-none hover:text-primary hover:underline",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-14 px-8",
        pill: "px-6 py-2",
        icon: "size-10",
      },
      shape: {
        pill: "rounded-full",
        sheet: "rounded-[2px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "sheet",
    },
  },
);

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
