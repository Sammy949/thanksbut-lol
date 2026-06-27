"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StampMark } from "@/components/archive/stamp-mark";

/** "Page Not Accepted" — the 404 / error screen, filed as an artifact. */
export function ErrorState({ reset }: { reset?: () => void }) {
  const [timestamp] = React.useState(
    () => new Date().toISOString().slice(0, 19).replace("T", " ") + "Z",
  );

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col items-center px-5 py-24 md:px-16">
      <div className="paper-card relative -rotate-1 px-8 py-12 text-center md:px-12">
        <StampMark
          label="Not Accepted"
          className="absolute -top-3 right-6 text-[20px]"
        />
        <p className="text-display-lg-mobile md:text-display-lg text-on-surface font-display leading-none">
          404
        </p>
        <h1 className="text-headline-md text-on-surface font-display mt-2">
          Page not accepted.
        </h1>
        <p className="text-on-surface-variant text-body-md mx-auto mt-4 max-w-md font-mono">
          Even our servers feel rejected. This page has been filed under &lsquo;does not
          exist&rsquo;. Try again, or return to the wall.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button onClick={() => reset?.()}>
            <RotateCw className="size-4" />
            Try Again
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>

        <div className="border-outline-variant mt-8 grid grid-cols-2 gap-4 border-t pt-6 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-label-caps text-secondary font-mono uppercase">
              Status
            </span>
            <span className="text-code-snippet text-on-surface-variant font-mono">
              503 Service Unavailable
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-label-caps text-secondary font-mono uppercase">
              Filed
            </span>
            <span
              className="text-code-snippet text-on-surface-variant font-mono"
              suppressHydrationWarning
            >
              {timestamp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
