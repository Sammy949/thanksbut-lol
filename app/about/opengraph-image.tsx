import { SITE } from "@/constants/site";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const alt = `About — ${SITE.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "CASE FILE · THE STORY",
    title: "A tweet, then an archive.",
    subtitle: `How ${SITE.name} became the internet's archive of rejection emails.`,
    path: `${SITE.name}/about`,
    stamps: [
      { label: "REJECTED", top: 86, left: 96, rotate: -12, fontSize: 30 },
      { label: "BUILT IN ~24H", bottom: 96, right: 88, rotate: 9, fontSize: 22, opacity: 0.8 },
    ],
  });
}
