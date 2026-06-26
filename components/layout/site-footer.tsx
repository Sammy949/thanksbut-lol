import { SITE } from "@/constants/site";

/**
 * Minimal footer. Legal links are kept per scope but inert for now (no pages
 * built yet). Manifesto/API/Gallery from the mockups are intentionally dropped.
 */
const LINKS = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Contact", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="border-gallery-gray mt-16 border-t">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-5 py-10 md:flex-row md:justify-between md:px-8">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span className="text-headline-md text-on-surface font-display">
            {SITE.name}
          </span>
          <span className="text-meta-data text-muted-type font-mono uppercase">
            © 2026 {SITE.name} — Archival Collection
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-meta-data text-muted-type hover:text-on-surface font-mono underline-offset-4 transition-colors hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
