# convex/

Backend lives here — **not built yet** (by design; V1 starts as a placeholder UI).

When the backend begins:

1. Run `npx convex dev` — creates the deployment, writes `convex/_generated/`,
   and prints `NEXT_PUBLIC_CONVEX_URL` + `CONVEX_DEPLOYMENT` for `.env.local`.
2. Add `schema.ts` defining the `archives` table (map it onto
   [`types/archive.ts`](../types/archive.ts)).
3. Add query/mutation functions (list archives, submit, react).

The `Providers` component already wires `ConvexProvider` automatically once
`NEXT_PUBLIC_CONVEX_URL` is set.
