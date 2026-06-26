import { Hero } from "@/components/shared/hero";
import { ArchiveFeed } from "@/components/archive/archive-feed";
import { MOCK_ARCHIVES } from "@/constants/mock-archives";

/**
 * Homepage = the wall. Mock data for now; swapped for live Convex data later.
 */
export default function Home() {
  const archives = MOCK_ARCHIVES;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <Hero count={4208} />
      <ArchiveFeed archives={archives} />
    </div>
  );
}
