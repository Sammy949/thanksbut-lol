import type { Archive } from "@/types/archive";

/**
 * A single archive, postcard-sized. Placeholder — the screenshot is the hero;
 * category + optional company badges, caption, laughs, and the report menu
 * land here later.
 */
export function ArchiveCard({ archive }: { archive: Archive }) {
  return (
    <article className="rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">Archive {archive.id}</p>
    </article>
  );
}
