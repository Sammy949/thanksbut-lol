/**
 * GET /api/admin/image-proxy?url=<uploadthing url> — owner-only image relay.
 *
 * Why this exists: the redaction editor loads the artifact into a <canvas> and
 * exports the redacted result. A cross-origin CDN image taints the canvas, so
 * the export throws a SecurityError. Fetching the bytes here and streaming them
 * back from our OWN origin means the browser sees a same-origin image and the
 * canvas stays exportable — no CORS gymnastics on the UploadThing side.
 *
 * SSRF guard: only URLs on the configured UploadThing CDN hosts are fetched
 * (utfs.io or *.ufs.sh — see next.config.ts remotePatterns). The `url` comes
 * from the owner-gated listOpen query in practice, but we re-validate the host
 * here so this route can never be turned into a general-purpose fetcher.
 */

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** True for exactly `utfs.io` or any `*.ufs.sh` subdomain — nothing else. */
function isUploadThingHost(hostname: string): boolean {
  return hostname === "utfs.io" || hostname.endsWith(".ufs.sh");
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "url required." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url." }, { status: 400 });
  }
  if (target.protocol !== "https:" || !isUploadThingHost(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed." }, { status: 400 });
  }

  try {
    const upstream = await fetch(target, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Could not fetch the image." },
        { status: 502 },
      );
    }
    // Stream the bytes straight back, same-origin, with the upstream content type.
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch the image." }, { status: 502 });
  }
}
