import * as React from "react";

import { cn } from "@/lib/utils";

/** Sharp-bordered paper field for longer text. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "text-body-md text-on-surface placeholder:text-outline border-outline-variant focus:border-primary bg-surface-bright w-full resize-none rounded-[2px] border p-3 font-mono transition-colors focus:ring-0 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
