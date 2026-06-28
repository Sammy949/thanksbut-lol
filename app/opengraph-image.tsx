import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SITE } from "@/constants/site";

/**
 * Branded homepage OG card (1200×630). Rendered to PNG by Satori at build time
 * and served as a static asset — social scrapers cache the image hard, so a
 * static card is both correct and free at runtime (unlike the per-request
 * favicon, which is cheap and re-rolled). No live count here on purpose: a
 * cached PNG would freeze a stale number. Per-archive cards (phase 2) are where
 * dynamic content earns its keep.
 *
 * Design tokens mirror app/globals.css (light "paper" theme):
 *   paper        #fafaf5   ink          #1a1c19
 *   umber        #5b403d   stamp red    #b91c1c
 *   frame        #8f6f6c
 */

export const alt = `${SITE.tagline} — ${SITE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fafaf5";
const INK = "#1a1c19";
const UMBER = "#5b403d";
const STAMP = "#b91c1c";
const FRAME = "#8f6f6c";

async function font(file: string) {
  return readFile(join(process.cwd(), "app/fonts", file));
}

export default async function OpengraphImage() {
  const [garamond, mono] = await Promise.all([
    font("EBGaramond-700.ttf"),
    font("SpaceMono-Regular.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: PAPER,
          // Inner letterpress frame — reads as an archived document.
          border: `2px solid ${FRAME}`,
          boxShadow: "inset 0 0 0 18px #fafaf5, inset 0 0 0 19px #e4beb9",
          position: "relative",
          fontFamily: "Space Mono",
        }}
      >
        {/* Rubber stamps, scattered like the hero. */}
        <div
          style={{
            position: "absolute",
            top: 86,
            left: 96,
            transform: "rotate(-12deg)",
            border: `4px solid ${STAMP}`,
            color: STAMP,
            opacity: 0.85,
            padding: "8px 18px",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          REJECTED
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 92,
            right: 104,
            transform: "rotate(9deg)",
            border: `4px solid ${STAMP}`,
            color: STAMP,
            opacity: 0.8,
            padding: "8px 18px",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          ARCHIVED
        </div>

        {/* Wordmark. */}
        <div
          style={{
            fontFamily: "EB Garamond",
            fontSize: 150,
            fontWeight: 700,
            color: INK,
            lineHeight: 1,
            marginBottom: 28,
          }}
        >
          {SITE.tagline}
        </div>

        {/* Tagline. */}
        <div
          style={{
            fontFamily: "Space Mono",
            fontSize: 30,
            color: UMBER,
            maxWidth: 720,
            textAlign: "center",
            lineHeight: 1.45,
          }}
        >
          The internet&apos;s archive of rejection emails.
        </div>

        {/* Domain footer. */}
        <div
          style={{
            position: "absolute",
            bottom: 54,
            fontFamily: "Space Mono",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 2,
            color: INK,
          }}
        >
          {SITE.name}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "EB Garamond", data: garamond, weight: 700, style: "normal" },
        { name: "Space Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
