import type { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Resolve the caller's identity to a stable id used for reactions/reports.
 *
 * Prefer an authenticated user when present (future accounts). Otherwise fall
 * back to the server-issued anonymous session.
 *
 * IMPORTANT: the session id passed here must come from the HMAC-signed cookie
 * verified in the Next `/api/react` route — never a raw client-supplied value.
 * Keying the count on a forgeable id is what let one archive be inflated 2 → 676.
 */
export async function resolveIdentity(
  ctx: QueryCtx | MutationCtx,
  sessionId: string,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity) return `user:${identity.subject}`;
  return `session:${sessionId}`;
}

/**
 * Guard for the trusted reaction write. The toggle is a public mutation (so the
 * Next route can call it over HTTP without a deploy key), so we gate it on a
 * shared secret only the server route knows. A forged browser call to
 * `reactions:toggle` without the secret is rejected.
 */
export function assertReactionSecret(secret: string): void {
  const expected = process.env.CONVEX_REACTION_SECRET;
  if (!expected) {
    throw new Error(
      "CONVEX_REACTION_SECRET is not set on the Convex deployment — refusing reactions.",
    );
  }
  if (secret !== expected) {
    throw new Error("Unauthorized reaction write.");
  }
}
