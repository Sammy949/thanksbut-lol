"use client";

import { Button } from "@/components/ui/button";
import { SITE } from "@/constants/site";
import { Stats } from "@/components/shared/stats";
import { useSubmissionDrawer } from "@/components/upload/submission-context";

/** Editorial hero — oversized serif headline, subtitle, CTA + archive count. */
export function Hero({ count }: { count: number }) {
  const { openDrawer } = useSubmissionDrawer();

  return (
    <header className="flex flex-col items-center gap-6 py-12 text-center md:items-start md:py-16 md:text-left">
      <h1 className="text-headline-lg-mobile md:text-display-hero text-ink-black font-display">
        {SITE.tagline}
      </h1>
      <p className="text-body-lg text-on-surface-variant font-body max-w-2xl">
        The internet&apos;s archive of rejection emails. We treat the &ldquo;we&apos;ve
        decided to move in a different direction&rdquo; as a curated artifact of the
        hustle.
      </p>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
        <Button size="lg" onClick={openDrawer}>
          Archive Yours
        </Button>
        <Stats count={count} />
      </div>
    </header>
  );
}
