# Sentry

Sentry is a TypeScript + React idle game with a PWA-first setup and a modern fantasy UI.

[![CI](https://github.com/AlexAgo83/Sentry/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/Sentry/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/AlexAgo83/Sentry)](LICENSE)

## Features

* Multi-player roster with skills, recipes, and actions.
* Offline catch-up and recap summary on return.
* Local persistence via localStorage adapter.
* Cloud saves with conflict UI (date/score/version), last sync, and warmup handling.
* PWA support (manifest + service worker).
* Modern fantasy UI shell with performance telemetry.
* Inventory QoL: compact numbers, sell all, unit value, and new item badges.
* Action summary tooltips (speed/XP formulas) + explicit stun time display.

## Tech Stack

### App

* TypeScript + React (functional components + hooks).
* Vite (build/dev server) + `@vitejs/plugin-react-swc` (fast React/TS transforms).
* Custom CSS (global styles in `styles/` + app styles in `src/app/styles/`).
* SweetAlert2 (dialogs/confirm flows).

### Game engine & state

* Reducer-driven state machine: `src/core/reducer.ts`.
* Runtime tick loop + offline catch-up: `src/core/runtime.ts`, `src/core/loop.ts`.
* Lightweight store (subscribe/dispatch): `src/store/gameStore.ts`.
* Persistence + save migrations: `src/adapters/persistence/*`, `src/core/state.ts`.

### Backend (optional)

* Fastify API server (email/password auth + JWT).
* Prisma ORM + Postgres for cloud save storage.
* Rate limiting and payload size enforcement.

### Testing & quality

* Vitest + Testing Library + jsdom (unit + UI tests).
* Playwright (E2E smoke tests).
* Coverage via `@vitest/coverage-v8` (HTML report in `coverage/`).
* `jest-axe` accessibility smoke checks.
* ESLint + TypeScript typecheck.

## Project Structure

* `src/app`: React UI (components, hooks, styles).
* `src/core`: Game loop, state, runtime, serialization, types.
* `src/data`: Definitions for skills, recipes, and actions.
* `src/store`: Lightweight store for the game state.
* `src/adapters`: Persistence adapters (localStorage).
* `backend`: Fastify API server for cloud saves.
* `prisma`: Prisma schema and migrations.
* `tests`: Vitest test suite (unit + UI smoke tests).
* `scripts`: Local helper scripts (e.g. `scripts/run-tests.js`).
* `scripts/db`: DB dump/restore/reset utilities.
* `styles`: Global styles shared by the UI.
* `public`: PWA assets (manifest, service worker, icons).
* `logics`: Product workflow and planning artifacts.
* `logics/architecture`: Architecture notes and decisions.
* `logics/request`: Incoming requests or ideas (planning only).
* `logics/backlog`: Core product items.
* `logics/tasks`: Execution plans derived from backlog items.
* `dist`: Production build output (generated).

## Codex Instructions

Codex should load project-specific instructions from `logics/instructions.md`.
For browser-based UI validation, use the Logics skill at `logics/skills/logics-mcp-chrome-devtools/`.
For terminal access via MCP, use `logics/skills/logics-mcp-terminal/`.
To validate/fix Logics doc structure, indicators, and references, use `logics/skills/logics-doc-fixer/`.

## Setup

### Requirements

* Node.js `>= 20` (CI uses Node 20).
* npm (lockfile-based installs supported via `package-lock.json`).

1. Clone the repository: `git clone https://github.com/AlexAgo83/Sentry.git`
2. Install dependencies:
   - Recommended (CI-like): `npm ci`
   - Local dev: `npm install`
3. Start the dev server: `npm run dev`

### Backend setup (optional)

1. Ensure Postgres is available and Prisma is generated:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
2. Set backend env vars (see below).
3. Start the API server: `npm run backend:dev`

### Environment variables

App (Vite):
* `VITE_API_BASE`: Cloud API base URL (e.g. `http://localhost:8787`).

Backend:
* `JWT_SECRET`: JWT signing secret (required).
* `COOKIE_SECRET`: Cookie signing secret (defaults to `JWT_SECRET`).
* `DATABASE_URL`: Postgres URL (must include `?schema=sentry`).
* `ACCESS_TOKEN_TTL_MINUTES`: Access token TTL (default 15).
* `REFRESH_TOKEN_TTL_DAYS`: Refresh token TTL (default 30).

DB utilities:
* `DATABASE_URL_LOCAL`, `DATABASE_URL_RENDER`: Override per target.
* `PGSSL_DISABLE=1`: Disable SSL for local (not allowed for render).
* `SCHEMA_RESET_FORCE=1`: Required for render resets with `db:reset:dump`.

## Scripts

* `npm run dev`: Start the Vite dev server with debug logging.
* `npm run live`: Start the Vite dev server.
* `npm run build`: Build for production.
* `npm run preview`: Preview the production build.
* `npm run tests`: Run the test suite with Vitest (respects `TEST_TIMEOUT_MS`, `VITEST_STRICT`, `VITEST_LOG_CONSOLE`, `CI`).
* `npm run test:ci`: Run tests with strict CI config (`vitest.ci.mjs`, bail=1, coverage thresholds enforced).
* `npm run test:e2e`: Run Playwright E2E smoke tests (starts the dev server).
* `npm run coverage`: Run coverage with local config.
* `npm run coverage:ci`: Run coverage with CI config (same thresholds as tests).
* `npm run lint`: Run ESLint on `src` and `tests`.
* `npm audit --audit-level=moderate`: Check for vulnerabilities (CI fails on moderate+).
* `npm run backend:dev`: Start the Fastify cloud API server.
* `npm run prisma:generate`: Generate Prisma client.
* `npm run prisma:migrate`: Run Prisma migrations.
* `npm run db:dump`: Dump DB (custom format) to `scripts/db/dumps/`.
* `npm run db:restore`: Restore from a dump (`--dump-file` required).
* `npm run db:reset:dump`: Reset schema and restore from a dump (`--confirm` required).

## Testing & Coverage

Coverage thresholds are enforced via Vitest (statements/lines/functions/branches >= 75%). Run `npm run coverage` to verify.

### Test run knobs

* `CI=true` disables strict mode by default (no bail, multithreaded, no console mirroring). Locally, strict mode stays enabled unless you set `VITEST_STRICT=false`.
* `VITEST_STRICT=true|false` forces strictness (bail=1 + single-thread) on/off for the local config.
* `VITEST_LOG_CONSOLE=true` echoes all console output during tests with a prefix.
* `TEST_TIMEOUT_MS=<ms>` overrides the kill-timeout for `npm run tests` (default 90s locally, disabled in CI unless provided).

## CI (GitHub Actions)

The `CI` workflow runs on push/PR to `main` and executes:

* `npm ci` (requires `package-lock.json`)
* `npm run lint`
* `npm run typecheck`
* `npm run test:ci`
* `npm run coverage:ci` (enforces thresholds)
* `npm audit --audit-level=moderate`
* `npm run build`

## Troubleshooting

If you encounter any issues, check the console logs for errors.

## Contributing

Contributions are welcome. Please submit a pull request with a clear description of the changes and follow the project's coding conventions.

## License

This project is licensed under the MIT License (see `package.json`).
