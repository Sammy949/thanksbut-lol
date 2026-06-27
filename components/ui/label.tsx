import * as React from "react";

import { cn } from "@/lib/utils";

/** Monospace, uppercase field label — "label-maker" tape on a filing system. */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-label-caps text-on-surface font-mono tracking-[0.1em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
