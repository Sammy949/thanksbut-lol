import type { Archive } from "@/types/archive";

/**
 * Placeholder archive data for the UI phase. Mirrors the Stitch mockups so the
 * wall looks real before Convex is wired. Replaced entirely by live data later.
 *
 * Timestamps are relative to module-load time so the "x ago" labels stay sane.
 */
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const now = Date.now();

const img = (seed: string) => `https://picsum.photos/seed/${seed}/640/480?grayscale`;

export const MOCK_ARCHIVES: Archive[] = [
  {
    id: "rej-0984",
    company: "Big Tech Co",
    category: "job",
    image: img("bigtech"),
    text: "While we were impressed with your background, we have decided to move forward with a candidate whose experience more closely aligns with our current needs.",
    stamp: "REJECTED",
    reactions: 12,
    createdAt: now - 2 * HOUR,
  },
  {
    id: "rej-0985",
    company: "Cool Startup",
    category: "internship",
    image: img("startup"),
    text: "We received a record number of applications this year. Unfortunately, we cannot offer you a position for the summer cohort.",
    caption: "Thought I had this one 🥲",
    reactions: 8,
    createdAt: now - 5 * HOUR,
  },
  {
    id: "rej-0986",
    company: "Ivy League U",
    category: "university",
    text: "The Admissions Committee has carefully reviewed your application, and I am sorry to inform you that we are unable to offer you a place in this year's class.",
    stamp: "GHOSTED",
    reactions: 45,
    createdAt: now - 1 * DAY,
  },
  {
    id: "rej-0987",
    company: "Global Agency",
    category: "job",
    image: img("agency"),
    text: "We will keep your resume on file should another position open up that matches your skillset.",
    reactions: 3,
    createdAt: now - 2 * DAY,
  },
  {
    id: "rej-0988",
    company: "The Grant Council",
    category: "scholarship",
    text: "After careful deliberation, the committee has chosen not to fund your proposal in this cycle. We encourage you to reapply next year.",
    displayName: "still trying",
    reactions: 27,
    createdAt: now - 3 * DAY,
  },
  {
    id: "rej-0989",
    company: "Hack the Future",
    category: "hackathon",
    image: img("hackathon"),
    text: "Thank you for your application to the finals. The judges had a difficult decision, and your team was not selected to advance.",
    stamp: "REJECTED",
    reactions: 16,
    createdAt: now - 4 * DAY,
  },
];
