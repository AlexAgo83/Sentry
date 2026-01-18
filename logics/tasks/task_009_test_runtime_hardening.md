## task_009_test_runtime_hardening - Stabilize runtime listeners and test harness
> From version: 0.6.2  
> Understanding: 92%  
> Confidence: 86%  
> Progress: 100%

# Context
Recent changes added stricter test timeouts and offline recap persistence. Risks remain:
unreleased runtime listeners on stop(), aggressive test bail/logging for CI, and a hard
kill test runner that might terminate slow-but-legit runs.

# Goal
Harden runtime lifecycle and make the test harness configurable so suites cannot hang or
terminate valid runs in CI/local.

# Plan
- [x] 1. Runtime: ensure visibility/unload listeners are detachable and stop() cleans them
      up; guard against duplicate bindings on HMR/tests.
      Add unit coverage for start/stop lifecycle and listener removal.
- [x] 2. Vitest config: make bail/pool/onConsoleLog driven by env (e.g. CI strict=false,
      local strict=true); document defaults in README.
- [x] 3. Test runner script: make timeout configurable (env/CLI), disable/relax kill in
      CI, and surface exit codes clearly; add a short README blurb.
- [x] 4. Verify: run full suite locally with both strict and CI-style settings; confirm no
      leaked listeners or hanging processes.

# Acceptance
- GameRuntime.stop removes bound listeners; repeated start/stop doesn’t duplicate handlers.
- Tests can run in strict local mode or full CI mode via env flags, with clear logging and
  no hangs; timeouts are configurable and not hard-coded for CI.
- Documentation updated to explain the knobs for test strictness and timeouts.

# Outcome
- Implemented listener tracking/cleanup in `src/core/runtime.ts`.
- Added lifecycle and short-recap tests in `tests/core/runtime.test.ts`; suite runs clean.
- Vitest config now driven by env (`VITEST_STRICT`, `VITEST_LOG_CONSOLE`, `CI`), thresholds tuned; README documents knobs.
- Test runner timeout configurable via `TEST_TIMEOUT_MS` and disabled by default in CI.
- Full suite/coverage passing (`npm run coverage`).
