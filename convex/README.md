# Backend

Convex stores archives, reactions, and reports. The Next app subscribes to public
reads directly and uses server API routes for reactions, reports, deletion, and
owner moderation. Archive creation is an anonymous public mutation.

## Development

```bash
bunx convex dev
bun run typecheck:convex
```

Use a development deployment. `convex dev` syncs functions and regenerates the
tracked files in `_generated/`; include changed generated files with API changes.
Do not hand-edit them. See the root README and `.env.example` for configuration.

To populate an empty development archive, run `bunx convex run seed:run`. It is
an internal mutation and does nothing if any archive already exists.

## Functions and tables

- `schema.ts`: archives, reactions, and reports with feed/deduplication indexes.
- `archives.ts`: public paginated feed, lookup, totals, creation, token-authorized
  hard deletion, and owner-only removal/image replacement.
- `reactions.ts`: trusted reaction toggle plus internal reconciliation/purge tools.
- `reports.ts`: trusted report creation and owner-only listing/dismissal.
- `lib/identity.ts`: anonymous session identity and shared-secret guards.
- `lib/serialize.ts`: public archive fields; management tokens are never returned.

## Trust boundaries

Next signs anonymous cookies with `REACTION_SESSION_SECRET`. Its reaction/report
routes recover the session from the cookie and pass `CONVEX_REACTION_SECRET` to
Convex. Token-authorized deletion uses the same server secret plus the archive's
private management token. Signed sessions prevent forged cookies, not creation
of multiple fresh sessions.

Owner routes first verify the admin cookie signed with `ADMIN_SESSION_SECRET`,
then use the separate `CONVEX_ADMIN_SECRET`. The owner password is configured in
the Next environment as `ADMIN_PASSWORD`.

Public archive creation uses the shared Zod schema in `lib/validation.ts`. Image
metadata is client supplied; upload ownership is not currently verified.

Self-service deletion hard-deletes an archive and its reaction/report rows.
Moderation removal hides the archive and resolves reports while retaining the
archive row. Both return the image key for Next to attempt UploadThing cleanup;
file cleanup is best effort. Image replacement returns the original key for the
same cleanup path.
