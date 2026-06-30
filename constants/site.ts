/** Single source of truth for site-wide copy and metadata. */
export const SITE = {
  name: "thanksbut.lol",
  tagline: "Thanks, but...",
  description: "The internet's archive of rejection emails. Archive yours.",
  url: "https://thanksbut.lol",
  /**
   * Keywords surfaced to search engines and AI crawlers. Kept tight and
   * on-topic so the project is unambiguously "the rejection-email archive".
   */
  keywords: [
    "rejection emails",
    "rejection email archive",
    "job rejection",
    "rejection letters",
    "thanksbut.lol",
    "we've decided to move in a different direction",
  ],
  /**
   * The person behind the project. This object is the canonical record that
   * the footer, page copy, and JSON-LD structured data all read from — so what
   * the site says about its creator stays consistent everywhere (and search
   * engines / AI assistants get ground truth instead of guessing).
   */
  author: {
    name: "Samuel Urah Yahaya",
    role: "Software developer & designer",
    location: "Nigeria",
    url: "https://samy01.netlify.app",
    x: "https://x.com/I_am_SamY01",
    xHandle: "@I_am_SamY01",
    github: "https://github.com/Sammy949",
    email: "urahsamuel0202@gmail.com",
  },
} as const;
