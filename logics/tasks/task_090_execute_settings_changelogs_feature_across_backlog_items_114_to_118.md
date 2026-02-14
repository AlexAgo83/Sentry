## task_090_execute_settings_changelogs_feature_across_backlog_items_114_to_118 - Execute settings changelogs feature across backlog items 114 to 118
> From version: 0.9.24
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_114_add_settings_entrypoint_for_changelogs_modal.md`
- `logics/backlog/item_115_implement_backend_proxy_route_for_github_commit_feed.md`
- `logics/backlog/item_116_build_changelogs_modal_ui_with_scroll_and_pagination.md`
- `logics/backlog/item_117_wire_frontend_changelog_data_client_and_modal_state.md`
- `logics/backlog/item_118_add_changelogs_feature_tests_frontend_backend_and_optional_e2e.md`

Request reference:
- `logics/request/req_039_settings_changelogs_modal_with_paginated_github_commits.md`

This task orchestrates end-to-end delivery of the in-app changelogs feature (Settings entrypoint + modal + paginated GitHub commit feed + tests).

# Decisions (v1)
- Source of truth is GitHub commits via backend proxy endpoint, not a static local changelog file.
- Pagination is fixed to 10 commits per page.
- Settings ordering rule: `Changelogs` is placed directly before `About`.
- Backend supports:
  - required repo targeting env (`GITHUB_OWNER`, `GITHUB_REPO`),
  - optional auth token (`GITHUB_TOKEN`, recommended),
  - stable error mapping for rate-limit/offline/upstream failures.
- Token remains server-side only and must never be exposed to frontend.
- Delivery is phase-based; each phase is validated before the next one.

# Plan
- [ ] 1. Baseline and guardrails:
  - Confirm current Settings/modal flow baseline.
  - Pin existing tests covering Settings and modal stack.
- [ ] 2. Execute `item_114` (Settings entrypoint):
- Add `Changelogs` action in Settings.
- Position `Changelogs` directly before `About`.
- Wire modal open action through existing modal architecture.
- [ ] 3. Execute `item_115` (backend proxy route):
  - Add backend changelog endpoint with GitHub pagination mapping.
  - Implement token/no-token path and normalized response contract.
  - Implement consistent rate-limit/upstream error mapping.
- [ ] 4. Execute `item_116` (modal UI):
  - Build `ChangelogsModal` with scrollable list.
  - Implement loading/empty/error/retry states and pagination controls.
- [ ] 5. Execute `item_117` (frontend data + state wiring):
  - Add frontend API client.
  - Wire page state, request lifecycle, retry, and optional per-page session cache.
- [ ] 6. Execute `item_118` (tests and quality gate):
  - Add/extend frontend and backend tests for happy/error/rate-limit paths.
  - Add optional e2e smoke for Settings -> Changelogs -> page navigation.
- [ ] 7. Final stabilization:
  - Verify no regressions in existing Settings/system modal flows.
  - Ensure docs/comments/contracts match final behavior.
- [ ] 8. Final mandatory full test battery:
  - Run the complete validation suite at task end.
  - Fix all failing checks before considering the task complete.
- [ ] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run build`
- `npm run test:e2e`

# Report
- Pending execution.
