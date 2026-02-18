## item_177_req054_add_active_dungeon_run_selection_action_and_reducer_coverage - req054 add active dungeon run selection action and reducer coverage
> From version: 0.9.36
> Understanding: 94%
> Confidence: 89%
> Progress: 0%
> Complexity: Medium
> Theme: State Management / Reducer
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
There is no explicit state transition dedicated to selecting which active dungeon run is currently focused by the Dungeon panel. Tab-based navigation requires a first-class action and clear reducer behavior.

# Scope
- In:
- Add a dedicated action for selecting the active run (example: `dungeonSetActiveRun`).
- Ensure reducer guards invalid/missing run ids.
- Ensure active run selection remains valid when runs end and are removed.
- Add reducer-level regression tests for selection and fallback behavior.
- Out:
- UI tab rendering and styling (covered in item_178).
- Setup/New tab orchestration details (covered in item_179).

# Acceptance criteria
- Dispatching selection action updates `dungeon.activeRunId` to a valid active run.
- Invalid selection requests are safely ignored.
- If selected run ends, fallback selection follows req054 rules.
- Reducer tests cover valid selection, invalid selection, and post-end fallback.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_054_multi_dungeon_parallel_runs_with_tab_navigation.md`.
- Likely touch points:
  - `src/core/reducer.ts`
  - `src/core/types.ts`
  - `tests/core/dungeon.test.ts`
  - `tests/core/dungeonState.test.ts`
