# REST API sample — Crom Services

Public sample of how Crom Services approaches small TypeScript REST API work.

This folder demonstrates a minimal Express TypeScript API with GET /health and GET/POST /items over an in-memory store, plus request validation. Distinct from the webhook verification sample. Portfolio overflow sample only — not a client system.

## Purpose

- Clear, testable CRUD-style endpoint pattern
- Illustrates Crom Services capability for API overflow and small builds
- In-memory store only; nothing sensitive in the repo

## Stack

- TypeScript and Node.js 18+
- Express
- In-memory ItemStore with create/list
- Tests via node:test (tsx loader)

## Layout

- src/store.ts — in-memory items and validation
- src/app.ts — Express app with /health and /items
- src/server.ts — listen entrypoint
- test/items.test.ts — validation and HTTP checks

## How to run

Install dependencies with the package manager, then execute the test script.
Optional: start the local server with the start script (PORT defaults to 3000).

## Capability

- Code and PR review packs
- Small builds and patches as PRs
- API and webhook work

Crom Services · Perth WA · Remote across Australia
Trading as Crom Services

Site: https://cromservices.com.au (placeholder)
Contact: cromservices@gmail.com

## License

MIT — see LICENSE.
