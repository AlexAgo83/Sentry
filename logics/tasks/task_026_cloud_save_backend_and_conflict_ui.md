## task_026_cloud_save_backend_and_conflict_ui - Cloud save backend and conflict UI
> From version: 0.8.11
> Understanding: 90%
> Confidence: 82%
> Progress: 0%

# Context
Derived from `logics/backlog/item_024_cloud_save_backend_and_conflict_ui.md`

# Plan
- [ ] 1. Scaffold backend (Fastify + Prisma) with `/api/v1` base, Postgres schema `sentry`, and env config.
- [ ] 2. Implement auth: register/login, bcrypt hashing, access + refresh tokens, refresh cookie handling.
- [ ] 3. Implement save endpoints with payload validation, size limits, and metadata storage.
- [ ] 4. Add basic rate limiting on auth endpoints.
- [ ] 5. Wire frontend client calls and conflict UI (diff + actions), with offline-first disable behavior.
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

# Estimate
- Size: L
- Drivers:
  - Unknowns: backend scaffold + hosting details; auth hardening; schema design.
  - Integration points: frontend UI, API client, DB schema/scripts.
  - Migration/rollback risk: medium-high (new backend + data storage).
