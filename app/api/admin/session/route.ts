/**
 * GET /api/admin/session — is the caller currently signed in as admin?
 * Returns { authed: boolean }. Lets the /admin page decide whether to show the
 * login gate or the dashboard without leaking anything sensitive.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const store = await cookies();
  const authed = verifyAdminSession(store.get(ADMIN_COOKIE)?.value, Date.now());
  return NextResponse.json({ authed }, { headers: { "Cache-Control": "no-store" } });
}
