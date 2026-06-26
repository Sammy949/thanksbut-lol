import type { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Resolve the caller's identity to a stable id used for reactions/reports.
 *
 * Today this is just the anonymous browser visitorId (localStorage UUID).
 * The abstraction exists so email/account auth can be added later without
 * changing any function signatures: prefer an authenticated user when present,
 * fall back to the visitorId.
 */
export async function resolveIdentity(
  ctx: QueryCtx | MutationCtx,
  visitorId: string,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity) return `user:${identity.subject}`;
  return `visitor:${visitorId}`;
}
