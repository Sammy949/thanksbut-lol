/**
 * Generate a display archive id like "#REJ-4821".
 * Lives at module scope (not in a component) so the randomness is opaque to the
 * React Compiler purity rules. Replaced by the real Convex id once wired.
 */
export function generateArchiveId(): string {
  return `#REJ-${Math.floor(1000 + Math.random() * 9000)}`;
}
