"use client";

import Link from "next/link";

import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSubmissionDrawer } from "@/components/upload/submission-context";

/** Sticky paper nav: wordmark · The Wall · theme · Archive Yours. */
export function Navbar() {
  const { openDrawer } = useSubmissionDrawer();

  return (
    <header className="bg-surface/90 border-outline-variant sticky top-0 z-50 border-b backdrop-blur-sm">
      <nav className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-5 md:px-16">
        <Link
          href="/"
          className="text-primary font-mono text-[20px] font-bold tracking-[0.15em] uppercase"
        >
          {SITE.name}
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-primary border-primary text-label-caps hidden border-b-2 pb-1 font-mono uppercase md:inline-block"
          >
            The Wall
          </Link>
          <ThemeToggle />
          <Button size="pill" onClick={openDrawer}>
            Archive Yours
          </Button>
        </div>
      </nav>
    </header>
  );
}
