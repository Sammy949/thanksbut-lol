import { SITE } from "@/constants/site";

/**
 * Top bar. Placeholder — final design (wordmark, theme toggle, "Archive Yours"
 * CTA) is imported later. Kept deliberately bare; content is the hero.
 */
export function Navbar() {
  return (
    <header className="w-full border-b">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="font-mono text-sm font-semibold">{SITE.name}</span>
      </nav>
    </header>
  );
}
