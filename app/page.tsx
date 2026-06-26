import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/shared/hero";
import { Stats } from "@/components/shared/stats";
import { CategoryFilters } from "@/components/archive/category-filters";
import { ArchiveWall } from "@/components/archive/archive-wall";

/**
 * Homepage = the wall. Composition only; each section is a placeholder for now.
 * Layout/design is imported later — this just proves the structure compiles.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24">
        <Hero />
        <Stats />
        <div className="mt-8 space-y-8">
          <CategoryFilters />
          <ArchiveWall />
        </div>
      </main>
    </>
  );
}
