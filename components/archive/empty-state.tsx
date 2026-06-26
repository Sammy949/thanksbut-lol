"use client";

import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubmissionDrawer } from "@/components/upload/submission-context";

/** "The archive is quiet… for now." — shown when there are no archives to show. */
export function EmptyState() {
  const { openDrawer } = useSubmissionDrawer();

  return (
    <div className="border-outline-variant/60 relative flex flex-col items-center gap-6 rounded-[1.5rem] border border-dashed px-6 py-20 text-center">
      <Badge variant="square" className="absolute top-6 right-6">
        Collection: Empty
      </Badge>

      <Inbox className="text-outline size-8" strokeWidth={1.5} />

      <h2 className="text-headline-lg-mobile md:text-headline-lg text-ink-black font-display max-w-xl">
        The archive is quiet… for now.
      </h2>
      <p className="text-body-md text-on-surface-variant font-body max-w-md">
        The exhibition space awaits its first artifact. Curate your most spectacular
        rejection and enshrine it in the permanent collection.
      </p>

      <Button size="lg" onClick={openDrawer}>
        Archive Yours
      </Button>
    </div>
  );
}
