import * as React from "react";

import { cn } from "@/lib/utils";

/** Underline-only input — the "ruled notebook" field from the design system. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "text-body-md text-on-background placeholder:text-outline-variant border-gallery-gray focus:border-ink-black font-body w-full border-0 border-b bg-transparent px-0 py-2 transition-colors focus:ring-0 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
