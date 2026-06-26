import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

import { SITE } from "@/constants/site";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Providers } from "./providers";
import "./globals.css";

// Display / headlines — high-contrast editorial serif.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Body — sharp, legible grotesque.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

// Labels / metadata — monospace for the "archival database" feel.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.tagline} — ${SITE.name}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
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
      className={`${playfair.variable} ${hanken.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="font-body flex min-h-full flex-col">
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pt-20 md:px-8 md:pt-24">
            {children}
          </main>
          <SiteFooter />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
