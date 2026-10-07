"use client";

import { Suspense } from "react";
import { ArchiveLoading } from "./archive-loading";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { Hero } from "@/components/shared/hero";
import { MOCK_ARCHIVES } from "@/constants/mock-archives";
import { ArchiveFeed } from "./archive-feed";
import { LiveArchiveFeed } from "./live-archive-feed";

/**
 * Source selector for the homepage. When a Convex deployment is configured we
 * render the live wall (paginated query + reactions + reporting); otherwise we
 * fall back to the mock data so the locked UI still renders with no backend.
 * The env var is inlined at build time, so exactly one branch ships per build.
 */
const CONVEX_ENABLED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

function LiveBoard() {
  const stats = useQuery(api.archives.stats);
  return (
    <>
      <Hero count={stats?.total} />
      <Suspense fallback={<ArchiveLoading />}>
        <LiveArchiveFeed />
      </Suspense>
    </>
  );
}

function MockBoard() {
  return (
    <>
      <Hero sample />
      <p className="text-secondary mx-auto px-5 text-center font-mono text-sm">
        Sample wall. These are example rejections; submissions, reactions, and reports
        are unavailable.
      </p>
      <ArchiveFeed archives={MOCK_ARCHIVES} previewMode />
    </>
  );
}

export function ArchiveBoard() {
  return CONVEX_ENABLED ? <LiveBoard /> : <MockBoard />;
}
