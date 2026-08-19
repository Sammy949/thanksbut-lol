/**
 * Server-only owner/admin session.
 *
 * The site has no auth provider and exactly one operator (the owner). Admin
 * access is a single password (`ADMIN_PASSWORD`); on success we mint an
 * HMAC-signed, httpOnly, expiring cookie — the moderation equivalent of the
 * anonymous session in lib/session.ts, but short-lived and gated on a secret
 * only the owner knows.
 *
 * The cookie payload is `${expiresAt}.${signature}` where signature = HMAC over
 * the expiry. There's no server-side session store; the signature + embedded
 * expiry are self-contained. A leaked cookie is usable only until it expires, so
 * the TTL is deliberately short. Rotating `ADMIN_SESSION_SECRET` invalidates all
 * outstanding admin cookies immediately.
 *
 * Uses node:crypto — never import into client code.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** httpOnly signed admin cookie carrying `${expiresAt}.${signature}`. */
export const ADMIN_COOKIE = "tbl_admin";

/** Admin sessions are short-lived — this is privileged access, not a login. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

function adminSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set — required to sign admin sessions.",
    );
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", adminSecret()).update(payload).digest("base64url");
}

/**
 * Constant-time password check against `ADMIN_PASSWORD`. Returns false (never
 * throws) if the env var is missing, so a misconfigured deploy simply denies
 * access rather than crashing or, worse, allowing it.
 */
export function verifyAdminPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  // Compare against a fixed-length HMAC of each side so length differences don't
  // leak via timingSafeEqual's length check.
  const ah = createHmac("sha256", "cmp").update(a).digest();
  const bh = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ah, bh);
}

/** Mint a fresh signed admin cookie value (with embedded expiry). */
export function createAdminSession(now: number): { cookieValue: string } {
  const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = String(expiresAt);
  return { cookieValue: `${payload}.${sign(payload)}` };
}

/**
 * True if the cookie value is a valid, unexpired admin session. Verifies the
 * signature (constant-time) before trusting the embedded expiry.
 */
export function verifyAdminSession(
  cookieValue: string | undefined,
  now: number,
): boolean {
  if (!cookieValue) return false;
  const dot = cookieValue.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = cookieValue.slice(0, dot);
  const provided = cookieValue.slice(dot + 1);
  const expected = sign(payload);

  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > now;
}
