/**
 * Shared guard for admin API routes.
 *
 * Every admin data/action route calls this first: it verifies the signed,
 * unexpired admin cookie (see lib/admin-session.ts) and hands back the Convex
 * admin secret so the route can call the owner-only Convex functions. Two gates,
 * both required — the cookie proves the caller logged in with the password; the
 * secret proves the call reaches Convex from our server, not a forged browser.
 *
 * Node runtime only.
 */

import { cookies } from "next/headers";

import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export interface AdminGuardOk {
  ok: true;
  secret: string;
}
export interface AdminGuardFail {
  ok: false;
  status: 401 | 503;
  error: string;
}

/** Returns the Convex admin secret if the request carries a valid admin session. */
export async function requireAdmin(): Promise<AdminGuardOk | AdminGuardFail> {
  const store = await cookies();
  const valid = verifyAdminSession(store.get(ADMIN_COOKIE)?.value, Date.now());
  if (!valid) {
    return { ok: false, status: 401, error: "Not signed in." };
  }
  const secret = process.env.CONVEX_ADMIN_SECRET;
  if (!secret) {
    return { ok: false, status: 503, error: "Admin is not configured." };
  }
  return { ok: true, secret };
}
