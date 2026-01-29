## task_022_offline_catch_up_cap_to_7_days - Offline catch-up cap to 7 days
> From version: 0.8.11
> Understanding: 94%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_020_offline_catch_up_cap_to_7_days.md`

# Plan
- [ ] 1. Introduce a configurable offline cap constant (default 7 days) and optional dev env override.
- [ ] 2. Update runtime catch-up to use the new cap and keep capped recap messaging intact.
- [ ] 3. Add/adjust tests for the cap and capped recap behavior.
- [ ] FINAL: Update related Logics docs if scope changes.

# Test plan
- Unit: cap derivation from constant/env; processedMs never exceeds cap.
- Integration: simulate offline > cap and verify recap shows capped and processed < away.
- Regression: offline < cap behaves unchanged.

# Validation
- npm run tests
- npm run lint

# Risks & rollback
- What can break: long catch-up loops may stall UI if the cap is raised without safeguards.
- How to detect regressions: runtime/offline tests + manual simulateOffline at >7 days.
- Rollback plan: revert cap constant/env override to previous 12h behavior.

# Report

# Estimate
- Size: M
- Drivers:
  - Unknowns: exact location to inject env override; long-duration test harness coverage.
  - Integration points: runtime constants, offline recap messaging.
  - Migration/rollback risk: low (no data migration).
