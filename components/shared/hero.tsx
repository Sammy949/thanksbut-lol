"use client";

import { Archive as ArchiveIcon } from "lucide-react";

import { formatCount } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StampMark } from "@/components/archive/stamp-mark";
import { MaskingTape } from "@/components/archive/decorations";
import { useSubmissionDrawer } from "@/components/upload/submission-context";

/** Garamond hero with scattered ink stamps and a taped-up archive count. */
export function Hero({ count }: { count: number }) {
  const { openDrawer } = useSubmissionDrawer();

  return (
    <section className="relative mx-auto flex max-w-[1120px] flex-col items-center px-5 py-12 text-center md:px-16 md:py-24">
      <StampMark
        label="ARCHIVED"
        className="absolute top-8 left-[6%] hidden rotate-[-12deg] text-[20px] opacity-25 sm:block md:left-[12%]"
      />
      <StampMark
        label="REJECTED"
        className="absolute top-20 right-[6%] hidden rotate-[14deg] text-[24px] opacity-30 sm:block md:right-[14%]"
      />
      <StampMark
        label="VOID"
        className="absolute bottom-10 left-[6%] rotate-[6deg] text-[18px] opacity-20"
      />
      <StampMark
        label="CLASSIFIED"
        className="absolute top-1/2 right-10 hidden rotate-[-8deg] text-[16px] opacity-20 md:block"
      />

      <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface font-display relative z-10 mb-6 leading-none md:text-[112px]">
        Thanks, but…
      </h1>
      <p className="text-body-lg text-on-surface-variant relative z-10 mb-10 max-w-2xl font-mono leading-relaxed">
        The internet&apos;s archive of rejection emails. We treat every
        &ldquo;we&apos;ve decided to move in a different direction&rdquo; as a curated
        artefact of the hustle.
      </p>

      <div className="relative z-10 inline-block">
        <MaskingTape className="top-[-12px] left-1/2 z-20 h-6 w-24 -translate-x-1/2 -rotate-2" />
        <div className="paper-card text-on-surface flex rotate-1 items-center gap-3 px-6 py-4">
          <ArchiveIcon className="text-primary size-5" />
          <span className="text-body-md font-mono font-bold">
            {formatCount(count)} rejections archived
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-10">
        <Button
          size="lg"
          className="shadow-[4px_4px_0_0_var(--on-surface-variant)] transition-transform hover:scale-105"
          onClick={openDrawer}
        >
          Archive Yours
        </Button>
      </div>
    </section>
  );
}
