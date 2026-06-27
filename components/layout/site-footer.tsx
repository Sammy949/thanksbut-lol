import { SITE } from "@/constants/site";

// Computed at build/render time — updates whenever the site is rebuilt.
const YEAR = new Date().getFullYear();

const LINKS = [
  { label: "X", href: "https://x.com" },
  { label: "GitHub", href: "https://github.com/Sammy949/thanksbut-lol" },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-dim border-outline-variant mt-24 border-t">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-4 px-5 py-10 md:flex-row md:justify-between md:px-16">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span className="text-on-surface font-mono text-[16px] font-bold tracking-[0.15em] uppercase">
            {SITE.name}
          </span>
          <span className="text-code-snippet text-secondary font-mono">
            © {YEAR} {SITE.name} — A Digital Scurry of Rejection.
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
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
