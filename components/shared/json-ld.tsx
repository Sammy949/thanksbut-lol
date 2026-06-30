/**
 * Renders a JSON-LD structured-data block. Server component — the script lands
 * in the initial HTML so crawlers and AI assistants read it without running JS.
 * Pass any schema.org object from `lib/structured-data`.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own constants, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
