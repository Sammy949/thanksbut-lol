import type { Archive } from "@/types/archive";
import { ArchiveCard } from "./archive-card";

interface ArchiveWallProps {
  archives: Archive[];
  onOpen: (archive: Archive) => void;
  onReport: (archive: Archive) => void;
}

/** Presentational masonry wall of artifact cards (CSS columns). */
export function ArchiveWall({ archives, onOpen, onReport }: ArchiveWallProps) {
  return (
    <div className="masonry">
      {archives.map((archive) => (
        <div key={archive.id} className="masonry-item">
          <ArchiveCard archive={archive} onOpen={onOpen} onReport={onReport} />
        </div>
      ))}
    </div>
  );
}
