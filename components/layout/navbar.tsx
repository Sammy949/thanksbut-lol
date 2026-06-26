"use client";

import Link from "next/link";

import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSubmissionDrawer } from "@/components/upload/submission-context";

/**
 * Fixed, frosted top navigation: just the wordmark, the theme toggle and the
 * Submit CTA (the "Archive" link was dropped — the homepage is the archive).
 */
export function Navbar() {
  const { openDrawer } = useSubmissionDrawer();

  return (
    <header className="bg-surface/80 border-gallery-gray fixed inset-x-0 top-0 z-40 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between border-b border-transparent px-5 md:px-8">
        <Link
          href="/"
          className="text-headline-md text-on-surface font-display tracking-tight"
        >
          {SITE.name}
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Button size="pill" onClick={openDrawer}>
            Submit Rejection
          </Button>
        </div>
      </nav>
    </header>
  );
}
