"use client";
import { useSearchParams } from "next/navigation";

/** Keep public entry URLs intact and react to repeated client-side navigation. */
export function useShareTarget(): string | null {
  return useSearchParams().get("a");
}
