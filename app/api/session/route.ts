/**
 * GET /api/session — ensure the caller has a server-issued anonymous session.
 *
 * If the request carries a valid signed `tbl_session` cookie we echo its
 * sessionId; otherwise we mint a fresh one and Set-Cookie it (httpOnly, signed).
 * The returned `sessionId` is handed to the live Convex query so the wall can
 * show which 🥲 the caller has pressed. It is NOT a secret — the trust lives in
 * the signed httpOnly cookie, which only `/api/react` reads to authorise writes.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSession,
  verifySession,
} from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const store = await cookies();
  const existing = verifySession(store.get(SESSION_COOKIE)?.value);
  if (existing) {
    return NextResponse.json(
      { sessionId: existing },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { sessionId, cookieValue } = createSession();
  const res = NextResponse.json(
    { sessionId },
    { headers: { "Cache-Control": "no-store" } },
  );
  res.cookies.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
