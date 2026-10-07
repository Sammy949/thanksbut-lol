"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StampMark } from "@/components/archive/stamp-mark";

/** "Page Not Accepted" — the 404 / error screen, filed as an artifact. */
export function ErrorState({
  reset,
  notFound = false,
}: {
  reset?: () => void;
  notFound?: boolean;
}) {
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
          {notFound ? "404" : "Unavailable"}
        </p>
        <h1 className="text-headline-md text-on-surface font-display mt-2">
          {notFound ? "Page not found." : "Something went wrong."}
        </h1>
        <p className="text-on-surface-variant text-body-md mx-auto mt-4 max-w-md font-mono">
          {notFound
            ? "This page doesn’t exist. Return to The Wall to browse rejections."
            : "We couldn’t load this page. Try again, or return to The Wall."}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {reset && (
            <Button onClick={reset}>
              <RotateCw className="size-4" />
              Try again
            </Button>
          )}
          <Button variant="secondary" asChild>
            <Link href="/">Back to The Wall</Link>
          </Button>
        </div>

        <div className="border-outline-variant mt-8 grid grid-cols-2 gap-4 border-t pt-6 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-label-caps text-secondary font-mono uppercase">
              Status
            </span>
            <span className="text-code-snippet text-on-surface-variant font-mono">
              {notFound ? "Not found" : "Page could not load"}
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
