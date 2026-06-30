"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useSubmissionDrawer } from "@/components/upload/submission-context";

const NAV_LINKS = [
  { href: "/", label: "The Wall" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

/** Sticky paper nav: wordmark · The Wall · About · FAQ · theme · Archive Yours. */
export function Navbar() {
  const { openDrawer } = useSubmissionDrawer();
  const pathname = usePathname();

  return (
    <header className="bg-surface border-outline-variant sticky top-0 z-50 border-b md:bg-surface/90 md:backdrop-blur-sm">
      <nav className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-2 px-5 md:px-16">
        <Link
          href="/"
          className="text-primary shrink-0 font-mono text-[15px] font-bold tracking-[0.1em] uppercase sm:text-[20px] sm:tracking-[0.15em]"
        >
          {SITE.name}
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-label-caps hidden pb-1 font-mono uppercase transition-colors md:inline-block",
                  active
                    ? "text-primary border-primary border-b-2"
                    : "text-secondary hover:text-primary border-b-2 border-transparent",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {/* Desktop: inline theme switch. On mobile it lives in the sheet. */}
          <span className="hidden md:flex">
            <ThemeToggle />
          </span>
          <Button size="pill" onClick={openDrawer}>
            <span className="sm:hidden">Archive</span>
            <span className="hidden sm:inline">Archive Yours</span>
          </Button>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
