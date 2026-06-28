/**
 * Best-effort per-IP sliding-window rate limit.
 *
 * SECONDARY defence only. The primary anti-abuse control is the server-issued
 * signed session (see lib/session.ts) — the count cannot be inflated by minting
 * identities. This just blunts rapid-fire floods from a single IP.
 *
 * Deliberately in-memory: state is per serverless instance and resets on cold
 * start, so it is NOT a hard guarantee. We keep the window generous so genuine
 * users sharing a carrier-grade NAT IP (a lot of our mobile traffic) are never
 * throttled for normal clicking; only scripted bursts trip it. For a durable,
 * cross-instance limit, back this with Convex or a KV store later.
 */

type Stamp = number;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

const hits = new Map<string, Stamp[]>();

/** Record a hit for `key`; return false if it exceeds the window budget. */
export function rateLimitOk(key: string, now: number): boolean {
  const cutoff = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map doesn't grow unbounded across many IPs.
  if (hits.size > 10_000) {
    for (const [k, stamps] of hits) {
      if (stamps.every((t) => t <= cutoff)) hits.delete(k);
    }
  }

  return recent.length <= MAX_PER_WINDOW;
}

/** Resolve the client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
