/** Human-readable "x ago" label from an epoch-ms timestamp. */
export function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/** Compact thousands formatting, e.g. 4208 -> "4,208". */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}
