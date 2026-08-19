/**
 * POST /api/manage/delete — self-serve archive deletion.
 *
 * Auth is the capability itself: the `manageToken` is an unguessable UUID handed
 * only to the submitter at create time, so possession authorizes deleting that
 * one archive. No session/account needed. We still gate the Convex call behind
 * the shared server secret (server-to-server) and rate-limit per IP to blunt
 * brute-forcing of tokens.
 *
 * On success we ALSO delete the screenshot from UploadThing — removing the row
 * alone would leave the file (often the PII) live on the CDN.
 *
 * Body: { id: string, manageToken: string }. Returns { deleted: boolean }.
 */

import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/lib/convex-api";
import { clientIp, rateLimitOk } from "@/lib/rate-limit";
import { deleteUploadedFiles } from "@/lib/uploadthing-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const now = Date.now();
  // Tighter than reactions: token guessing is the threat here, not click floods.
  if (!rateLimitOk(`manage-delete:${clientIp(req)}`, now)) {
    return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });
  }

  let id: unknown;
  let manageToken: unknown;
  try {
    ({ id, manageToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (
    typeof id !== "string" ||
    id.length === 0 ||
    typeof manageToken !== "string" ||
    manageToken.length === 0
  ) {
    return NextResponse.json(
      { error: "id and manageToken required." },
      { status: 400 },
    );
  }

  const secret = process.env.CONVEX_REACTION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Deletion is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const result = await fetchMutation(api.archives.removeByToken, {
      id,
      manageToken,
      secret,
    });

    // Row is gone; clean up the stored file too (best-effort, never blocks).
    if (result.deleted && result.imageKey) {
      await deleteUploadedFiles(result.imageKey);
    }

    // Same response whether the token was wrong or the archive was already gone
    // — don't confirm existence of an archive to someone without the token.
    return NextResponse.json(
      { deleted: result.deleted },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not delete that archive." },
      { status: 502 },
    );
  }
}
