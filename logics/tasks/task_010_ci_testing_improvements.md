## task_010_ci_testing_improvements - Restore stricter CI and raise coverage confidence
> From version: 0.6.3  
> Understanding: 90%  
> Confidence: 84%  
> Progress: 100%

# Context
Coverage thresholds were relaxed for functions, and the Vitest config mixes local and CI flags.
CI should stay strict by default while keeping dev-friendly options local. We also lack a
smoke/e2e check for the offline recap entrypoint.

# Goal
Make CI testing stricter and more predictable while keeping local dev flexible, and add
lightweight coverage to critical flows (offline recap).

# Plan
- [x] 1. Split test configs: add a dedicated `vitest.ci.mjs` (strict bail, thread pool,
      full thresholds) and keep local overrides via env; update scripts/README.
- [x] 2. Restore function threshold to 90% with targeted tests (App side-panel toggle,
      itemUsage edge case) instead of relaxing thresholds.
- [x] 3. Add a minimal e2e/smoke test (React Testing Library) for
      “offline recap modal appears on startup when summary exists”.
- [x] 4. Provide a lint/script hook for CI (`npm run test:ci`) and optional linting
      (`npm run lint`) to avoid regressions.
- [x] FINAL: Validate acceptance, update docs/backlog/task status, and verify performance.

# Acceptance
- CI script uses strict config (bail=1, thresholds: funcs>=90) and runs deterministically.
- Local dev can still opt into relaxed logging/timeouts via env without affecting CI.
- A test covers offline recap modal on startup; coverage passes with 90% functions.
- README documents CI vs local test commands and config files.

# Outcome
- Added `vitest.ci.mjs` and scripts `test:ci` / `coverage:ci`; CI workflow runs lint + tests + coverage.
- Added RTL smoke test `tests/app/offlineRecapModal.test.tsx` for offline recap on mount.
- Added ESLint flat config + `npm run lint`.
- README documents CI/local commands and test knobs. Function threshold back to 90% in CI config.
