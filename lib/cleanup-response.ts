import { fetchMutation } from "convex/nextjs";
import { api } from "./convex-api";
import { deleteUploadedFiles } from "./uploadthing-admin";

export async function completeFileCleanup(
  key: string | null,
  cleanupId: string | null | undefined,
  secret: string,
  admin: boolean,
) {
  if (!key) return "not-needed" as const;
  if (!(await deleteUploadedFiles(key))) return "pending" as const;
  if (cleanupId) {
    // A lost acknowledgement leaves a safe, idempotent retry in the durable queue.
    await fetchMutation(api.cleanupJobs.confirm, {
      id: cleanupId,
      secret,
      admin,
    }).catch(() => undefined);
  }
  return "confirmed" as const;
}
