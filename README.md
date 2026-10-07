# thanksbut.lol

**Thanks, but...** — the internet's archive of rejection emails. Archive yours.

A small internet project. Browse the wall, share a rejection screenshot or text,
leave a 🥲, and carry on.

> Every feature must make the joke better. If it doesn't make someone archive a
> rejection faster or browsing the wall more fun, it doesn't belong.

## What's implemented

- Live paginated wall, category filters, artifact inspection, and share links.
- Anonymous screenshot or text submissions with optional company, caption, and name.
- Browser-side image cropping, redaction, and compression before upload.
- One reaction per anonymous session and a reporting flow.
- Private management links for self-service deletion, without accounts.
- Owner moderation: inspect reports, dismiss them, remove posts, or redact images.
- Light/dark themes, About/FAQ pages, social cards, and search metadata.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Radix/shadcn UI,
Convex, UploadThing, React Hook Form, and Zod. Package manager: Bun.

## Local development

```bash
bun install --frozen-lockfile
bun dev
```

Open `http://localhost:3000`. Without `NEXT_PUBLIC_CONVEX_URL`, the homepage shows
sample archives. This is a browsing preview; submissions and backend actions
require the services below. The sample wall's reactions are local UI state.

### Enable the backend

Copy `.env.example` to `.env.local`, then configure a **development** deployment:

```bash
bunx convex dev
```

This provisions/syncs Convex and regenerates `convex/_generated/`. Those generated
files are tracked so a fresh checkout can typecheck without deployment access.
The frontend currently uses explicit typed references in `lib/convex-api.ts`;
keep their argument and return types aligned with the backend functions.

Configure `UPLOADTHING_TOKEN` to enable image uploads. Set the session and admin
variables documented in `.env.example`. The shared Convex secrets must have
matching values in both the Next environment and the Convex deployment.

Optional sample data for an empty development database:

```bash
bunx convex run seed:run
```

Keep credentials in environment files or service settings. Never commit them.

## Verification and working conventions

```bash
bun run check       # lint + frontend and Convex typechecks
bun run build       # production compilation and prerendering
```

CI runs these commands on pull requests and pushes to `main`, using the sample
wall configuration without service credentials. Builds fetch the web fonts via
`next/font/google`, so they need network access. These checks do not prove live
Convex or UploadThing behavior; exercise the affected flow against development
services when changing integrations.

Work on a focused branch, use commits that describe one coherent change, and
review the diff before opening a pull request. Keep Bun's lockfile current when
changing dependencies. Regenerate and commit Convex types when changing its API.

Other commands: `bun run lint`, `bun run typecheck`, `bun run typecheck:convex`,
`bun run format:check`, and `bun run format`. Formatting writes across the project;
prefer formatting only changed files during focused cleanup.

## Code map

| Location               | Responsibility                                                      |
| ---------------------- | ------------------------------------------------------------------- |
| `app/`                 | Pages, metadata, providers, and server API routes                   |
| `components/archive/`  | Wall, filters, inspection, reactions, and report dialogs            |
| `components/upload/`   | Submission drawer, preview, image editor, and success view          |
| `components/admin/`    | Report inspection and moderation controls                           |
| `convex/`              | Archive, reaction, and report storage/functions                     |
| `hooks/`               | Live queries, submission, sessions, reactions, and share targets    |
| `lib/`                 | Validation, service references, session guards, and image utilities |
| `types/`, `constants/` | Domain shapes, categories, site copy, and sample archives           |

## Current operational limits

- Signed cookies prevent session forgery; they do not prevent visitors obtaining
  fresh sessions. IP rate limits are best effort and reset per server instance.
- Archive creation validates image metadata but does not verify upload ownership.
- Deleting or replacing images attempts CDN file cleanup. Failures are currently
  swallowed, with no durable retry queue, so database removal does not guarantee
  immediate file removal.
- Submissions appear immediately and are moderated after reports.
- The archive total and moderation queue collect matching rows, suitable for a
  small archive; revisit them as volume grows.
