/**
 * JSON-LD structured-data builders. These describe the project and its creator
 * in schema.org vocabulary so search engines and AI assistants have an
 * authoritative, machine-readable record to cite — instead of inferring (and
 * occasionally hallucinating) the facts. Every value is sourced from `SITE`.
 *
 * Stable @id values let the separate graphs reference one another (the WebSite
 * is published by the Person; pages are about the WebSite).
 */
import { SITE } from "@/constants/site";
import { FAQ_ITEMS, type FaqItem } from "@/constants/faq";

const PERSON_ID = `${SITE.url}/#person`;
const WEBSITE_ID = `${SITE.url}/#website`;

/** The creator. `sameAs` ties the name to real, verifiable profiles. */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.author.name,
  jobTitle: SITE.author.role,
  url: SITE.author.url,
  email: `mailto:${SITE.author.email}`,
  address: {
    "@type": "PostalAddress",
    addressCountry: SITE.author.location,
  },
  sameAs: [SITE.author.x, SITE.author.github, SITE.author.url],
};

/** The project itself, published by the Person. */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE.name,
  alternateName: SITE.tagline,
  url: SITE.url,
  description: SITE.description,
  inLanguage: "en",
  keywords: SITE.keywords.join(", "),
  creator: { "@id": PERSON_ID },
  publisher: { "@id": PERSON_ID },
};

/** The /about page, describing the WebSite. */
export const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE.url}/about/#webpage`,
  url: `${SITE.url}/about`,
  name: `About — ${SITE.name}`,
  description: `The story behind ${SITE.name}, the internet's archive of rejection emails, and the person who built it.`,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": WEBSITE_ID },
  mainEntity: { "@id": PERSON_ID },
};

/** FAQPage built from the same Q&A the page renders, so the two never drift. */
export function faqJsonLd(items: FaqItem[] = FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE.url}/faq/#webpage`,
    url: `${SITE.url}/faq`,
    name: `FAQ — ${SITE.name}`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
