## task_100_execute_cloud_auto_sync_across_backlog_items_164_to_168 - Execute cloud auto-sync (auto-save/auto-load) across backlog items 164 to 168
> From version: 0.9.31
> Understanding: 92%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Feature / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_164_req049_backend_concurrency_token_and_conflict_responses_for_saves_latest.md`
- `logics/backlog/item_165_req049_frontend_cloud_autosync_toggle_and_orchestrator_state_machine.md`
- `logics/backlog/item_166_req049_conflict_detection_ui_and_user_resolution_actions.md`
- `logics/backlog/item_167_req049_autosync_triggers_rate_limits_and_warmup_backoff_integration.md`
- `logics/backlog/item_168_req049_regression_coverage_and_full_validation_battery.md`

Request reference:
- `logics/request/req_049_cloud_auto_sync_autoload_with_conflict_resolution_and_warmup_handling.md`

This task adds an optional Cloud auto-sync mode (default OFF) with safe conflict detection (no silent overwrites), warmup/offline resilience, and rate-limited triggers.

# Decisions (v1)
- Auto-sync is opt-in (toggle) and defaults to OFF.
- Conflict detection is mandatory:
  - backend enforces optimistic concurrency (token + 409)
  - frontend surfaces a conflict UI and requires explicit user resolution
- Warmup/offline failures must be recoverable and must not force logout.
- Final delivery requires full validation battery pass.

# Plan
- [ ] 1. Execute `item_164` (backend token + 409 conflicts):
  - Add/return a concurrency token for saves.
  - Require `expected*` token on write; return 409 on mismatch.
  - Add backend tests for token increments + 409.
- [ ] 2. Execute `item_165` (frontend toggle + core orchestration):
  - Add Auto sync switch in Cloud Save options (default OFF).
  - Implement startup decision logic (auto-load vs auto-save scheduling).
  - Expose stable status semantics (ready/warming/offline/error/conflict).
- [ ] 3. Execute `item_167` (triggers + rate limits + warmup integration):
  - Add safe triggers + debouncing and “local changed” tracking.
  - Add per-attempt timeout + backoff + jitter + Retry now action.
- [ ] 4. Execute `item_166` (conflict UI + resolution):
  - Surface conflict state and require explicit user action:
    - Load cloud
    - Overwrite cloud with local (with latest expected token)
  - Ensure auto-sync pauses on conflict and resumes after resolution.
- [ ] 5. Execute `item_168` (regression + full battery):
  - Add regression coverage for conflict safety + warmup/auth invariants.
  - Run full validation suite and fix failures.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`

