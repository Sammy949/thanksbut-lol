"use client";

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
      <Hero count={stats?.total ?? 0} />
      <LiveArchiveFeed />
    </>
  );
}

function MockBoard() {
  return (
    <>
      <Hero count={MOCK_ARCHIVES.length} />
      <ArchiveFeed archives={MOCK_ARCHIVES} />
    </>
  );
}

export function ArchiveBoard() {
  return CONVEX_ENABLED ? <LiveBoard /> : <MockBoard />;
}
