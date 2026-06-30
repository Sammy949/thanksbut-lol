import type { CSSProperties } from "react";

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

// Scattered spots for the stamp so it isn't slapped in the same corner of every
// card. Each is a CSS position; rotation is layered on per-card.
const STAMP_SPOTS: CSSProperties[] = [
  { top: "8%", right: "8%" },
  { top: "16%", left: "6%" },
  { top: "42%", right: "7%" },
  { bottom: "24%", left: "8%" },
  { top: "10%", left: "32%" },
  { bottom: "30%", right: "10%" },
];

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
    // `w-full` is load-bearing: the parent <section> is a flexbox, and `mx-auto`
    // on a flex item disables the default stretch — without an explicit width the
    // column box shrinks to fit its content's intrinsic width (the card images),
    // overflowing narrow screens. width:100% (capped by max-w) keeps it on-screen.
    <div className="mx-auto w-full max-w-[1120px] columns-1 gap-x-8 px-5 sm:columns-2 md:px-16 lg:columns-3">
      {archives.map((archive) => {
        const stamp = STAMPS[hashId(archive.id + "stamp") % STAMPS.length];
        const decoration = DECORATIONS[hashId(archive.id + "deco") % DECORATIONS.length];
        // Continuous tilt in [-MAX_TILT, +MAX_TILT), decorrelated from the stamp.
        const rotation = (hashId(archive.id + "tilt") % 800) / 100 - MAX_TILT;
        // Scatter the stamp: a random spot + its own random rotation (-18°..+17°).
        const spot = STAMP_SPOTS[hashId(archive.id + "spot") % STAMP_SPOTS.length];
        const stampStyle: CSSProperties = {
          ...spot,
          transform: `rotate(${(hashId(archive.id + "srot") % 36) - 18}deg)`,
        };

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
              stampStyle={stampStyle}
            />
          </div>
        );
      })}
    </div>
  );
}
