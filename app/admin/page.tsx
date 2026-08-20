"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Trash2, Check, ArrowLeft, ShieldAlert } from "lucide-react";

import type { OpenReportItem } from "@/lib/convex-api";
import { REPORT_REASON_LABELS } from "@/types/report";
import { CATEGORY_LABELS } from "@/constants/categories";
import { formatRelativeTime } from "@/lib/format";
import { useArchiveSubmission } from "@/hooks/use-create-archive";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageEditor } from "@/components/upload/image-editor/image-editor";
import {
  ReportDetailDialog,
  type DetailBusy,
} from "@/components/admin/report-detail-dialog";

type AuthState = "checking" | "out" | "in";

export default function AdminPage() {
  const [auth, setAuth] = React.useState<AuthState>("checking");

  React.useEffect(() => {
    fetch("/api/admin/session", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d: { authed?: boolean }) => setAuth(d.authed ? "in" : "out"))
      .catch(() => setAuth("out"));
  }, []);

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-16">
      {auth === "checking" ? (
        <div className="text-secondary flex items-center gap-2 font-mono text-sm">
          <Loader2 className="size-4 animate-spin" /> Checking access…
        </div>
      ) : auth === "out" ? (
        <LoginGate onAuthed={() => setAuth("in")} />
      ) : (
        <Dashboard onSignOut={() => setAuth("out")} />
      )}
    </div>
  );
}

function LoginGate({ onAuthed }: { onAuthed: () => void }) {
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        onAuthed();
      } else {
        const d = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(d?.error ?? "Login failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="paper-card -rotate-1 p-8">
        <div className="text-primary mb-4 flex items-center gap-2">
          <ShieldAlert className="size-5" />
          <span className="text-label-caps font-mono uppercase">Owner access</span>
        </div>
        <h1 className="text-headline-sm text-on-surface font-display">
          Moderation
        </h1>
        <p className="text-secondary mt-1 mb-6 font-mono text-xs">
          Enter the owner password to review reported artifacts.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="Password"
            className="text-body-md text-on-surface placeholder:text-outline border-outline-variant focus:border-primary border-0 border-b-2 bg-transparent px-0 py-2 font-mono transition-colors focus:ring-0 focus:outline-none"
          />
          <Button type="submit" shape="sheet" disabled={!password || busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Enter"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [items, setItems] = React.useState<OpenReportItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<Record<string, "remove" | "dismiss">>(
    {},
  );

  // Detail dialog: track the open archive by id (not the object) so a refresh
  // after redaction shows the updated image. Redaction has its own busy flag +
  // the File handed to the reused ImageEditor.
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [redacting, setRedacting] = React.useState(false);
  const [editingFile, setEditingFile] = React.useState<File | null>(null);

  const { uploadImage } = useArchiveSubmission();

  const load = React.useCallback(() => {
    // Promise-callback form (not async/await): setState lands inside .then/.catch,
    // which is the sanctioned shape for effect-triggered fetches.
    fetch("/api/admin/reports", { credentials: "same-origin" })
      .then(async (res) => {
        if (res.status === 401) {
          onSignOut();
          return null;
        }
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as { items: OpenReportItem[] };
      })
      .then((d) => {
        if (d) {
          setItems(d.items);
          setError(null);
        }
      })
      .catch(() => setError("Couldn't load reports."));
  }, [onSignOut]);

  React.useEffect(() => {
    load();
  }, [load]);

  const act = async (archiveId: string, kind: "remove" | "dismiss") => {
    setPending((p) => ({ ...p, [archiveId]: kind }));
    try {
      const res = await fetch(`/api/admin/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ archiveId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      // Drop the actioned item from the list, and close the detail dialog if it
      // was showing this one.
      setItems((cur) => cur?.filter((it) => it.archiveId !== archiveId) ?? cur);
      setDetailId((cur) => (cur === archiveId ? null : cur));
      toast.success(kind === "remove" ? "Removed from the wall" : "Reports dismissed");
    } catch {
      toast.error(kind === "remove" ? "Couldn't remove that" : "Couldn't dismiss");
    } finally {
      setPending((p) => {
        const next = { ...p };
        delete next[archiveId];
        return next;
      });
    }
  };

  // Step 1 of redaction: pull the original bytes through the same-origin proxy
  // (so the editor canvas isn't cross-origin tainted) and hand a File to the
  // editor. Mounting the editor hides the dialog (its focus trap would clash).
  const startRedact = async () => {
    const image = items?.find((it) => it.archiveId === detailId)?.archive?.image;
    if (!image) return;
    setRedacting(true);
    try {
      const res = await fetch(
        `/api/admin/image-proxy?url=${encodeURIComponent(image.url)}`,
        { credentials: "same-origin" },
      );
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      setEditingFile(
        new File([blob], "artifact.jpg", { type: blob.type || "image/jpeg" }),
      );
    } catch {
      toast.error("Couldn't open the image for editing");
    } finally {
      setRedacting(false);
    }
  };

  // Step 2: the editor returns a redacted File. Upload it (regenerating dims +
  // blur), then swap it in server-side — which also deletes the original file.
  const finishRedact = async (processed: File) => {
    const id = detailId;
    setEditingFile(null); // unmount editor → the detail dialog reopens
    if (!id) return;
    setRedacting(true);
    try {
      const image = await uploadImage(processed);
      const res = await fetch("/api/admin/replace-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ archiveId: id, image }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.success("Image redacted", {
        description: "The original screenshot was deleted.",
      });
      load(); // refresh so the dialog shows the redacted image
    } catch {
      toast.error("Couldn't save the redacted image");
    } finally {
      setRedacting(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "same-origin" });
    onSignOut();
  };

  const detail = items?.find((it) => it.archiveId === detailId) ?? null;
  const detailBusy: DetailBusy = redacting
    ? "redact"
    : detailId
      ? (pending[detailId] ?? null)
      : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-on-surface font-display">
            Reported artifacts
          </h1>
          <p className="text-secondary mt-1 font-mono text-xs">
            {items === null
              ? "Loading…"
              : `${items.length} artifact${items.length === 1 ? "" : "s"} with open reports`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>

      {error && (
        <p className="border-error/40 text-error border border-dashed p-3 font-mono text-xs">
          {error}
        </p>
      )}

      {items !== null && items.length === 0 && (
        <div className="paper-card -rotate-1 p-10 text-center">
          <p className="text-headline-sm text-on-surface font-display">All clear.</p>
          <p className="text-secondary mt-2 font-mono text-sm">
            No open reports. The wall is clean.
          </p>
          <Button asChild variant="ghost" size="sm" className="mt-4">
            <Link href="/">
              <ArrowLeft className="size-4" /> Back to the wall
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {items?.map((item) => (
          <ReportRow
            key={item.archiveId}
            item={item}
            pending={pending[item.archiveId]}
            onOpen={() => setDetailId(item.archiveId)}
            onRemove={() => act(item.archiveId, "remove")}
            onDismiss={() => act(item.archiveId, "dismiss")}
          />
        ))}
      </div>

      {/* Detail view — hidden while the editor is mounted so their focus traps
          don't fight; reopens (with the refreshed image) when editing ends. Keyed
          on the resolved item, so a refresh that drops it closes cleanly. */}
      <ReportDetailDialog
        item={detail}
        open={detail !== null && editingFile === null}
        onOpenChange={(next) => {
          if (!next && !redacting) setDetailId(null);
        }}
        onRemove={() => detailId && act(detailId, "remove")}
        onDismiss={() => detailId && act(detailId, "dismiss")}
        onRedact={() => void startRedact()}
        busy={detailBusy}
      />

      {editingFile && (
        <ImageEditor
          file={editingFile}
          onCancel={() => setEditingFile(null)}
          onComplete={(processed) => void finishRedact(processed)}
        />
      )}
    </div>
  );
}

function ReportRow({
  item,
  pending,
  onOpen,
  onRemove,
  onDismiss,
}: {
  item: OpenReportItem;
  pending: "remove" | "dismiss" | undefined;
  onOpen: () => void;
  onRemove: () => void;
  onDismiss: () => void;
}) {
  const a = item.archive;
  // Count reasons for a compact summary (e.g. "pii ×2, spam").
  const reasonCounts = item.reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.reason] = (acc[r.reason] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="paper-card flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
      {/* Preview + details: one clickable region that opens the detail dialog.
          The action buttons live outside it, so there are no nested interactives. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Inspect report on ${a?.company ?? "this artifact"}`}
        className="focus-visible:ring-ring flex min-w-0 flex-1 cursor-pointer flex-col gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:flex-row sm:items-start"
      >
        {/* Preview */}
        <div className="bg-surface-container-low border-outline-variant flex h-28 w-full shrink-0 items-center justify-center overflow-hidden border sm:w-40">
          {a?.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- natural-ratio artifact
            <img src={a.image.url} alt="" className="h-full w-full object-cover" />
          ) : a?.text ? (
            <p className="text-on-surface-variant line-clamp-5 p-3 font-mono text-[11px] leading-snug">
              {a.text}
            </p>
          ) : (
            <span className="text-secondary font-mono text-xs">gone</span>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-on-surface font-mono text-sm font-bold">
              {a?.company ?? "Anonymous"}
            </span>
            {a && <Badge variant="square">{CATEGORY_LABELS[a.category]}</Badge>}
            {a?.status === "removed" && (
              <span className="text-error font-mono text-[11px] uppercase">already removed</span>
            )}
          </div>

          {a?.caption && (
            <p className="text-on-surface-variant mt-1 line-clamp-2 font-mono text-xs italic">
              “{a.caption}”
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-primary font-mono text-xs font-bold">
              {item.reportCount} report{item.reportCount === 1 ? "" : "s"}
            </span>
            <span className="text-secondary font-mono text-xs">
              {Object.entries(reasonCounts)
                .map(([r, n]) => `${REPORT_REASON_LABELS[r as keyof typeof REPORT_REASON_LABELS] ?? r}${n > 1 ? ` ×${n}` : ""}`)
                .join(" · ")}
            </span>
            <span className="text-secondary font-mono text-xs" suppressHydrationWarning>
              first flagged {formatRelativeTime(item.firstReportedAt)}
            </span>
          </div>
        </div>
      </button>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
        <Button
          variant="accent"
          size="sm"
          shape="sheet"
          disabled={!!pending || a?.status === "removed"}
          onClick={onRemove}
        >
          {pending === "remove" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="size-4" /> Remove
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          shape="sheet"
          disabled={!!pending}
          onClick={onDismiss}
        >
          {pending === "dismiss" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Check className="size-4" /> Dismiss
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
