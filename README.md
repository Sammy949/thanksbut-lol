# thanksbut.lol

**Thanks, but...** — the internet's archive of rejection emails. Archive yours.

A small internet project, not a startup. Inspired by a tweet about a "Rejection
Wall of Fame". The whole product is: land → scroll the wall → maybe archive your
own rejection screenshot → leave.

> **Guiding rule:** every feature must make the joke better. If it doesn't make
> someone archive a rejection faster, or browsing the wall more fun, it doesn't
> belong in V1.

This repo is currently a **scaffolded foundation** — providers, tooling and
typed placeholder components are in place; the UI and backend are intentionally
not built yet.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui ·
Convex · UploadThing · next-themes · React Hook Form · Zod · sonner ·
lucide-react. Package manager: **bun**.

## Getting started

```bash
bun install
bun dev          # http://localhost:3000
```

Optional env (the placeholder UI runs without it) — copy `.env.example` to
`.env.local` and fill in once the backend/upload flow are built.

## Scripts

| Script              | Does                   |
| ------------------- | ---------------------- |
| `bun dev`           | Dev server (Turbopack) |
| `bun run build`     | Production build       |
| `bun run lint`      | ESLint                 |
| `bun run typecheck` | `tsc --noEmit`         |
| `bun run format`    | Prettier write         |

## Structure

```
app/                     routes, layout, providers, /api/uploadthing
components/
  ui/                    shadcn primitives (button, sonner)
  layout/                navbar
  shared/                hero, stats
  archive/               archive-wall, archive-card, category-filters
  upload/                upload-drawer
convex/                  backend (not built yet — see convex/README.md)
hooks/                   client hooks (empty for now)
lib/                     utils (cn), uploadthing helpers
types/                   domain types (Archive)
constants/               categories, site copy
notes/                   product decisions & design notes
```
