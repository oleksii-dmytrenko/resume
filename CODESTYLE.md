# CODESTYLE.md

Style contract for **code** — frontend, backend, and app config. Not markdown or docs. Gates: `npm run typecheck`, `npm run lint`.

## Principles

- Brief. No boilerplate, no ceremonial abstractions; a helper earns extraction on its second use.
- Comments state a non-obvious *why* at the line that needs it — never names, types, or control flow.
- Non-defensive. Validate only at trust boundaries (request bodies, cookies, model stream chunks); everywhere else fail loudly. Exceptions: persistence writes are fire-and-forget; an open stream reports errors as its next frame.
- Fail loudly through the framework — known statuses become error responses, the rest propagates.
- Right layer. Endpoints and components orchestrate; each cross-cutting concern has exactly one owning module.
- One adapter at the boundary resolves divergent shapes; nothing downstream re-checks. A branch that distinguishes contexts is a bug report about another layer.
- Parse once at the boundary; downstream code takes typed shapes.
- Limits are named constants with a why, never inline numbers.
- Regexes only for genuine patterns; prefer `startsWith`/`split`/`slice`.
- No speculative flexibility — no options, flags, or config for needs that don't exist yet.

## TypeScript

- No `any`; no `as` to silence the compiler — fix the types.
- Tool schemas in zod at the tool; descriptions say when to call it.
- No formatter configured — match the file.

## Frontend

- Custom elements that rebuild on property assignment: configs at module scope, host behind `memo` — never re-render mid-stream.
- Tailwind utilities reusing the established tokens; shadow-DOM styles mirror them.
- Motion via the animation library, not ad-hoc keyframes.

## Backend

- Env bindings in one interface, reached via request context; no `process.env`.
- Persist each turn exactly once: user message on arrival, full answer at stream close.
- Sessions: opaque server-generated httpOnly cookie, set only when it changes.
- Client wire framing lives in one helper at the endpoint.
- Cache external fetches in the runtime cache with an explicit key and TTL; module state is not a cache.
- Schema changes via migrations, never ad-hoc SQL.

## Config & infra

- Secrets only in gitignored local vars or encrypted platform secrets; keep the example vars file in sync.
- terraform owns infra resources, wrangler owns tables and deploys; never apply a plan that replaces a resource holding data.
