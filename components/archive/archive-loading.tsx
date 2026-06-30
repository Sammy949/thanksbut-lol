import { Skeleton } from "@/components/ui/skeleton";

const ROTATIONS = [-2, 2, 1.5, -3, 1, -1.5];

/** Loading state: "Retrieving artifacts…" + a skeleton paper board. */
export function ArchiveLoading() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 py-12 md:px-16">
      <h1 className="text-headline-md text-on-surface-variant font-display mb-1">
        Retrieving artifacts…
      </h1>
      <p className="text-code-snippet text-secondary mb-8 font-mono">
        Querying the basement archives
      </p>

      <div className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-10 break-inside-avoid">
            <div
              className="paper-card p-5"
              style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
            >
              <div className="border-outline-variant mb-3 flex justify-between border-b border-dashed pb-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-12" />
              </div>
              {i % 2 === 0 ? (
                <Skeleton className="aspect-[4/3] w-full" />
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              )}
              <div className="border-outline-variant mt-4 flex justify-between border-t pt-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
