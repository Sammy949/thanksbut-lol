import * as React from "react";

import { cn } from "@/lib/utils";

/** Ruled-notebook input — bottom border only, ink underline on focus. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "text-body-md text-on-surface placeholder:text-outline border-outline-variant focus:border-primary w-full border-0 border-b-2 bg-transparent px-0 py-2 font-mono transition-colors focus:ring-0 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
