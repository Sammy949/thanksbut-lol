"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCw, ImageOff } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Full-bleed "Unavailable." error screen from the mockups. */
export function ErrorState({ reset }: { reset?: () => void }) {
  // Error boundaries render client-side only, so a lazy initial value is safe.
  const [timestamp] = React.useState(
    () => new Date().toISOString().slice(0, 19).replace("T", " ") + "Z",
  );

  return (
    <div className="flex flex-col items-center gap-8 py-20 text-center">
      <div className="border-gallery-gray relative flex size-44 items-center justify-center rounded-2xl border">
        <ImageOff className="text-outline-variant size-16" strokeWidth={1.5} />
        <div className="stamp border-rejection-red text-rejection-red text-label-caps absolute bg-transparent px-2 py-0.5 font-mono">
          404
        </div>
        <div className="border-gallery-gray bg-surface-container-lowest absolute -bottom-4 flex items-center gap-2 rounded-md border px-3 py-1.5">
          <span className="bg-rejection-red size-2 rounded-full" />
          <span className="text-meta-data text-muted-type font-mono">SYS_ERR_01</span>
        </div>
      </div>

      <h1 className="text-display-hero text-ink-black font-display mt-4">
        Unavailable.
      </h1>
      <p className="text-body-lg text-on-surface-variant font-body max-w-xl">
        Something went wrong. Even our servers feel rejected. Please try refreshing, or
        check back later when we&apos;ve gathered the courage to try again.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Button onClick={() => reset?.()}>
          <RotateCw className="size-4" />
          Try Again
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>

      <div className="border-gallery-gray mt-4 grid w-full max-w-md grid-cols-2 gap-4 border-t pt-6">
        <div className="flex flex-col gap-1">
          <span className="text-label-caps text-muted-type font-mono uppercase">
            Status
          </span>
          <span className="text-meta-data text-on-surface-variant font-mono">
            503 Service Unavailable
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-label-caps text-muted-type font-mono uppercase">
            Timestamp
          </span>
          <span
            className="text-meta-data text-on-surface-variant font-mono"
            suppressHydrationWarning
          >
            {timestamp || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
