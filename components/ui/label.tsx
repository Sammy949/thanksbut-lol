import * as React from "react";

import { cn } from "@/lib/utils";

/** Uppercase field label (sans — mono is reserved for actions/tags/time). */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-meta-data text-muted-type font-body tracking-wide uppercase",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
