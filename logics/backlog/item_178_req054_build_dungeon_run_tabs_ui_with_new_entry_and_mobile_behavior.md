## item_178_req054_build_dungeon_run_tabs_ui_with_new_entry_and_mobile_behavior - req054 build dungeon run tabs UI with New entry and mobile behavior
> From version: 0.9.36
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: Large
> Theme: UI / Navigation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dungeon panel has no in-panel navigation model for multiple active runs. Users cannot switch run context quickly, and setup access while runs are active is unclear.

# Scope
- In:
- Add run tabs above Dungeon panel content when at least one run is active.
- Render one tab per active run plus trailing `New`.
- Use label rules from req054:
  - desktop: `Dungeon 1`, `Dungeon 2`, ...
  - mobile: `1`, `2`, ...
- Keep tab ordering by run start order and allow renumbering after run removal.
- Keep mobile implementation without horizontal tab scrolling in this request.
- Out:
- Core lifecycle concurrency changes (covered in item_176).
- Hero availability locking logic in setup (covered in item_179).

# Acceptance criteria
- Tabs are shown only when at least one run is active.
- Selecting a run tab switches displayed live context to that run.
- Selecting `New` switches to setup context.
- Labels and order match req054 desktop/mobile rules.
- No layout regression in current dungeon panel header/actions.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_054_multi_dungeon_parallel_runs_with_tab_navigation.md`.
- Likely touch points:
  - `src/app/components/DungeonScreen.tsx`
  - `src/app/containers/DungeonScreenContainer.tsx`
  - `src/app/styles/panels/dungeon.css`
  - `tests/app/dungeonScreen.controls.test.tsx`
