import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { SITE } from "@/constants/site";
import { FAQ_ITEMS } from "@/constants/faq";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";
import { StampMark } from "@/components/archive/stamp-mark";
import { faqJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Answers about ${SITE.name}: what it is, why it was created, who built it, how submissions are moderated, and how to add your own rejection email.`,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: `FAQ — ${SITE.name}`,
    description: `Common questions about ${SITE.name}, the internet's archive of rejection emails.`,
    url: `${SITE.url}/faq`,
    type: "article",
  },
};

export default function FaqPage() {
  return (
    <div className="flex flex-col pb-8">
      <JsonLd data={faqJsonLd()} />

      {/* Masthead */}
      <header className="relative mx-auto flex w-full max-w-[1120px] flex-col items-center px-5 py-12 text-center md:px-16 md:py-20">
        <StampMark
          label="FILED"
          className="absolute top-10 left-[6%] hidden rotate-[-12deg] text-[18px] opacity-25 sm:block md:left-[12%]"
        />
        <span className="text-label-caps text-secondary mb-4 font-mono uppercase">
          The fine print
        </span>
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface font-display mb-6 leading-none">
          Frequently asked,
          <br />
          duly answered.
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl font-mono leading-relaxed">
          What {SITE.name} is, why it exists, who built it, and how the archive
          stays safe.
        </p>
      </header>

      {/* Q&A — native <details> so it collapses with zero JS and the answers
          still ship in the HTML for crawlers + FAQPage JSON-LD. Shared `name`
          makes it an exclusive accordion (opening one closes the rest); first
          open by default. */}
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-5 md:px-8">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={item.question}
            name="faq"
            open={i === 0}
            className="paper-card group flex flex-col px-6 py-5 md:px-8"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-start gap-3">
                <span className="text-label-caps text-secondary mt-1 shrink-0 font-mono">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-headline-sm text-on-surface font-display">
                  {item.question}
                </h2>
              </span>
              <ChevronDown className="text-secondary group-open:text-primary mt-1 size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="text-body-md text-on-surface-variant border-outline-variant mt-4 border-t border-dashed pt-4 font-mono leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-auto mt-16 flex w-full max-w-[760px] flex-col items-center gap-4 px-5 text-center md:px-8">
        <p className="text-body-md text-on-surface-variant font-mono">
          Still curious? The wall says more than any FAQ can.
        </p>
        <Button
          asChild
          size="lg"
          className="shadow-[4px_4px_0_0_var(--on-surface-variant)] transition-transform hover:scale-105"
        >
          <Link href="/">See the wall</Link>
        </Button>
      </div>
    </div>
  );
}
