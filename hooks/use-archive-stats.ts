"use client";

import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";

/** Total visible archive count for the hero stat. */
export function useArchiveStats() {
  const stats = useQuery(api.archives.stats, {});
  return {
    total: stats?.total ?? 0,
    isLoading: stats === undefined,
  };
}
