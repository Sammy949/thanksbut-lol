"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";

/**
 * Convex client is created only when a deployment URL is configured.
 * The backend isn't built yet, so the app must run fine without it —
 * when NEXT_PUBLIC_CONVEX_URL is absent we simply skip the ConvexProvider.
 */
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function Providers({ children }: { children: ReactNode }) {
  const themed = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );

  return convex ? <ConvexProvider client={convex}>{themed}</ConvexProvider> : themed;
}
