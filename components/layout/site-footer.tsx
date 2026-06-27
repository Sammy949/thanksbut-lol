import { SITE } from "@/constants/site";

/** Paper footer. Links are inert for now (no pages built yet). */
const LINKS = [
  { label: "Manifesto", href: "#" },
  { label: "Submit Artifact", href: "#" },
  { label: "Basement Archives", href: "#" },
  { label: "Twitter (X)", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-dim border-outline-variant mt-24 border-t">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-6 px-5 py-12 md:flex-row md:justify-between md:px-16">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="text-on-surface font-mono text-[16px] font-bold tracking-[0.15em] uppercase">
            {SITE.name}
          </span>
          <span className="text-code-snippet text-secondary font-mono">
            © 1998–2026 {SITE.name} — A Digital Scurry of Rejection.
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-label-caps text-secondary hover:text-primary font-mono underline transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
