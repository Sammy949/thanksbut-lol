import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/json-ld";
import { StampMark } from "@/components/archive/stamp-mark";
import { MaskingTape } from "@/components/archive/decorations";
import { aboutPageJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${SITE.name} — the internet's archive of rejection emails — and ${SITE.author.name}, the developer who built it in roughly a day.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About — ${SITE.name}`,
    description: `How ${SITE.name} went from a tweet to the internet's archive of rejection emails.`,
    url: `${SITE.url}/about`,
    type: "article",
  },
};

const { author } = SITE;

const AUTHOR_LINKS = [
  { label: "X", href: author.x },
  { label: "GitHub", href: author.github },
  { label: "Website", href: author.url },
  { label: "Email", href: `mailto:${author.email}` },
];

export default function AboutPage() {
  return (
    <article className="flex flex-col pb-8">
      <JsonLd data={aboutPageJsonLd} />

      {/* Masthead */}
      <header className="relative mx-auto flex w-full max-w-[1120px] flex-col items-center px-5 py-12 text-center md:px-16 md:py-20">
        <StampMark
          label="THE STORY"
          className="absolute top-10 right-[6%] hidden rotate-[10deg] text-[18px] opacity-25 sm:block md:right-[12%]"
        />
        <span className="text-label-caps text-secondary mb-4 font-mono uppercase">
          Case file · est. 2026
        </span>
        <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface font-display mb-6 leading-none">
          A tweet, then a day,
          <br />
          then an archive.
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl font-mono leading-relaxed">
          {SITE.name} {" "} is the internet&apos;s archive of rejection emails — a
          public wall for every &ldquo;we&apos;ve decided to move in a different
          direction.&rdquo; Here&apos;s where it came from.
        </p>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-14 px-5 md:px-8">
        <Section title="The idea" stamp="REJECTED" stampRotate="-8deg">
          <p>
            It started as a joke. Robinson Honour posted a tweet saying someone
            should build a website where people could upload their rejection
            emails. The kind of idea that usually stays a tweet.
          </p>
          <Pull>
            &ldquo;Someone should build a site for rejection emails.&rdquo; So
            someone did.
          </Pull>
          <p>
            Instead of letting it remain an idea, I decided to build it — and to
            see how far a small, light-hearted concept could go if you actually
            shipped it.
          </p>
        </Section>

        <Section title="The build" stamp="ARCHIVED" stampRotate="9deg">
          <p>
            From first sketch to public launch took roughly twenty-four hours. I
            designed the experience from scratch, refined the concept several
            times, built the frontend, connected the backend with{" "}
            <Ext href="https://convex.dev">Convex</Ext> and{" "}
            <Ext href="https://uploadthing.com">UploadThing</Ext>, deployed it,
            and launched it publicly.
          </p>
          <div className="border-outline-variant text-code-snippet text-on-surface-variant grid grid-cols-2 gap-4 border-y border-dashed py-5 font-mono sm:grid-cols-4">
            <Stat k="Concept" v="A tweet" />
            <Stat k="Build time" v="~24 hours" />
            <Stat k="Stack" v="Next · Convex · UploadThing" />
            <Stat k="Status" v="Live & growing" />
          </div>
        </Section>

        <Section title="Why it exists" stamp="VOID" stampRotate="-6deg">
          <p>
            The project is intentionally light-hearted, but it isn&apos;t about
            making fun of people who get rejected. It&apos;s about reminding
            everyone that rejection is a shared experience. A job, an internship,
            a scholarship, a hackathon, a university place — almost everyone
            receives that email at some point.
          </p>
          <p>
            Rather than hiding those moments, {SITE.name} turns them into a
            public archive that celebrates persistence, growth, and the stories
            behind every attempt. Since launch, people have started submitting
            their own rejections, sharing the project, sending feedback, and
            helping shape where it goes next.
          </p>
        </Section>
      </div>

      {/* Signed-off author card */}
      <div className="mx-auto mt-16 w-full max-w-[760px] px-5 md:px-8">
        <div className="relative inline-block w-full">
          <MaskingTape className="top-[-12px] left-10 z-20 h-6 w-24 -rotate-3" />
          <div className="paper-card flex flex-col gap-4 px-6 py-7 md:px-8">
            <span className="text-label-caps text-secondary font-mono uppercase">
              Built by
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-headline-sm text-on-surface font-display">
                {author.name}
              </span>
              <span className="text-code-snippet text-on-surface-variant font-mono">
                {author.role} · {author.location} · builds in public
              </span>
            </div>
            <nav className="border-outline-variant flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
              {AUTHOR_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="text-label-caps text-secondary hover:text-primary font-mono underline transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-16 flex w-full max-w-[760px] flex-col items-center gap-4 px-5 text-center md:px-8">
        <p className="text-body-md text-on-surface-variant font-mono">
          Got a &ldquo;thanks, but…&rdquo; of your own?
        </p>
        <Button
          asChild
          size="lg"
          className="shadow-[4px_4px_0_0_var(--on-surface-variant)] transition-transform hover:scale-105"
        >
          <Link href="/">See the wall</Link>
        </Button>
      </div>
    </article>
  );
}

/** A titled prose block with a faint stamp floated to the side. */
function Section({
  title,
  stamp,
  stampRotate,
  children,
}: {
  title: string;
  stamp: string;
  stampRotate: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      <StampMark
        label={stamp}
        style={{ transform: `rotate(${stampRotate})` }}
        className="absolute -top-2 right-0 hidden text-[16px] opacity-20 md:block"
      />
      <h2 className="text-headline-md text-on-surface font-display mb-4">
        {title}
      </h2>
      <div className="text-body-md text-on-surface flex flex-col gap-4 font-body leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/** A serif pull-quote, set off with a left rule. */
function Pull({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-primary text-on-surface-variant text-headline-sm font-display my-2 border-l-2 pl-5 italic">
      {children}
    </blockquote>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-caps text-secondary uppercase">{k}</span>
      <span className="text-on-surface">{v}</span>
    </div>
  );
}

/** External link styled inline within prose. */
function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline decoration-1 underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  );
}
