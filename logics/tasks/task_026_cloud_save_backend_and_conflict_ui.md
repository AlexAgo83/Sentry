## task_026_cloud_save_backend_and_conflict_ui - Cloud save backend and conflict UI
> From version: 0.8.11
> Understanding: 93%
> Confidence: 86%
> Progress: 65%

# Context
Derived from `logics/backlog/item_024_cloud_save_backend_and_conflict_ui.md`

# Plan
- [x] 1. Scaffold backend (Fastify + Prisma) with `/api/v1` base, Postgres schema `sentry`, and env config.
- [x] 2. Implement auth: register/login, bcrypt hashing, access + refresh tokens, refresh cookie handling.
- [x] 3. Implement save endpoints with payload validation, size limits, and metadata storage.
- [x] 4. Add basic rate limiting on auth endpoints.
- [x] 5. Wire frontend client calls and conflict UI (diff + actions), with offline-first disable behavior.
- [ ] 6. Add backend tests (auth, saves, size limits, security) and frontend conflict UI tests.
- [ ] FINAL: Update related Logics docs if scope changes.

# Test plan
- Backend integration: register/login, refresh, auth-required access, rate limit, payload size limit.
- Backend API: upload/overwrite and fetch latest with metadata verification.
- Frontend UI: conflict diff renders (date/score/version) and actions perform expected call paths.
- Offline-first: cloud actions disabled when backend unavailable.

# Validation
- npm run tests
- npm run lint
- npm run typecheck

# Risks & rollback
- What can break: auth security, token handling, data loss on overwrite, API/DB schema mismatch.
- How to detect regressions: API tests + manual smoke in local dev; logs for auth failures.
- Rollback plan: disable cloud UI entry points and keep local-only saves; revert backend changes.

# Report
- Added Fastify server with auth + save endpoints, Prisma schema, env defaults, and dependencies.
- Added cloud client + System modal cloud panel for login/register, diff display, load/overwrite, offline disable.
- Backend tests and frontend conflict UI tests still pending.
- Validation not run yet.

# Estimate
- Size: L
- Drivers:
  - Unknowns: backend scaffold + hosting details; auth hardening; schema design.
  - Integration points: frontend UI, API client, DB schema/scripts.
  - Migration/rollback risk: medium-high (new backend + data storage).
