import Link from "next/link";

import { SITE } from "@/constants/site";

// Computed at build/render time — updates whenever the site is rebuilt.
const YEAR = new Date().getFullYear();

// All footer links in one row: internal pages first, then external profiles.
// External ones open in a new tab; profiles stay in sync with constants/site.ts.
const FOOTER_LINKS = [
  { label: "About", href: "/about", external: false },
  { label: "FAQ", href: "/faq", external: false },
  { label: "X", href: SITE.author.x, external: true },
  { label: "GitHub", href: SITE.author.github, external: true },
  { label: "Site", href: SITE.author.url, external: true },
];

const linkClass =
  "text-label-caps text-secondary hover:text-primary font-mono underline transition-colors";

export function SiteFooter() {
  return (
    <footer className="bg-surface-dim border-outline-variant mt-24 border-t">
      <div className="mx-auto w-full max-w-[1120px] px-5 py-10 md:px-16">
        {/* Brand + links: stacked & centered on mobile, split across on desktop. */}
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="text-on-surface font-mono text-[16px] font-bold tracking-[0.15em] uppercase">
              {SITE.name}
            </span>
            <span className="text-code-snippet text-secondary font-mono">
              © {YEAR} {SITE.name} — A Digital Scurry of Rejection.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
            {FOOTER_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        {/* Built-by credit — centered on its own line beneath everything. */}
        <div className="border-outline-variant mt-8 border-t pt-6 text-center">
          <span className="text-code-snippet text-secondary font-mono">
            Built by{" "}
            <a
              href={SITE.author.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary underline"
            >
              SamY
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
