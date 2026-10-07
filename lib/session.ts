/**
 * Server-only anonymous session identity.
 *
 * The server issues a random `sessionId` in an HMAC-signed, httpOnly cookie.
 * Reaction/report routes recover identity only from the verified cookie;
 * browser-supplied ids cannot authorize writes. Deduplication applies per
 * session, not per person: callers can obtain new cookies by omitting the old
 * one. Signing prevents forgery, not multiple-session abuse.
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

  // Guard both character and byte lengths: malformed UTF-8 signatures can have
  // the expected character count but produce a longer buffer.
  if (provided.length !== expected.length) return null;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length) return null;
  const ok = timingSafeEqual(providedBytes, expectedBytes);
  return ok ? sessionId : null;
}
