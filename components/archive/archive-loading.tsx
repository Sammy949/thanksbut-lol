import { Skeleton } from "@/components/ui/skeleton";

/** Loading state: "Retrieving Artifacts" + a skeleton masonry. */
export function ArchiveLoading() {
  const cards = [
    { img: true, lines: 3 },
    { img: false, lines: 4 },
    { img: true, lines: 2 },
    { img: false, lines: 3 },
    { img: true, lines: 2 },
  ];

  return (
    <div className="flex flex-col gap-8 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-headline-lg text-muted-type/60 font-display">
          Retrieving Artifacts
        </h1>
        <p className="text-meta-data text-muted-type font-body">
          Querying archival database…
        </p>
      </div>

      <div className="masonry">
        {cards.map((card, i) => (
          <div key={i} className="masonry-item">
            <div className="border-gallery-gray bg-surface-container-lowest flex flex-col gap-4 rounded-[1.5rem] border p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-12" />
              </div>
              {card.img && <Skeleton className="aspect-[4/3] w-full rounded-lg" />}
              <div className="flex flex-col gap-2">
                {Array.from({ length: card.lines }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
