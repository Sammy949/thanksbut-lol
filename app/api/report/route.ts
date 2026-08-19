/**
 * POST /api/report — file a report against an archive.
 *
 * Same trust chain as /api/react (the count/queue is only as trustworthy as the
 * identity behind it):
 *  1. Recover the sessionId from the HMAC-signed httpOnly cookie. No valid
 *     cookie → 401. The client can't forge a *new* session without the secret,
 *     so it can't mint fresh identities to flood the moderation queue.
 *  2. Soft per-IP rate limit — secondary flood protection, CGNAT-safe.
 *  3. Call the trusted Convex mutation with the shared server secret, which
 *     dedupes to one open report per identity per archive.
 *
 * Body: { archiveId: string, reason: ReportReason }. Returns { ok: true }.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/lib/convex-api";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { clientIp, rateLimitOk } from "@/lib/rate-limit";
import type { ReportReason } from "@/types/report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REASONS: readonly ReportReason[] = ["spam", "pii", "harassment", "other"];

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
  if (!rateLimitOk(`report:${clientIp(req)}`, now)) {
    return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });
  }

  let archiveId: unknown;
  let reason: unknown;
  try {
    ({ archiveId, reason } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof archiveId !== "string" || archiveId.length === 0) {
    return NextResponse.json({ error: "archiveId required." }, { status: 400 });
  }
  if (!REASONS.includes(reason as ReportReason)) {
    return NextResponse.json({ error: "Invalid reason." }, { status: 400 });
  }

  const secret = process.env.CONVEX_REACTION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Reporting is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const result = await fetchMutation(api.reports.create, {
      archiveId,
      reason: reason as ReportReason,
      sessionId,
      secret,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Don't leak whether it was a bad id, a missing archive, or an auth fault.
    return NextResponse.json(
      { error: "Could not file that report." },
      { status: 502 },
    );
  }
}
