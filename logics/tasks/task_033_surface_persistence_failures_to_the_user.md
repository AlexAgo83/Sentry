## task_033_surface_persistence_failures_to_the_user - Surface persistence failures to the user
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_038_persistence_failure_ui_alert.md`.
Show a persistent banner when persistence is disabled, with retry and export actions.

# Plan
- [ ] 1. Track persistence failure state in the store (error + disabled flags).
- [ ] 2. Emit state changes from runtime when persistence fails or recovers.
- [ ] 3. Add a persistent banner with retry + export actions.
- [ ] 4. Add tests for failure -> warning -> recovery.
- [ ] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint

# Report
- Status: not started.
