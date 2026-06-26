import * as React from "react";

import { cn } from "@/lib/utils";

/** Bordered-box textarea (rejection text fallback / longer fields). */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "text-body-md text-on-background placeholder:text-outline-variant border-gallery-gray focus:border-ink-black font-body w-full resize-none rounded-lg border bg-transparent p-3 transition-colors focus:ring-0 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
