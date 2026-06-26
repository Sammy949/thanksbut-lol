/**
 * Tiny archive counter shown under the hero. Placeholder — the count is wired
 * to the backend later. Watching it climb is the only "metric" on the site.
 */
export function Stats({ count = 0 }: { count?: number }) {
  return (
    <p className="text-muted-foreground text-center text-sm">
      <span className="text-foreground font-medium">{count.toLocaleString()}</span>{" "}
      archives
    </p>
  );
}
