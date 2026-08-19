/**
 * Server-only UploadThing admin helper — deletes the actual stored file.
 *
 * Uploads happen through the file router (`app/api/uploadthing/core.ts`); this
 * is the missing counterpart. Deleting an archive row without deleting its
 * screenshot would leave the file (often the PII we're being asked to remove)
 * live on the UploadThing CDN forever, reachable by anyone with the URL.
 *
 * `UTApi` reads `UPLOADTHING_TOKEN` from the environment automatically. Node
 * runtime only — never import into client code.
 */

import { UTApi } from "uploadthing/server";

let client: UTApi | null = null;
function utapi(): UTApi {
  client ??= new UTApi();
  return client;
}

/**
 * Best-effort delete of stored files by key. Never throws — a failed file
 * delete must not fail the archive delete (the row is already gone; a dangling
 * file can be swept later). Returns whether the delete call succeeded.
 */
export async function deleteUploadedFiles(
  keys: string | string[],
): Promise<boolean> {
  const list = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
  if (list.length === 0) return true;
  try {
    await utapi().deleteFiles(list);
    return true;
  } catch {
    return false;
  }
}
