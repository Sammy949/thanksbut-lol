import { Button } from "@/components/ui/button";
import { SITE } from "@/constants/site";

/** Homepage hero. Placeholder — editorial design imported later. */
export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        {SITE.tagline}
      </h1>
      <p className="text-muted-foreground mt-3">{SITE.description}</p>
      <div className="mt-6">
        <Button>Archive Yours</Button>
      </div>
    </section>
  );
}
