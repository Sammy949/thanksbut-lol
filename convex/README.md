# convex/

The thanksbut.lol backend. Schema + functions are written; they just need a
deployment to come alive.

## One-time setup

```bash
npx convex dev
```

This authenticates, provisions a dev deployment, writes `convex/_generated/`
(the typed client), and adds `NEXT_PUBLIC_CONVEX_URL` + `CONVEX_DEPLOYMENT` to
`.env.local`. The `Providers` component wires `ConvexProvider` automatically
once the URL is set. Then seed sample data:

```bash
npx convex run seed:run
```

## Layout

- `schema.ts` — `archives`, `reactions`, `reports` tables + indexes
  (`by_status`, `by_category` for newest-first/filtered feeds).
- `archives.ts` — `list` (paginated + category), `getById`, `stats`, `create`.
- `reactions.ts` — `toggle` (one 🥲 per identity).
- `reports.ts` — `create` (spam / pii / harassment / other).
- `seed.ts` — sample archives (`seed:run`).
- `lib/` — `serialize` (Doc → API shape) and `identity` (anonymous visitor now,
  account-ready later).

## Frontend coupling

The frontend references these functions by name via
[`lib/convex-api.ts`](../lib/convex-api.ts) (typed `makeFunctionReference`),
**not** `_generated/api` — so the app typechecks and builds before a deployment
exists. Data hooks live in [`hooks/`](../hooks). Shared validation is in
[`lib/validation.ts`](../lib/validation.ts) (used by both sides).
