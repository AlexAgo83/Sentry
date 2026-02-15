## item_156_offline_catchup_step_cap_fix_and_regression_tests - Fix offline catch-up stepping semantics and validate with tests
> From version: 0.9.31
> Understanding: 90%
> Confidence: 88%
> Progress: 100%
> Complexity: Medium
> Theme: Correctness / Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Offline catch-up must be correct and predictable under long idle times. Step size caps should behave as intended and reported “ticks processed” should match the stepping semantics.

# Scope
- In:
- Ensure `MAX_OFFLINE_STEP_MS` acts as a maximum cap (not a floor).
- Ensure computed “ticks processed” is consistent with actual stepping:
  - telemetry/offline recap should not over/under-report
- Add regression tests for:
  - long away time capped by `VITE_OFFLINE_CAP_DAYS`
  - step cap invariants
  - offline recap stability
- Out:
- No new gameplay economy changes; this is strictly runtime correctness.

# Acceptance criteria
- Offline stepping honors max step caps and remains stable under long-away scenarios.
- Tests cover the invariants and prevent regressions.

# Implementation notes
- Offline stepping cap fixed (cap is a maximum, ticks derived from actual stepping):
  - `src/core/runtime.ts`
  - `src/core/runtime/offlineCatchUp.ts`
- Default `OFFLINE_INTERVAL` moved to 5000ms to prevent excessive stepping on long-away scenarios:
  - `src/core/constants.ts`
- Tests:
  - `tests/core/runtime.test.ts`
  - `tests/offlineLoop.test.ts`

Delivered in commits: `14a419e`, `1794ea2`.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`.
