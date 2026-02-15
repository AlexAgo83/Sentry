## req_047_security_pwa_offline_ci_hardening_and_maintainability - Hardening security, PWA updates, offline runtime, CI determinism, and maintainability
> From version: 0.9.31
> Understanding: 96%
> Confidence: 90%
> Complexity: High
> Theme: Security / Reliability / Refactor
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Reduce account-compromise risk in Cloud Save auth flows (token storage, CORS, auth middleware correctness).
- Preserve the current “auto-login” UX when relaunching the app (when refresh cookies are still valid).
- Make PWA update behavior safe (avoid mixed-version asset states) while keeping a good UX for “update available”.
- Fix/clarify offline catch-up stepping semantics to avoid unexpected runtime behavior under long idle / poor connectivity.
- Make CI results more deterministic (avoid ecosystem changes causing red builds).
- Reduce maintenance risk by splitting/isolating the largest “god files” and by adding targeted regression tests.

# Context
- The app runs as a PWA with a custom `public/sw.js` cache strategy.
- Cloud auth is cross-origin in production (frontend and backend on different origins) and uses:
  - access token (Authorization header),
  - refresh cookie (httpOnly),
  - CSRF cookie + `x-csrf-token` header.
- Production backend may be “cold” (Render warmup / spin-up delays). Startup flows that touch the backend must handle:
  - slow first response,
  - temporary network errors,
  - offline mode,
  - without causing false logouts or broken “auto-login”.
- CI currently runs a full battery including `npm audit --audit-level=moderate` which may become non-deterministic.
- Several modules have grown large and are change hotspots (renderer loop, core runtime/tick, backend server).

# Goals
- Security
  - Do not persist Cloud access tokens in `localStorage`.
  - Constrain backend CORS in production to explicit allowed origins.
  - Ensure auth middleware/guards short-circuit reliably.
- PWA
  - Ensure SW activation/update cannot yield “old UI + new chunks” or other mixed-asset states.
  - Keep a clear “update available” flow and a safe reload/activation path.
- Offline runtime
  - Ensure offline catch-up uses the intended step size constraints (max step cap, tick count accuracy).
  - Ensure offline/unstable network scenarios fail gracefully in UI (no infinite spinners; clear retry UX).
- CI
  - CI should not fail unexpectedly due to newly published dependency advisories unrelated to code changes.
- Maintainability
  - Reduce risk in the biggest files by splitting by domain/responsibility.
  - Keep changes testable: add regression tests around the changed contracts/flows.

# Non-goals
- Full auth redesign (OAuth, email verification, password reset flows, etc.).
- Full service-worker rewrite (Workbox migration) unless needed to satisfy the locked decisions.
- Full rewrite of the core runtime loop; only targeted correctness fixes + refactors that keep semantics.
- Multi-locale translation effort for tooltips/labels (unless i18n infra already exists).

# Locked decisions (v1)
## Cloud security model
- Access token must not be stored in persistent browser storage (`localStorage`, `IndexedDB`).
  - It may be kept in memory only.
  - Recommended: keep access token memory-only in all environments (DEV included) to avoid divergent behavior.
- Auto-login must be preserved:
  - On app start, if a refresh cookie exists and is valid, the app performs a silent refresh to obtain a new in-memory access token.
  - The app must not require the user to re-enter credentials on relaunch unless refresh is truly invalid/expired.
- CSRF token may remain stored locally (as a non-secret) to support cross-origin refresh, but the source of truth must be unambiguous (no mixed fallback behaviors that can go stale).
- Backend CORS in production must be an allowlist of known origins (config-driven).
  - Recommended: `CORS_ORIGINS` env var (comma-separated origins), plus permissive localhost only in non-production.
  - Any origin not in allowlist must be rejected when `credentials: true`.

## Startup auth UX (recommended)
- Prefer a “pessimistic” boot:
  - show a `checking`/`warming` state until refresh resolves,
  - do not declare the user “logged in” until refresh succeeds,
  - but allow the game to run offline/local while cloud is warming up.

## PWA update safety
- Remove “always activate immediately” behavior from the service worker install path in production builds.
- Updates should become active only when:
  - the user accepts an “update available” prompt (preferred), or
  - a controlled auto-reload policy triggers (best-effort fallback).
- When a new worker takes control (controller change), the page must reload promptly to avoid mixed-version asset execution.
  - Recommended: never auto-reload during critical gameplay moments (e.g. while a dungeon run is actively playing) unless the user explicitly confirms.

## CI determinism
- `npm audit` must not be a blocking gate for PR/push CI on `main` unless the policy is explicitly curated.
  - Prefer a scheduled job or a separate non-blocking job, or raise the threshold to `high` only.
  - Recommended default:
    - PR/push: either remove audit gate or set to `--audit-level=high`
    - scheduled: run `--audit-level=moderate` (report-only) for awareness.

# Scope detail (draft)
## A. Cloud auth hardening
- Frontend:
  - Stop persisting the access token in `localStorage`.
  - Keep access token in memory (module variable + React state) and refresh it on demand.
  - Add an explicit startup “silent refresh” step to preserve auto-login:
    - If we have a refresh cookie (and CSRF token available), call `/api/v1/auth/refresh` to mint a fresh access token.
    - If refresh succeeds: mark session as authenticated without showing a login prompt.
    - If refresh fails with 401/403: clear auth state and prompt re-login (this is the only path that should break auto-login).
    - If refresh fails due to warmup/network/offline: do not clear auth permanently; show a recoverable offline/degraded state and retry later.
  - Ensure CSRF token storage strategy is single-source (avoid stale token mismatch).
    - Recommended: keep CSRF token in local storage only (do not read `document.cookie`).
    - If refresh fails with 403 but backend is reachable, clear stored CSRF token and retry refresh once (to recover from staleness).
  - Add regression tests for:
    - refresh flow after reload,
    - logout clears any persisted non-secret state used for CSRF,
    - API calls correctly retry/refresh when 401 occurs (if current UX expects it).
    - warmup/timeout failures do not force logout (only true unauthorized should).
- Backend:
  - Replace permissive `origin: true` with an allowlist (env-driven).
  - Ensure auth preHandler returns/throws after sending 401 (no “continue after reply”).

## A2. Backend warmup robustness (Render cold starts)
- Startup/warmup checks must be “best effort”:
  - Warmup/probe failures (timeout, DNS, 503, offline) must not wipe valid auth state.
  - UI should distinguish:
    - “offline / cannot reach backend”
    - “backend warming up / retrying”
    - “unauthorized / please log in again”
- Add light retry/backoff policy for warmup/refresh attempts to avoid spamming the backend on cold starts.
  - Recommended default timings:
    - per-attempt timeout: 4s
    - retry schedule: 1s, 2s, 4s, 8s, 16s (cap 30s) with jitter
    - stop retries when the user explicitly logs out or disables cloud.

## B. PWA update flow hardening
- Service worker:
  - Ensure install/activate semantics cannot cause a mixed-asset runtime.
  - Keep cache-first for static assets and navigation fallback behavior, but make activation safe.
- Frontend:
  - Keep existing “update available” signaling.
  - Ensure controller-change reload is reliable (including a fallback timer).
- Add tests:
  - unit tests around SW registration logic (where possible),
  - smoke test for “update available -> activate -> reload requested”.

## C. Offline catch-up correctness
- Fix step sizing logic to reflect intended constraints:
  - `MAX_OFFLINE_STEP_MS` must act as a maximum cap (not a floor).
  - Ensure “ticks processed” reporting matches actual stepping semantics (for telemetry/offline recap UI).
- Add regression tests for:
  - long away time capped by `VITE_OFFLINE_CAP_DAYS`,
  - step size invariants,
  - offline recap stability.

## D. CI determinism improvements
- Adjust CI workflow:
  - move `npm audit` to scheduled/non-blocking job or raise threshold to reduce false-red runs.
- Add documentation note in `readme.md` for the chosen policy.

## E. Targeted maintainability refactors (no behavior change)
- Recommended sequencing (to reduce risk):
  - Phase 1: security + PWA update + offline stepping + CI policy + regression tests.
  - Phase 2: large-file refactors (backend route split, core/renderer splits) once correctness is locked by tests.
- Backend:
  - Split `backend/server.js` into route modules by domain:
    - auth, saves, profile, leaderboard, changelog, health/infra.
- Frontend/core:
  - Split large runtime/renderer/core loop modules where it’s low risk:
    - isolate pure functions (formatting, math, parsing),
    - isolate side-effect modules (persistence, SW registration, network clients).
- Add a lightweight “hotspot” guideline (where new code should go) to prevent re-growth.

## F. Accessibility/tooltips guardrails (carry-over)
- Ensure icon-only controls provide `aria-label` and `title`.
- Consider a follow-up v2 for mobile-friendly tooltips if required (native `title` is not reliable on mobile).

# Dependencies / references
- Builds on:
  - `logics/request/req_035_cloud_auth_prod_cross_origin.md` (cross-origin auth constraints)
  - `logics/request/req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening.md` (CI/bundle guardrails)
  - `logics/request/req_045_tooltips_for_all_clickable_controls.md` (a11y tooltip coverage)
- Technical references likely impacted:
  - `src/app/api/cloudClient.ts`
  - `src/app/hooks/useCloudSave.ts`
  - `backend/server.js`
  - `public/sw.js`
  - `src/pwa/serviceWorker.ts`
  - `src/core/runtime.ts`
  - `.github/workflows/ci.yml`

# Acceptance criteria
## Cloud security
- No Cloud access token is persisted in `localStorage` in production builds.
- Cloud refresh flow still works cross-origin in production and preserves auto-login after relaunch (when refresh cookie is valid).
- Backend CORS is allowlist-driven in production and does not accept arbitrary origins.
- Auth preHandler reliably blocks execution on unauthorized requests.
- Backend warmup failures do not force logout; only true 401/403 invalidates a session.

## PWA update safety
- Updating the service worker cannot cause a mixed-version asset runtime.
- “Update available” flow continues to work and results in a controlled reload.

## Offline runtime
- Offline catch-up step size constraints behave as designed and are covered by tests.
- Offline recap UX remains stable under long idle times and poor connectivity.

## CI determinism
- CI no longer flips red on `main` due to moderate advisories unrelated to PR code changes (policy defined and enforced).

## Maintainability
- Large modules are split without behavior regressions, with tests updated/added as needed.

# Test expectations
- Mandatory validation at end:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`
- Expected additions:
  - cloud auth client tests (token storage and refresh behavior),
  - offline runtime stepping regression tests,
  - CI workflow change verification (linting of workflow optional),
  - backend route tests if route split is done.

# Risks / open points
- Cross-origin cookie policies (SameSite/ITP) can vary; changes must be tested on target browsers.
- Removing access-token persistence may increase refresh calls; ensure refresh endpoint is robust and rate limited.
- Service worker update behavior is notoriously tricky; must be validated with real builds (not just dev).
- CI audit policy needs team agreement (what severity blocks, and where it runs).

# Backlog
- `logics/backlog/item_152_cloud_auth_memory_only_access_token_and_silent_refresh_autologin.md`
- `logics/backlog/item_153_backend_cors_allowlist_and_auth_middleware_short_circuit.md`
- `logics/backlog/item_154_cloud_warmup_retry_backoff_and_status_semantics.md`
- `logics/backlog/item_155_pwa_service_worker_update_activation_safety_and_reload_policy.md`
- `logics/backlog/item_156_offline_catchup_step_cap_fix_and_regression_tests.md`
- `logics/backlog/item_157_ci_audit_policy_make_builds_deterministic.md`
- `logics/backlog/item_158_split_backend_server_into_domain_route_modules_phase2.md`
- `logics/backlog/item_159_split_core_runtime_and_renderer_hotspots_phase2.md`
- `logics/backlog/item_160_req047_regression_coverage_and_full_validation_battery.md`
