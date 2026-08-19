/**
 * GET /api/admin/reports — open reports (joined with their archives) for the
 * moderation dashboard. Owner-only: requires a valid admin cookie.
 */

import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";

import { api } from "@/lib/convex-api";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const items = await fetchQuery(api.reports.listOpen, { secret: guard.secret });
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Could not load reports." }, { status: 502 });
  }
}
