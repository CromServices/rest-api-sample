# REST API sample

Small TypeScript REST API: `/health` and `/items` with request validation over a swappable `Store<Item>`.

<!-- Built on CromServices/crom-ts-api-starter at c50f431 (package.json "starter.config"). Shared files come from the starter; do not edit them here first. -->

## What it is

A public sample of how Crom Services approaches small TypeScript REST API work. It is a portfolio sample, not a client system, and it holds nothing sensitive.

- `GET /health` returns `{"status":"ok"}`.
- `GET /items` lists items; `POST /items` validates `{"name": "..."}` (1-80 characters after trim) and returns `201` with the new item, or `400 {"error": ...}`.
- `GET /items/:id` and `DELETE /items/:id` read and remove one item (`404` when missing).
- `GET /` serves a minimal HTML page on the shared Crom theme (crom-shared `theme.css` pinned at `v1.0.0`) with the standard Crom footer and credit.
- Storage sits behind the `Store<Item>` interface (`src/store/store.ts`); this sample uses the in-memory implementation (`src/store/memory.ts`).

| Path | Purpose |
|---|---|
| `src/app.ts` | `createApp()`: routes and middleware |
| `src/server.ts` | Listen entry (`PORT`, `HOST`) |
| `src/routes/items.ts` | `/items` routes and `validateCreateItem` |
| `src/lib/validate.ts` | Validation helper and `validateBody()` middleware |
| `src/store/` | `Store<T>` interface + `InMemoryStore<T>` |
| `test/` | `node:test` suites (validation, store, HTTP) |

## What it proves

- A clear, testable CRUD-style endpoint pattern: input is validated before it reaches storage, and bad input gets a plain `400`.
- Storage can be swapped (for example, to a database adapter) without touching the routes, because routes only see `Store<Item>`.
- The same toolchain as every Crom Services TypeScript API: strict TypeScript, `node:test`, a multi-stage `Dockerfile` and `fly.toml`.

## Live link

Not hosted. Run it locally with the three commands below.

## Run in 3 commands

Needs Node 20 or newer.

```bash
npm install
npm test
npm run dev        # http://localhost:3000/health
```

`npm run build` compiles to `dist/`, and `npm start` runs the compiled server. Copy `.env.example` to `.env` to change `PORT` or `HOST`.

## Reuse for a new job

Start from the template, not from this sample:

1. **Use this template** on [CromServices/crom-ts-api-starter](https://github.com/CromServices/crom-ts-api-starter) to create the project repo.
2. **Set the name** in `package.json` (`name` and the `starter.config` block), and set `starter.config.ref` to the starter commit you started from.
3. **Set the app name** in `fly.toml` (replace `crom-CHANGE-ME`).
4. **Build the API**: shape the `items` route into the job's resources, and add a `Store<T>` adapter if it needs a database.
5. **Deploy**: `fly apps create <app-name>` once, then `fly deploy`, and put the URL under **Live link**.

## Footer

---

Crom Services · Australia · cromservices@gmail.com
Site: https://cromservices.com.au · Packs: https://cromservices.github.io/job-page-sample/packs/

<a href="https://cromservices.com.au"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cromservices.com.au/brand/credit/crom-credit-lockup-dark@2x.png"><img src="https://cromservices.com.au/brand/credit/crom-credit-lockup-light@2x.png" width="175" height="20" alt="Built by Crom Services"></picture></a>

MIT, see LICENSE.
