import { SITE } from "@/constants/site";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const alt = `FAQ — ${SITE.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "FAQ · THE FINE PRINT",
    title: "Questions, duly answered.",
    subtitle:
      "What it is, why it exists, who built it, and how the archive stays safe.",
    path: `${SITE.name}/faq`,
    stamps: [
      { label: "FILED", top: 90, left: 100, rotate: -12, fontSize: 30 },
      { label: "Q&A", bottom: 96, right: 120, rotate: 9, fontSize: 30, opacity: 0.8 },
    ],
  });
}
