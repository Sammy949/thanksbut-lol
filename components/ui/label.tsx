import * as React from "react";

import { cn } from "@/lib/utils";

/** Monospace, uppercase field label — the "archival filing" metaphor. */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-meta-data text-muted-type font-mono tracking-wide uppercase",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
