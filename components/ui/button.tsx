import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Editorial button. Defaults to the design's primary action: a solid ink-black
 * pill with monospace label-caps text. Variants cover the secondary "ghost
 * outline" and the accent (rejection-red / salmon) used on success screens.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-label-caps tracking-[0.1em] uppercase transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-black text-paper-white hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
        secondary:
          "border border-ink-black text-ink-black hover:bg-surface-container-low",
        accent: "bg-primary text-on-primary hover:opacity-90",
        ghost: "text-on-surface-variant hover:text-ink-black",
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
        sheet: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "pill",
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
