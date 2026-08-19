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
 * Guard for trusted server-to-server writes (reactions, reports, moderation).
 * These are public mutations so the Next route can call them over HTTP without a
 * deploy key, so we gate them on a shared secret only the server routes know. A
 * forged browser call without the secret is rejected. The real authorization for
 * privileged actions (admin cookie, manage token) is enforced at the Next layer;
 * this only proves the call originated from our server.
 */
export function assertServerSecret(secret: string): void {
  const expected = process.env.CONVEX_REACTION_SECRET;
  if (!expected) {
    throw new Error(
      "CONVEX_REACTION_SECRET is not set on the Convex deployment — refusing trusted write.",
    );
  }
  if (secret !== expected) {
    throw new Error("Unauthorized write.");
  }
}

/** @deprecated Back-compat alias — prefer {@link assertServerSecret}. */
export const assertReactionSecret = assertServerSecret;

/**
 * Guard for owner/admin moderation writes. Gated on a SEPARATE secret from the
 * public trusted-write secret, so a leak of the widely-used reaction/report
 * secret can't drive destructive moderation (remove/dismiss). Only the Next
 * admin routes — which first verify the signed admin cookie — hold this.
 */
export function assertAdminSecret(secret: string): void {
  const expected = process.env.CONVEX_ADMIN_SECRET;
  if (!expected) {
    throw new Error(
      "CONVEX_ADMIN_SECRET is not set on the Convex deployment — refusing admin write.",
    );
  }
  if (secret !== expected) {
    throw new Error("Unauthorized admin action.");
  }
}
