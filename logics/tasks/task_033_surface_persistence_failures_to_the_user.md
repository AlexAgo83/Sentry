## task_033_surface_persistence_failures_to_the_user - Surface persistence failures to the user
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_038_persistence_failure_ui_alert.md`.
Show a persistent banner when persistence is disabled, with retry and export actions.

# Plan
- [x] 1. Track persistence failure state in the store (error + disabled flags).
- [x] 2. Emit state changes from runtime when persistence fails or recovers.
- [x] 3. Add a persistent banner with retry + export actions.
- [x] 4. Add tests for failure -> warning -> recovery.
- [x] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint

# Report
- Status: complete.
- Notes: Added persistence status to game state, runtime backoff + retry handler, and a sticky banner with retry/export actions. Added recovery coverage in runtime tests.
