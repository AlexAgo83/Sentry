## item_124_add_leaderboard_and_username_feature_test_coverage_frontend_backend - Add leaderboard and username feature test coverage frontend backend
> From version: 0.9.26
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Leaderboard ranking, masked identity fallback, and username validation are regression-prone without targeted tests.

# Scope
- In:
- Add frontend tests for:
  - `Settings` ordering (`Save options` then `Leaderboard`),
  - leaderboard modal open/close navigation,
  - list rendering (including save version) and `ex aequo` labels,
  - infinite scroll append flow (`10` by `10`),
  - loading/empty/error/retry states.
- Add frontend tests for cloud username edit:
  - visible only when authenticated,
  - success path updates display,
  - validation error display.
- Add backend tests for leaderboard API:
  - sort by `virtualScore` descending,
  - deterministic tie behavior,
  - masked email fallback output,
  - save version field mapping,
  - pagination and `hasNextPage`.
- Add backend tests for profile username update:
  - length/charset/space constraints,
  - uniqueness rejection,
  - unset to fallback behavior.
- Run full validation gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Out:
- No additional product behavior beyond validation coverage.

# Acceptance criteria
- Tests cover critical leaderboard + username feature paths.
- Full validation command battery passes.
- Coverage meaningfully includes new UI state transitions and backend validation rules.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_040_settings_leaderboard_modal_and_cloud_username.md`.
- Quality gate for items `item_119` through `item_123`.
