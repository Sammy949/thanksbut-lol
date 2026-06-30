import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared builder for the branded OG/Twitter cards (1200×630). The homepage card
 * predates this and stays hand-rolled; /about and /faq render through here so
 * the letterpress frame, fonts, stamps, and domain footer stay identical and
 * only the headline copy changes per route.
 *
 * Design tokens mirror app/globals.css (light "paper" theme):
 *   paper #fafaf5 · ink #1a1c19 · umber #5b403d · stamp red #b91c1c · frame #8f6f6c
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#fafaf5";
const INK = "#1a1c19";
const UMBER = "#5b403d";
const STAMP = "#b91c1c";
const FRAME = "#8f6f6c";

async function font(file: string) {
  return readFile(join(process.cwd(), "app/fonts", file));
}

type Stamp = {
  label: string;
  rotate: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  fontSize?: number;
  opacity?: number;
};

type OgCard = {
  /** Small uppercase mono label above the title (pass it already in caps). */
  eyebrow: string;
  /** Garamond headline — the focal line. */
  title: string;
  /** Mono supporting line beneath the title. */
  subtitle: string;
  /** Domain + path shown bottom-centre, e.g. "thanksbut.lol/about". */
  path: string;
  /** Two-ish rubber stamps scattered to the corners. */
  stamps: Stamp[];
};

export async function renderOgCard({
  eyebrow,
  title,
  subtitle,
  path,
  stamps,
}: OgCard) {
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
        {stamps.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              // Only the sides this stamp actually anchors to — Satori trips on
              // undefined style values, so we never emit an unset edge.
              ...(s.top !== undefined ? { top: s.top } : {}),
              ...(s.bottom !== undefined ? { bottom: s.bottom } : {}),
              ...(s.left !== undefined ? { left: s.left } : {}),
              ...(s.right !== undefined ? { right: s.right } : {}),
              transform: `rotate(${s.rotate}deg)`,
              border: `4px solid ${STAMP}`,
              color: STAMP,
              opacity: s.opacity ?? 0.85,
              padding: "8px 18px",
              fontSize: s.fontSize ?? 28,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            {s.label}
          </div>
        ))}

        {/* Eyebrow. */}
        <div
          style={{
            fontFamily: "Space Mono",
            fontSize: 24,
            letterSpacing: 5,
            color: UMBER,
            marginBottom: 22,
          }}
        >
          {eyebrow}
        </div>

        {/* Headline. */}
        <div
          style={{
            display: "flex",
            fontFamily: "EB Garamond",
            fontSize: 92,
            fontWeight: 700,
            color: INK,
            lineHeight: 1.04,
            textAlign: "center",
            maxWidth: 940,
            marginBottom: 26,
          }}
        >
          {title}
        </div>

        {/* Subtitle. */}
        <div
          style={{
            display: "flex",
            fontFamily: "Space Mono",
            fontSize: 28,
            color: UMBER,
            maxWidth: 800,
            textAlign: "center",
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </div>

        {/* Domain + path footer. */}
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
          {path}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "EB Garamond", data: garamond, weight: 700, style: "normal" },
        { name: "Space Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
