import { ArchiveBoard } from "@/components/archive/archive-board";

/**
 * Homepage = the wall. ArchiveBoard renders live Convex data when a deployment
 * is configured, and falls back to the mock wall otherwise.
 */
export default function Home() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <ArchiveBoard />
    </div>
  );
}
