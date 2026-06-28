import type { Metadata } from "next";
import { EB_Garamond, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { SITE } from "@/constants/site";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Providers } from "./providers";
import "./globals.css";

// Display / headlines / narrative — literary serif.
const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// UI / labels / metadata / typed-letter bodies — the "archivist's hand".
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.tagline} — ${SITE.name}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  icons: { icon: "/api/favicon" },
  openGraph: {
    title: `${SITE.tagline} — ${SITE.name}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.tagline} — ${SITE.name}`,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${garamond.variable} ${spaceMono.variable} h-full overflow-x-clip antialiased`}
    >
      <body className="font-body bg-paper-grain flex min-h-full flex-col overflow-x-clip">
        <Providers>
          <Navbar />
          <main className="min-w-0 flex-1">{children}</main>
          <SiteFooter />
        </Providers>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
