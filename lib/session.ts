/**
 * Server-only anonymous session identity.
 *
 * The reaction count is only as trustworthy as the identity it's keyed on. The
 * old `visitorId` was a localStorage UUID the *client* generated and sent, so an
 * attacker could mint a fresh "identity" per request and inflate the count
 * without limit (this is exactly how one archive went 2 → 676).
 *
 * The fix: the server issues the identity. On first contact we mint a random
 * `sessionId` and hand back an HMAC-signed, httpOnly cookie. Because the
 * signature requires `REACTION_SESSION_SECRET` (server-only), the client cannot
 * forge a *new* valid session — it can only replay its own, which the
 * one-reaction-per-identity index already de-dupes. The reaction write
 * (`/api/react`) trusts ONLY the sessionId recovered from this signed cookie.
 *
 * This module uses `node:crypto` and must never be imported into client code.
 */

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

/** httpOnly signed cookie carrying `${sessionId}.${signature}`. */
export const SESSION_COOKIE = "tbl_session";

/** A year — the session is a long-lived anonymous handle, not a login. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

function secret(): string {
  const s = process.env.REACTION_SESSION_SECRET;
  if (!s) {
    throw new Error(
      "REACTION_SESSION_SECRET is not set — required to sign reaction sessions.",
    );
  }
  return s;
}

/** base64url HMAC-SHA256 of the sessionId under the server secret. */
function sign(sessionId: string): string {
  return createHmac("sha256", secret()).update(sessionId).digest("base64url");
}

/** Mint a fresh signed session. Returns the id and the cookie value to set. */
export function createSession(): { sessionId: string; cookieValue: string } {
  const sessionId = randomUUID();
  return { sessionId, cookieValue: `${sessionId}.${sign(sessionId)}` };
}

/**
 * Recover the trusted sessionId from a signed cookie value, or null if the
 * value is missing, malformed, or the signature doesn't verify. Constant-time
 * comparison avoids leaking signature bytes via timing.
 */
export function verifySession(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot <= 0) return null;

  const sessionId = cookieValue.slice(0, dot);
  const provided = cookieValue.slice(dot + 1);
  const expected = sign(sessionId);

  // Length-guard before timingSafeEqual (it throws on length mismatch).
  if (provided.length !== expected.length) return null;
  const ok = timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  return ok ? sessionId : null;
}
