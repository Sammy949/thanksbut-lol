/**
 * POST /api/react — the ONLY path that may change a reaction count.
 *
 * Trust chain:
 *  1. Recover the sessionId from the HMAC-signed httpOnly cookie. No valid
 *     cookie → 401. The client cannot forge a *new* session without the secret,
 *     so it can't mint fresh identities to inflate the count (the 2 → 676 bug).
 *  2. Soft per-IP rate limit — secondary flood protection, CGNAT-safe.
 *  3. Call the trusted Convex mutation with the shared server secret.
 *
 * Body: { archiveId: string }. Returns { reacted, reactions }.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/lib/convex-api";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { clientIp, rateLimitOk } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const store = await cookies();
  const sessionId = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!sessionId) {
    return NextResponse.json(
      { error: "No valid session. Reload and try again." },
      { status: 401 },
    );
  }

  const now = Date.now();
  if (!rateLimitOk(`react:${clientIp(req)}`, now)) {
    return NextResponse.json(
      { error: "Slow down a moment." },
      { status: 429 },
    );
  }

  let archiveId: unknown;
  try {
    ({ archiveId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof archiveId !== "string" || archiveId.length === 0) {
    return NextResponse.json({ error: "archiveId required." }, { status: 400 });
  }

  const secret = process.env.CONVEX_REACTION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Reactions are temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const result = await fetchMutation(api.reactions.toggle, {
      archiveId,
      sessionId,
      secret,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Don't leak whether it was a bad id, a missing archive, or an auth fault.
    return NextResponse.json(
      { error: "Could not record that reaction." },
      { status: 502 },
    );
  }
}
