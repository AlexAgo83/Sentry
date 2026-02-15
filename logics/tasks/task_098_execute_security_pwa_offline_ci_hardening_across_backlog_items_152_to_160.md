## task_098_execute_security_pwa_offline_ci_hardening_across_backlog_items_152_to_160 - Execute security, PWA, offline, and CI hardening across backlog items 152 to 160
> From version: 0.9.31
> Understanding: 97%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: Security / Reliability / Refactor
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_152_cloud_auth_memory_only_access_token_and_silent_refresh_autologin.md`
- `logics/backlog/item_153_backend_cors_allowlist_and_auth_middleware_short_circuit.md`
- `logics/backlog/item_154_cloud_warmup_retry_backoff_and_status_semantics.md`
- `logics/backlog/item_155_pwa_service_worker_update_activation_safety_and_reload_policy.md`
- `logics/backlog/item_156_offline_catchup_step_cap_fix_and_regression_tests.md`
- `logics/backlog/item_157_ci_audit_policy_make_builds_deterministic.md`
- `logics/backlog/item_158_split_backend_server_into_domain_route_modules_phase2.md`
- `logics/backlog/item_159_split_core_runtime_and_renderer_hotspots_phase2.md`
- `logics/backlog/item_160_req047_regression_coverage_and_full_validation_battery.md`

Request reference:
- `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`

This task hardens cloud auth security (no persistent access token), preserves auto-login via silent refresh, makes cold-start/warmup behavior recoverable, ensures service worker updates cannot cause mixed-version runtime issues, fixes offline catch-up step semantics, and makes CI less non-deterministic.

# Decisions (v1)
- Phase 1 (correctness + guardrails first):
  - Access token is memory-only and acquired via startup silent refresh.
  - Warmup/network failures never force logout; only 401/403 does.
  - Service worker updates do not immediately take over; update activation is explicit and followed by controlled reload.
  - Offline catch-up step cap semantics are corrected and covered by tests.
  - CI audit policy is changed to avoid “random red builds”.
- Phase 2 (refactors after correctness is locked):
  - Split `backend/server.js` into route modules (no behavior change).
  - Split core runtime/renderer hotspots along low-risk seams (no behavior change).
- Final delivery requires the full validation battery.

# Plan
- [x] 1. Execute `item_152` (cloud auth: memory-only access token + auto-login):
  - Remove persistent access token storage.
  - Add startup silent refresh flow and state semantics.
  - Add/adjust tests for auto-login, refresh, and storage behavior.
- [x] 2. Execute `item_154` (warmup robustness):
  - Introduce retry/backoff policy and copy/UX for warming/offline vs unauthorized.
  - Ensure warmup failures never clear auth (unless 401/403).
  - Add tests for recovery path.
- [x] 3. Execute `item_153` (backend CORS allowlist + auth short-circuit):
  - Add `CORS_ORIGINS` allowlist in production.
  - Ensure auth preHandler returns/throws after 401.
  - Add backend tests for allowlist logic and auth gating.
- [x] 4. Execute `item_155` (PWA update safety):
  - Adjust SW install/activate behavior to avoid mixed-version runtime.
  - Align client update UX and controller-change reload behavior.
  - Add tests for the client-side wiring.
- [x] 5. Execute `item_156` (offline catch-up step cap correctness + tests):
  - Fix step cap semantics.
  - Add regression tests for invariants and long-away capping.
- [x] 6. Execute `item_157` (CI audit policy determinism):
  - Adjust `.github/workflows/ci.yml` audit step to the recommended policy.
  - Add or update documentation for the policy.
- [x] 7. Execute `item_158` (phase 2 refactor: backend route split):
  - Split `backend/server.js` into domain modules without behavior changes.
  - Keep tests green.
- [x] 8. Execute `item_159` (phase 2 refactor: core/renderer split):
  - Split hotspot modules along low-risk seams.
  - Keep tests green and avoid behavior changes.
- [x] 9. Execute `item_160` (req047 regression coverage + full battery):
  - Ensure cross-cutting regression coverage exists.
  - Run the full validation suite and fix any failures.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Implementation
Delivered in:
- `14a419e` (phase 1): security + offline + PWA + CI hardening.
- `1794ea2` (phase 2): backend route split + hotspot refactors.

Key outputs:
- Cloud access token is memory-only (security migration included), auto-login preserved via startup silent refresh.
- Warmup/backoff uses bounded delays + jitter and is cancellable (logout/offline).
- Backend CORS is allowlisted in prod via `CORS_ORIGINS`, and auth middleware short-circuits.
- Service worker update flow is explicit (no immediate takeover), preventing mixed-version runtime.
- Offline stepping cap semantics + tick reporting are corrected and covered by regression tests.
- CI audit policy is deterministic on PR/push; scheduled audit is report-only.

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`

Status: all commands above executed successfully (2026-02-15).
