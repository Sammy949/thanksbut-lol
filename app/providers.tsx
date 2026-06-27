"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SubmissionProvider } from "@/components/upload/submission-provider";

/**
 * Always mount a ConvexProvider. Convex hooks live in always-rendered components
 * (e.g. the submission drawer's `useMutation`), so a missing provider would
 * crash prerender whenever NEXT_PUBLIC_CONVEX_URL isn't set at build time. The
 * placeholder keeps the client valid without connecting; live reads stay gated
 * on the real URL (see ArchiveBoard), so no URL simply means the mock wall.
 */
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={200}>
          <SubmissionProvider>{children}</SubmissionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}
