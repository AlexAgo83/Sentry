## task_091_execute_settings_leaderboard_and_cloud_username_feature_across_backlog_items_119_to_124 - Execute settings leaderboard and cloud username feature across backlog items 119 to 124
> From version: 0.9.26
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_119_add_settings_leaderboard_entry_and_modal_navigation.md`
- `logics/backlog/item_120_implement_backend_leaderboard_endpoint_sorted_by_virtual_score.md`
- `logics/backlog/item_121_add_cloud_username_field_and_profile_update_endpoint.md`
- `logics/backlog/item_122_build_leaderboard_modal_ui_with_loading_empty_error_states.md`
- `logics/backlog/item_123_add_cloud_save_username_edit_flow_with_email_fallback.md`
- `logics/backlog/item_124_add_leaderboard_and_username_feature_test_coverage_frontend_backend.md`

Request reference:
- `logics/request/req_040_settings_leaderboard_modal_and_cloud_username.md`

This task orchestrates end-to-end delivery of leaderboard and cloud username capabilities (Settings entrypoint + leaderboard modal + backend ranking API + profile username editing + tests).

# Decisions (v1)
- Settings ordering rule:
  - `Leaderboard` is placed immediately after `Save options`.
- Leaderboard rows must display:
  - display name,
  - virtual score,
  - last save date,
  - last save app version.
- Display name rule:
  - use `username` when available,
  - otherwise use masked email fallback (example: `toto25@toto.com` -> `t****5@toto.com`).
- Username constraints:
  - max length `16`,
  - unique,
  - no spaces,
  - no special characters (alphanumeric only).
- Username edit is allowed only for authenticated users and follows hero rename modal UX pattern.
- Leaderboard loading uses infinite scroll with 10-entry chunks (same concept as changelogs).
- Equal `virtualScore` entries are shown as `ex aequo`.
- Delivery is phase-based; each phase is validated before moving to the next.

# Plan
- [x] 1. Baseline and guardrails:
  - Confirm current Settings/system modal stack behavior.
  - Pin current tests for Settings, Cloud Save, and backend auth/save APIs.
- [x] 2. Execute `item_119` (Settings entrypoint + modal navigation):
  - Add `Leaderboard` action after `Save options`.
  - Wire leaderboard modal route/state through existing modal architecture.
- [x] 3. Execute `item_121` (username persistence + profile endpoint):
  - Add `username` persistence field + migration.
  - Implement authenticated username update endpoint with validation constraints.
- [x] 4. Execute `item_120` (leaderboard backend endpoint):
  - Implement paginated leaderboard API (`page`, `perPage=10`, `hasNextPage`).
  - Sort by `virtualScore DESC` with deterministic ties.
  - Return display identity, `updatedAt`, `appVersion`, and tie metadata for `ex aequo`.
  - Apply masked email fallback server-side.
- [x] 5. Execute `item_123` (Cloud Save username edit flow):
  - Add authenticated-only username edit action.
  - Reuse hero rename modal interaction pattern.
  - Wire update flow, success refresh, and validation error feedback.
- [x] 6. Execute `item_122` (Leaderboard modal UI + infinite scroll):
  - Build leaderboard modal states (loading/append loading/empty/error/retry).
  - Render rows with name/score/date/version.
  - Implement infinite scroll appending by 10 with duplicate-safe append behavior.
  - Render `ex aequo` marker on tied scores.
- [x] 7. Execute `item_124` (tests and quality gate):
  - Add/extend frontend tests (Settings ordering, modal states, infinite scroll, `ex aequo`, username edit).
  - Add/extend backend tests (sorting, masked fallback, version field, username validation/uniqueness).
- [x] 8. Final stabilization:
  - Verify no regressions in Settings, Save options, Cloud Save, and system modal navigation.
  - Ensure API contracts, docs, and labels match final behavior.
- [x] 9. Final mandatory full test battery:
  - Run complete validation suite on final state.
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
- Completed:
  - Added `Leaderboard` action in `Settings` directly after `Save options` and wired modal navigation.
  - Implemented backend `GET /api/v1/leaderboard` (10-entry pagination, deterministic sorting, masked email fallback, tie metadata, app version/date fields).
  - Added backend profile APIs `GET/PATCH /api/v1/users/me/profile` with username validation (<=16 chars, alphanumeric only, case-insensitive uniqueness, blank -> null).
  - Added `username` + `usernameCanonical` persistence fields and migration.
  - Implemented `LeaderboardModal` with infinite scrolling, loading/error/empty/append states, and `Ex aequo` markers.
  - Added authenticated Cloud Save username editing flow reusing rename-modal UX pattern.
  - Expanded frontend/backend tests for leaderboard and username flows.
- Validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`
