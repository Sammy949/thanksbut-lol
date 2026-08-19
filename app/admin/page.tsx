"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Trash2, Check, ArrowLeft, ShieldAlert } from "lucide-react";

import type { OpenReportItem } from "@/lib/convex-api";
import { REPORT_REASON_LABELS } from "@/types/report";
import { CATEGORY_LABELS } from "@/constants/categories";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const act = async (
    archiveId: string,
    kind: "remove" | "dismiss",
  ) => {
    setPending((p) => ({ ...p, [archiveId]: kind }));
    try {
      const res = await fetch(`/api/admin/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ archiveId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      // Drop the actioned item from the list.
      setItems((cur) => cur?.filter((it) => it.archiveId !== archiveId) ?? cur);
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

  const signOut = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "same-origin" });
    onSignOut();
  };

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
            onRemove={() => act(item.archiveId, "remove")}
            onDismiss={() => act(item.archiveId, "dismiss")}
          />
        ))}
      </div>
    </div>
  );
}

function ReportRow({
  item,
  pending,
  onRemove,
  onDismiss,
}: {
  item: OpenReportItem;
  pending: "remove" | "dismiss" | undefined;
  onRemove: () => void;
  onDismiss: () => void;
}) {
  const a = item.archive;
  // Count reasons for a compact summary (e.g. "pii ×2, spam").
  const reasonCounts = item.reasons.reduce<Record<string, number>>((acc, r) => {
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="paper-card flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
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
