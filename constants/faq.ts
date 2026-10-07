/**
 * Canonical question/answer pairs for the project. Rendered on /faq AND emitted
 * as FAQPage JSON-LD, so search engines and AI assistants quote the same answers
 * a human reads — keep this the single source of truth.
 *
 * An answer is usually plain prose. When it needs an inline link, write it as an
 * ordered list of segments (strings + `{ text, href }` links); the page renders
 * real <a> elements and `answerHtml()` serialises the same content to HTML for
 * the JSON-LD (FAQPage answer text may contain links).
 */
export type AnswerLink = { text: string; href: string };
export type AnswerSegment = string | AnswerLink;

export type FaqItem = {
  question: string;
  answer: string | AnswerSegment[];
};

/** The tweet that kicked the whole thing off — also linked on /about. */
export const ORIGIN_TWEET_URL = "https://x.com/I_am_SamY01/status/2070859292597510614";

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is thanksbut.lol?",
    answer:
      "A public wall of rejection emails, from jobs, internships, scholarships, hackathons, universities, and beyond. Browse the rejections or archive one of your own.",
  },
  {
    question: "How do I submit a rejection?",
    answer:
      'Choose "Archive Yours", then add a screenshot or paste the rejection text. Choose a category and add an optional organisation, caption, or display name. Review your submission before publishing. No account is required.',
  },
  {
    question: "When does my submission appear?",
    answer:
      "Immediately after publication succeeds. Submissions are not reviewed before appearing on the wall. You can open and share your rejection from the confirmation screen.",
  },
  {
    question: "What should I remove before sharing?",
    answer:
      "Remove personal or sensitive details from screenshots, pasted text, and captions, including names, email addresses, phone numbers, application IDs, and private links. The screenshot editor lets you crop, blur, or cover details with black boxes. A display name is optional, but details inside your submission may still identify you or someone else. Everything you publish on the wall is public.",
  },
  {
    question: "How do reports and moderation work?",
    answer:
      'Use "Report" on a rejection and choose a reason. Reported posts can be reviewed by the owner, who can dismiss reports, remove a post, or redact its screenshot. Report posts that expose personal details, contain harassment or hate speech, or are spam or misleading. A report does not automatically remove a post.',
  },
  {
    question: "How do I remove my post?",
    answer:
      "Save the private deletion link shown after submitting. Anyone with this link can remove your post, so keep it private and use the separate public sharing link. We cannot recover a lost deletion link. Removing a post also requests screenshot cleanup; failed cleanup is retried. Copies saved or shared elsewhere may remain.",
  },
  {
    question: "Who built it, and where did the idea come from?",
    answer: [
      "Samuel Urah Yahaya built thanksbut.lol after a ",
      { text: "tweet", href: ORIGIN_TWEET_URL },
      " about creating a website for rejection emails. The About page tells the build story.",
    ],
  },
];

/** Normalise an answer to its ordered segments. */
export function answerSegments(answer: FaqItem["answer"]): AnswerSegment[] {
  return typeof answer === "string" ? [answer] : answer;
}

/** Serialise an answer to an HTML string (links become <a>) for FAQPage JSON-LD. */
export function answerHtml(answer: FaqItem["answer"]): string {
  return answerSegments(answer)
    .map((seg) =>
      typeof seg === "string" ? seg : `<a href="${seg.href}">${seg.text}</a>`,
    )
    .join("");
}
