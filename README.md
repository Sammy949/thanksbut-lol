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
- Progressive screenshot previews, reserved image proportions, and image retry states.
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
require the services below. Sample mode clearly labels its examples and disables backend actions.

### Enable the backend

Copy `.env.example` to `.env.local`, then configure a **development** deployment:

```bash
bunx convex dev
```

This provisions/syncs Convex and regenerates `convex/_generated/`. Those generated
files are tracked so a fresh checkout can typecheck without deployment access.
The frontend currently uses explicit typed references in `lib/convex-api.ts`;
keep their argument and return types aligned with the backend functions.

Configure `UPLOADTHING_TOKEN` in Next and Convex to enable uploads and durable
screenshot cleanup. Both must refer to the same UploadThing project. Set the session and admin
variables documented in `.env.example`. The shared Convex secrets must have
matching values in both the Next environment and the Convex deployment.

Optional sample data for an empty development database:

```bash
bunx convex run seed:run
```

Keep credentials in environment files or service settings. Never commit them.

## Verification and working conventions

```bash
bun run check       # lint + frontend/Convex typechecks + regression tests
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

Other commands: `bun run lint`, `bun run typecheck`, `bun run typecheck:convex`, `bun run test`,
`bun run format:check`, and `bun run format`. Formatting writes across the project;
prefer formatting only changed files during focused cleanup.

For image-editor changes, run `node scripts/verify-redaction.mjs` after building.
It uses Playwright and synthetic screenshots to check drawing, moving, resizing,
touch input, preview/export alignment, and crop changes. Playwright must be
available to Node, or selected through `PLAYWRIGHT_MODULE`; `CHROME_BIN` can
select an installed Chromium. This optional browser check runs locally and saves
its screenshots in a temporary directory, without contacting backend services.

For progressive-image changes, run `node scripts/verify-progressive-images.mjs`
after building, with the same Playwright/Chromium options. It checks delayed and
cached loads, desktop/mobile crops, portrait lightboxes, image retry, replacement
races, lazy loading, reduced motion, no-JavaScript display, and final-file preview
generation. Upload and publication services are stubbed in this browser check.

`lib/image.ts` prepares dimensions and a tiny inline raster preview from the final
cropped/redacted file while the main upload runs. Preparation stops waiting after
five seconds; missing preview metadata does not block publishing. Cards and the
lightbox use stored metadata, including metadata already present on older posts.
Posts without it use a neutral loading surface and learn proportions when loaded.
Admin replacements regenerate the preview from the replacement file. No separate
preview file is uploaded, and no backfill is performed. Loading blur is not privacy
redaction and does not reduce the full screenshot's download size.

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
- Deleting or replacing images records cleanup work transactionally. Next attempts
  cleanup immediately; failed cleanup is retried by Convex every five minutes with
  backoff up to a day. Owner moderation displays pending cleanup counts. Removal
  from the archive does not guarantee removal of copies saved or shared elsewhere.
- Completed uploads not attached to a post expire after 24 hours. Publication claims
  the upload transactionally; uploads whose cleanup has begun cannot be published.
  Expired upload records are retained to prevent late attachment of deleted files.
- Submissions appear immediately and are moderated after reports.
- The archive total and moderation queue collect matching rows, suitable for a
  small archive; revisit them as volume grows.

## Trust and flow checks

Functional UI uses “rejection” for archive content, “submission” in forms, and
“post” for removal/moderation. Contributor text and the paper/stamp identity stay
intact. Images upload only on Archive Yours, and success requires confirmed
publication. Private deletion links are separate from public sharing links.

Before deploying these changes, set `UPLOADTHING_TOKEN` on the Convex deployment
and deploy the backend before the frontend. The upload callback requires the
new cleanup tracking mutation. Existing uploads are not retroactively registered;
removal/replacement creates cleanup jobs for them when requested.

`node scripts/verify-flows.mjs` (same Playwright/Chromium options as the redaction
check) exercises actual components with synthetic entries and stubbed services.
It checks validation, submission states, clipboard fallback, reporting, reactions,
moderation, deletion, browsing, and mobile scrolling without live service writes.
Dialog checks verify document scroll locking, internal scrolling, keyboard and
wheel input at scroll boundaries, mobile touch gestures, report handoff, and
restored archive position.
