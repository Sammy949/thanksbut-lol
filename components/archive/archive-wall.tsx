import type { Archive } from "@/types/archive";
import { ArchiveCard } from "./archive-card";

/**
 * The wall of archives. Placeholder — data fetching and infinite scroll are
 * wired later. Renders an empty state until archives exist.
 */
export function ArchiveWall({ archives = [] }: { archives?: Archive[] }) {
  if (archives.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        No archives yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {archives.map((archive) => (
        <ArchiveCard key={archive.id} archive={archive} />
      ))}
    </div>
  );
}
