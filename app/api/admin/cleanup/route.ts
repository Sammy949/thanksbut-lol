import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/lib/convex-api";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  try {
    const pending = await fetchQuery(api.cleanupJobs.pendingCount, {
      secret: guard.secret,
    });
    return NextResponse.json(pending, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Couldn't check screenshot cleanup." },
      { status: 502 },
    );
  }
}
