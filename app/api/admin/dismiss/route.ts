/**
 * POST /api/admin/dismiss — mark an archive's open reports resolved without
 * removing it (report judged unfounded). Body: { archiveId: string }.
 * Owner-only: requires a valid admin cookie.
 */

import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/lib/convex-api";
import { requireAdmin } from "@/lib/admin-guard";

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
    const result = await fetchMutation(api.reports.dismissForArchive, {
      archiveId,
      secret: guard.secret,
    });
    return NextResponse.json(
      { resolved: result.resolved },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Could not dismiss." }, { status: 502 });
  }
}
