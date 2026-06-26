"use client";

import { ErrorState } from "@/components/shared/error-state";

/** Route error boundary — renders the editorial "Unavailable." screen. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState reset={reset} />;
}
