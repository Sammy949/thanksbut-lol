import type { Archive } from "@/types/archive";
import { ArchiveCard, type CardDecoration } from "./archive-card";

interface ArchiveWallProps {
  archives: Archive[];
  onOpen: (archive: Archive) => void;
  onReport: (archive: Archive) => void;
  onReact?: (id: string) => void;
}

// Deterministic scatter so the board feels hand-pinned but stays dynamic.
const ROTATIONS = [-2, 2.5, 1.5, -3, 1, -1.5, 3, -2.5];
const DECORATIONS: CardDecoration[] = [
  "pin",
  "tape",
  "none",
  "clip",
  "none",
  "tape",
  "pin",
  "none",
];

/**
 * The evidence board: a rotated paper masonry (CSS columns) that reads as
 * scattered pinned-up letters but scrolls naturally and works with any count.
 */
export function ArchiveWall({
  archives,
  onOpen,
  onReport,
  onReact,
}: ArchiveWallProps) {
  return (
    <div className="mx-auto max-w-[1120px] columns-1 gap-x-8 px-5 sm:columns-2 md:px-16 lg:columns-3">
      {archives.map((archive, i) => (
        <div key={archive.id} className="mb-10 break-inside-avoid">
          <ArchiveCard
            archive={archive}
            onOpen={onOpen}
            onReport={onReport}
            onReact={onReact}
            rotation={ROTATIONS[i % ROTATIONS.length]}
            decoration={DECORATIONS[i % DECORATIONS.length]}
          />
        </div>
      ))}
    </div>
  );
}
