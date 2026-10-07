import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "retry screenshot cleanup",
  { minutes: 5 },
  internal.cleanupJobs.retryDue,
  {},
);
export default crons;
