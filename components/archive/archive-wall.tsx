import type { Archive } from "@/types/archive";
import { ArchiveCard, type CardDecoration } from "./archive-card";

interface ArchiveWallProps {
  archives: Archive[];
  onOpen: (archive: Archive) => void;
  onReport: (archive: Archive) => void;
  onReact?: (id: string) => void;
}

// Decorative pools. Every card draws one stamp + tilt + pin/tape so the board
// reads as a hand-pinned evidence wall rather than a tidy grid.
const STAMPS = [
  "REJECTED",
  "GHOSTED",
  "DENIED",
  "NO THANKS",
  "VOID",
  "NOPE",
  "PASS",
  "DECLINED",
];
const DECORATIONS: CardDecoration[] = ["pin", "tape", "clip", "none"];
const MAX_TILT = 4; // degrees, both directions — relatively random, never extreme

/** Stable hash so a card's stamp/tilt/pin are deterministic (no SSR mismatch). */
function hashId(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * The evidence board: a rotated paper masonry (CSS columns) that reads as
 * scattered pinned-up letters but scrolls naturally and works with any count.
 * Stamp, tilt and decoration are derived per-card from its id, so they're
 * randomly distributed yet stable across renders.
 */
export function ArchiveWall({
  archives,
  onOpen,
  onReport,
  onReact,
}: ArchiveWallProps) {
  return (
    <div className="mx-auto max-w-[1120px] columns-1 gap-x-8 px-5 sm:columns-2 md:px-16 lg:columns-3">
      {archives.map((archive) => {
        const stamp = STAMPS[hashId(archive.id + "stamp") % STAMPS.length];
        const decoration = DECORATIONS[hashId(archive.id + "deco") % DECORATIONS.length];
        // Continuous tilt in [-MAX_TILT, +MAX_TILT), decorrelated from the stamp.
        const rotation = (hashId(archive.id + "tilt") % 800) / 100 - MAX_TILT;

        return (
          <div key={archive.id} className="mb-10 break-inside-avoid">
            <ArchiveCard
              archive={archive}
              onOpen={onOpen}
              onReport={onReport}
              onReact={onReact}
              rotation={rotation}
              decoration={decoration}
              stamp={stamp}
            />
          </div>
        );
      })}
    </div>
  );
}
