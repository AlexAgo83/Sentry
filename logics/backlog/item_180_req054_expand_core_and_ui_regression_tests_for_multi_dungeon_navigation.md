## item_180_req054_expand_core_and_ui_regression_tests_for_multi_dungeon_navigation - req054 expand core and UI regression tests for multi-dungeon navigation
> From version: 0.9.36
> Understanding: 96%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: Quality / Regression Coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Req054 changes both core lifecycle behavior and dungeon navigation UI. Without dedicated regression coverage, multi-run state transitions and tab/setup interactions are likely to regress.

# Scope
- In:
- Add core tests for concurrent run creation and hero exclusivity across active runs.
- Add reducer tests for active run selection and fallback on run end.
- Add app tests for:
  - run tabs visibility rules (no tabs when no active runs),
  - run tab switching,
  - `New` setup behavior,
  - disabled `In dungeon` heroes,
  - control gating in `New` context (`Stop` non-actionable).
- Keep existing dungeon control/replay tests green.
- Out:
- Full e2e scenario expansion beyond req054 critical paths.

# Acceptance criteria
- New tests cover req054 locked decisions and acceptance criteria.
- Existing related test suites remain green.
- Regressions around run ordering, labeling, and setup guardrails are caught by automated tests.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_054_multi_dungeon_parallel_runs_with_tab_navigation.md`.
- Likely touch points:
  - `tests/core/dungeon.test.ts`
  - `tests/core/dungeonState.test.ts`
  - `tests/app/dungeonScreen.controls.test.tsx`
  - `tests/app/sidePanelSwitcher.dungeonActive.test.tsx`
