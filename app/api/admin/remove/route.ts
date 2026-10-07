/**
 * POST /api/admin/remove — take an archive off the wall (owner moderation).
 * Body: { archiveId: string }. Soft-deletes the row (status:"removed"),
 * resolves its reports, and deletes the screenshot from UploadThing.
 */

import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/lib/convex-api";
import { requireAdmin } from "@/lib/admin-guard";
import { completeFileCleanup } from "@/lib/cleanup-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
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

  try {
    const result = await fetchMutation(api.archives.moderateRemove, {
      archiveId,
      secret: guard.secret,
    });
    const screenshotCleanup = result.removed
      ? await completeFileCleanup(result.imageKey, result.cleanupId, guard.secret, true)
      : "not-needed";

    return NextResponse.json(
      { removed: result.removed, screenshotCleanup },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Could not remove that." }, { status: 502 });
  }
}
