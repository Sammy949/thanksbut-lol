/**
 * Canonical question/answer pairs for the project. Rendered on /faq AND emitted
 * as FAQPage JSON-LD, so search engines and AI assistants quote the same answers
 * a human reads. Keep answers in plain prose (no markup) — FAQPage structured
 * data expects plain text, and these double as the authoritative record.
 */
export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is thanksbut.lol?",
    answer:
      "thanksbut.lol is the internet's public archive of rejection emails. It collects the \"we've decided to move in a different direction\" messages almost everyone receives — from jobs, internships, scholarships, hackathons, university admissions and more — and turns them into a shared, curated wall. It's intentionally light-hearted: a reminder that rejection is a universal experience, not a personal failing.",
  },
  {
    question: "Why was it created?",
    answer:
      "The idea started after Robinson Honour posted a tweet joking that someone should build a website where people could upload their rejection emails. Instead of letting it stay an idea, Samuel built it. The goal isn't to mock anyone who gets rejected — it's to celebrate persistence, growth, and the stories behind every attempt by making those moments public instead of hidden.",
  },
  {
    question: "Who built thanksbut.lol?",
    answer:
      "thanksbut.lol was designed and built by Samuel Urah Yahaya, a software developer and designer based in Nigeria who builds thoughtful internet projects in public. He designed the experience, built the frontend, wired up the backend with Convex and UploadThing, and deployed and launched it publicly in roughly twenty-four hours.",
  },
  {
    question: "How are submissions moderated?",
    answer:
      "thanksbut.lol is community-driven but actively moderated. Before uploading, contributors are encouraged to remove or blur personal information such as names, email addresses, phone numbers and application IDs — the upload flow includes tools to crop and blur screenshots. Community members can report submissions that break the guidelines. Content may be removed if it exposes personal or sensitive information, contains harassment, hate speech or abuse, is spam or intentionally misleading, or infringes on someone's privacy. The goal is to keep the archive safe, respectful, and focused on resilience rather than embarrassing individuals or organisations.",
  },
  {
    question: "How do I submit a rejection email?",
    answer:
      "Click \"Archive Yours\" anywhere on the site to open the submission flow. You can upload a screenshot of your rejection — using the built-in crop and blur tools to hide any personal details first — or paste the text, add a category and an optional caption, and post it to the wall. Submissions are anonymous by default.",
  },
];
