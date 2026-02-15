## task_094_execute_bundle_leaderboard_scalability_and_ci_flaky_hardening_across_backlog_items_133_to_138 - Execute bundle, leaderboard scalability, and CI flaky hardening across backlog items 133 to 138
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Refactor
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_133_split_heavy_optional_ui_paths_with_lazy_loading_and_chunk_reduction.md`
- `logics/backlog/item_134_add_bundle_observability_and_budget_guardrails_for_split_strategy.md`
- `logics/backlog/item_135_migrate_leaderboard_backend_to_indexed_cursor_pagination.md`
- `logics/backlog/item_136_update_leaderboard_frontend_infinite_scroll_to_cursor_contract.md`
- `logics/backlog/item_137_add_ci_flaky_detection_stage_for_critical_test_paths.md`
- `logics/backlog/item_138_add_regression_coverage_and_full_battery_validation_for_request_043.md`

Request reference:
- `logics/request/req_043_bundle_performance_leaderboard_scalability_and_ci_flaky_hardening.md`

This task orchestrates end-to-end delivery of three axes:
- bundle performance hardening via lazy split,
- leaderboard backend/frontend scalability migration to cursor pagination,
- CI flaky detection stabilization.

# Decisions (v1)
- Preserve existing UX semantics while optimizing internals.
- Leaderboard ordering and tie semantics remain unchanged.
- Cursor pagination replaces offset traversal as primary backend strategy.
- CI gains explicit flaky detection gate for selected critical tests.
- Task is not complete until the full battery of tests passes.

# Plan
- [x] 1. Baseline and guardrails:
  - Capture current build chunk outputs and leaderboard/API behavior baseline.
  - Identify candidate heavy modules for lazy split.
- [x] 2. Execute `item_133` (lazy split optional heavy paths):
  - Apply `React.lazy`/`Suspense` on optional modal views and other low-frequency surfaces.
  - Validate back navigation and loading placeholders.
- [x] 3. Execute `item_134` (bundle observability + budget guards):
  - Update bundle check thresholds and reporting for new split layout.
  - Keep diagnostics actionable in local and CI runs.
- [x] 4. Execute `item_135` (backend cursor pagination + index):
  - Add DB index/migration.
  - Implement cursor contract and deterministic ordering with `isExAequo` continuity.
- [x] 5. Execute `item_136` (frontend leaderboard cursor migration):
  - Adapt API client + modal infinite scroll to cursor continuation.
  - Keep dedupe/rank/tie rendering stable.
- [x] 6. Execute `item_137` (CI flaky stage):
  - Add targeted repeat command(s) and CI stage integration.
  - Ensure clear logs for unstable test detection.
- [x] 7. Execute `item_138` (regression + validation):
  - Extend test coverage for modified paths.
  - Validate docs/code alignment.
- [x] 8. Final mandatory full test battery:
  - Run complete validation suite.
  - Fix all failing checks before marking task complete.
- [x] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`

# Report
- Leaderboard: replaced offset pagination with cursor (keyset) contract and added a DB index to support ordering.
- Frontend: updated leaderboard client + infinite scroll to consume `nextCursor`.
- Performance: lazy-loaded most system modal views (system subpages) and lazy-loaded app modal containers.
- Bundle guardrails: tightened `scripts/bundle-budgets.json` max JS chunk to 500KB and added `manualChunks` split to keep chunks under the warning threshold.
- CI: added a flaky gate running the save envelope test multiple times.
- Full battery validated via `npm run test:full`.
