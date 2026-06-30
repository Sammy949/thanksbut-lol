"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSubmissionDrawer } from "@/components/upload/submission-context";

const NAV_LINKS = [
  { href: "/", label: "The Wall" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

/**
 * Mobile-only nav. The inline nav links collapse below `md`, so this hamburger
 * opens a bottom drawer (same Radix dialog + paper styling and slide-up motion
 * as the submission drawer) holding the full set of pages, the theme switch,
 * and the primary CTA.
 */
export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { openDrawer } = useSubmissionDrawer();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label="Open menu"
        className="text-on-surface hover:text-primary flex size-9 items-center justify-center transition-colors md:hidden"
      >
        <Menu className="size-6" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-on-surface/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm md:hidden" />
        <DialogPrimitive.Content
          className={cn(
            "bg-surface-container-lowest border-outline-variant data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-none border-t shadow-[0_-10px_40px_rgba(0,0,0,0.15)] duration-300 md:hidden",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="bg-outline-variant h-1.5 w-12 rounded-none" />
          </div>

          {/* Header */}
          <div className="border-outline-variant flex items-center justify-between border-b px-5 py-3">
            <span className="text-primary font-mono text-[15px] font-bold tracking-[0.15em] uppercase">
              {SITE.name}
            </span>
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="text-outline hover:text-on-surface flex size-9 items-center justify-center transition-colors"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Pages */}
          <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border-l-2 px-3 py-3 font-mono text-[15px] tracking-[0.1em] uppercase transition-colors",
                    active
                      ? "text-primary border-primary bg-surface-container-low"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme + CTA */}
          <div className="border-outline-variant flex items-center justify-between border-t px-5 py-3">
            <span className="text-code-snippet text-secondary font-mono">
              Theme
            </span>
            <ThemeToggle />
          </div>
          <div className="px-5 pt-2 pb-8">
            <Button
              shape="sheet"
              className="w-full"
              onClick={() => {
                setOpen(false);
                openDrawer();
              }}
            >
              Archive Yours
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
