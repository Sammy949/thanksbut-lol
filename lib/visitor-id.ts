/**
 * Anonymous browser identity. A UUID stored in localStorage — no account, no
 * cookie, no server. This is the seam for future auth: swap the source here and
 * nothing else changes (the Convex side already abstracts it via resolveIdentity).
 */

const STORAGE_KEY = "tbl_visitor_id";

/** Get (or lazily create) the visitor id. Returns "" during SSR. */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage can throw in private mode — fall back to an ephemeral id.
    return crypto.randomUUID();
  }
}
