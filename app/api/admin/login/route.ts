/**
 * POST /api/admin/login — exchange the owner password for a signed admin cookie.
 * DELETE /api/admin/login — sign out (clear the cookie).
 *
 * The only door to moderation. Rate-limited per IP so the single password can't
 * be brute-forced, constant-time compared (see lib/admin-session.ts), and on
 * success sets a short-lived HMAC-signed httpOnly cookie.
 */

import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-session";
import { clientIp, rateLimitOk } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const now = Date.now();
  if (!rateLimitOk(`admin-login:${clientIp(req)}`, now)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute." },
      { status: 429 },
    );
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const { cookieValue } = createAdminSession(now);
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(ADMIN_COOKIE, cookieValue, {
    httpOnly: true,
    sameSite: "strict", // admin actions are same-origin only — hard CSRF floor
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
