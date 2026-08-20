/**
 * POST /api/admin/replace-image — swap a reported artifact's screenshot for a
 * moderator-redacted version (owner moderation).
 *
 * The client redacts the image on-device and uploads the result to UploadThing
 * first (a new file); this route persists the new image payload onto the archive
 * and then deletes the ORIGINAL file from UploadThing. Leaving the original live
 * would keep the un-redacted screenshot (the PII being redacted) reachable on the
 * CDN forever.
 *
 * Body: { archiveId: string, image: ArchiveImage }. Owner-only (admin cookie).
 */

import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/lib/convex-api";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteUploadedFiles } from "@/lib/uploadthing-admin";
import type { ArchiveImage } from "@/types/archive";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Minimal runtime check that the body carries a well-formed image payload. */
function isArchiveImage(v: unknown): v is ArchiveImage {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.url === "string" &&
    o.url.length > 0 &&
    typeof o.key === "string" &&
    o.key.length > 0 &&
    typeof o.name === "string" &&
    typeof o.size === "number" &&
    typeof o.type === "string"
  );
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let archiveId: unknown;
  let image: unknown;
  try {
    ({ archiveId, image } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof archiveId !== "string" || archiveId.length === 0) {
    return NextResponse.json({ error: "archiveId required." }, { status: 400 });
  }
  if (!isArchiveImage(image)) {
    return NextResponse.json({ error: "Valid image required." }, { status: 400 });
  }

  try {
    const result = await fetchMutation(api.archives.moderateReplaceImage, {
      archiveId,
      image,
      secret: guard.secret,
    });
    // Swap succeeded — purge the original file so the un-redacted image is gone.
    if (result.replaced && result.oldImageKey) {
      await deleteUploadedFiles(result.oldImageKey);
    }
    return NextResponse.json(
      { replaced: result.replaced },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Could not replace the image." }, { status: 502 });
  }
}
