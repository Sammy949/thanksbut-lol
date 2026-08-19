"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";

import { api } from "@/lib/convex-api";
import { CATEGORY_LABELS } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StampMark } from "@/components/archive/stamp-mark";

/**
 * Self-serve manage page. Reached via the private link from the success screen:
 * `/manage/<id>#<manageToken>`. The token lives in the URL fragment so it never
 * reaches the server or CDN access logs; we read it client-side and send it only
 * in the POST body to `/api/manage/delete`.
 */
export default function ManagePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [phase, setPhase] = React.useState<"idle" | "deleting" | "done">("idle");

  // The manage token lives in the URL fragment — client-only, never sent to the
  // server or logged. Read it from the external store (no effect+setState).
  const token = React.useSyncExternalStore(
    () => () => {},
    () => window.location.hash.slice(1) || null,
    () => null,
  );

  // Show what they're about to delete (public fields only; safe pre-delete peek).
  const archive = useQuery(api.archives.getById, id ? { id } : "skip");

  const handleDelete = async () => {
    if (!token) return;
    setPhase("deleting");
    try {
      const res = await fetch("/api/manage/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id, manageToken: token }),
      });
      const data = (await res.json().catch(() => null)) as {
        deleted?: boolean;
      } | null;
      if (res.ok && data?.deleted) {
        setPhase("done");
        toast.success("Removed", { description: "Your artifact is gone from the wall." });
      } else {
        setPhase("idle");
        toast.error("Couldn't remove that", {
          description:
            res.status === 429
              ? "Too many attempts — wait a moment."
              : "This link may be wrong, or the post is already gone.",
        });
      }
    } catch {
      setPhase("idle");
      toast.error("Network error", { description: "Please try again." });
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 py-16 md:px-16">
      <div className="paper-card relative -rotate-1 p-8">
        <StampMark
          label={phase === "done" ? "Removed" : "Manage"}
          className="absolute -top-3 right-6 text-[18px]"
        />

        {phase === "done" ? (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-headline-md text-primary font-display">
                It&apos;s gone.
              </h1>
              <p className="text-on-surface-variant text-body-md mt-2 font-mono">
                The artifact and its screenshot have been permanently deleted from the
                archive.
              </p>
            </div>
            <Button asChild variant="secondary" shape="sheet" className="w-fit">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back to the wall
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-headline-md text-on-surface font-display">
                Remove this artifact?
              </h1>
              <p className="text-on-surface-variant text-body-md mt-2 font-mono">
                This permanently deletes your post and its screenshot. It can&apos;t be
                undone.
              </p>
            </div>

            {!token && (
              <p className="border-error/40 text-error border border-dashed p-3 font-mono text-xs">
                No manage key found in this link. Use the full link you saved when you
                submitted — it ends with <span className="font-bold">#…</span>
              </p>
            )}

            {/* What they're deleting */}
            {archive === undefined ? (
              <div className="text-secondary flex items-center gap-2 font-mono text-xs">
                <Loader2 className="size-4 animate-spin" /> Loading artifact…
              </div>
            ) : archive === null ? (
              <p className="text-secondary font-mono text-xs">
                This artifact isn&apos;t on the wall (already removed, or the link is
                wrong).
              </p>
            ) : (
              <div className="border-outline-variant bg-surface-container-low border p-4">
                <div className="border-outline-variant mb-3 flex items-center justify-between gap-2 border-b border-dashed pb-2">
                  <span className="text-on-surface truncate font-mono text-sm font-bold">
                    {archive.company ?? "Anonymous"}
                  </span>
                  <Badge variant="square">{CATEGORY_LABELS[archive.category]}</Badge>
                </div>
                {archive.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- natural-ratio artifact
                  <img
                    src={archive.image.url}
                    alt="Your artifact"
                    className="max-h-48 w-full object-contain"
                  />
                ) : (
                  <p className="text-on-surface-variant line-clamp-4 font-mono text-xs leading-relaxed">
                    {archive.text}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="accent"
                shape="sheet"
                disabled={!token || phase === "deleting"}
                onClick={handleDelete}
              >
                {phase === "deleting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Removing…
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" /> Delete permanently
                  </>
                )}
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
