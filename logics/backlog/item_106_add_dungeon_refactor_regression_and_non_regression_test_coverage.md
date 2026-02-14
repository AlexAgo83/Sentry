## item_106_add_dungeon_refactor_regression_and_non_regression_test_coverage - Add dungeon refactor regression and non-regression test coverage
> From version: 0.9.24
> Understanding: 95%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Large structural refactors in dungeon UI/rendering can silently break replay timing, live updates, or rendering cues if tests do not explicitly lock expected behavior.

# Scope
- In:
- Add or extend tests for extracted hooks/helpers and critical dungeon UI flows.
- Cover non-regression behavior for:
  - replay controls (play/pause/speed/cursor)
  - setup/live/replay view switching
  - replay derived metrics continuity
  - frame/output parity checks for extracted playback helpers
- Ensure CI commands remain green for lint, typecheck, and tests.
- Out:
- No new gameplay mechanics.
- No snapshot-heavy visual approval pipeline in this item.

# Acceptance criteria
- Refactor-related modules have focused unit/integration tests.
- At least one non-regression test validates replay playback/timing behavior.
- `npm run lint`, `npm run typecheck`, and `npm run tests` pass.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_037_split_dungeon_screen_and_arena_modules_for_maintainability.md`.
- This item is a quality gate for items `item_102` to `item_105`.
