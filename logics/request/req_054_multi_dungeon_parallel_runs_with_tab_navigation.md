## req_054_multi_dungeon_parallel_runs_with_tab_navigation - Multi-dungeon concurrent runs with tab navigation and New setup entry
> From version: 0.9.36
> Understanding: 97%
> Confidence: 93%
> Complexity: Large
> Theme: Gameplay / UX
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Support running multiple dungeons at the same time.
- Add dungeon tabs above the Dungeon panel content to switch between in-progress runs.
- Add a `New` tab to open the dungeon setup/selection view and start a new run.
- A hero already assigned to an active dungeon run must not be selectable again for another run.

# Locked decisions (v1)
- No product-level max concurrent dungeon count is imposed in this request.
- If there is no active dungeon run, do not render dungeon run tabs.
- Tab labels on desktop are sequence-based (`Dungeon 1`, `Dungeon 2`, ...).
- Tab labels on mobile are compact sequence-only (`1`, `2`, ...).
- Run tab order follows run start order (oldest started first).
- Tab numbering can be recomputed after run removal (renumbering is accepted).
- When `New` setup tab is selected, run-specific controls (including `Stop`) are hidden or disabled.
- Replay remains global (`latestReplay`) and is not bound to the selected run tab in this request.
- Heroes already assigned to an active run remain visible in setup, but are disabled with an `In dungeon` badge.
- When a run ends, its tab is removed immediately; if it was active, focus falls back to the next active run by start order, else `New` setup.
- No toast notification is shown when a run tab disappears after run end.

# Context
- The dungeon state model is already multi-run ready (`runs`, `activeRunId`, policy fields), but current lifecycle enforces v1 single-run behavior.
- Current UI renders one active run or setup/replay screen, with no session-level tab navigation.
- Players need a fast way to jump between concurrent runs without losing visibility/control.

# Goals
- Enable concurrent dungeon runs without a product cap in this scope.
- Display one tab per in-progress run plus one trailing `New` tab.
- Switching tabs updates the active dungeon context (live view + controls) without stopping background progression of other runs.
- Selecting `New` opens the existing setup flow even when one or more runs are active.
- Preserve existing constraints (4 unique heroes per run, no hero in two active runs, existing replay behavior).

# Non-goals
- Rework dungeon combat formulas or balancing.
- Add cross-run shared party slots (a hero cannot belong to multiple active runs).
- Redesign replay system into multi-replay tabs in this request.

# Scope detail (draft)
## A. Core lifecycle and state behavior
- Remove v1 single-run gate.
- Keep existing start-run validation gates (party size, hero uniqueness, food cost, roster existence).
- Add an explicit action to set the active run from UI tab selection (e.g. `dungeonSetActiveRun`).
- Keep deterministic fallback when active run ends: pick next available active run if any, else no active run.

## B. Dungeon tab navigation UI
- Add a run tab strip above the Dungeon panel content area.
- Reuse the same visual/tab interaction patterns as hero/action-stats-equip style tabs.
- Use sequence labels in start order:
  - desktop: `Dungeon 1`, `Dungeon 2`, ...
  - mobile: `1`, `2`, ...
- Keep keyboard and screen-reader semantics aligned with existing tab components.
- Do not render the tab strip when there is no active run.

## C. `New` tab behavior
- `New` is visible as the last tab when at least one run is active.
- Selecting `New` opens setup view (`DungeonSetupView`) without cancelling active runs.
- Starting from setup creates a new run and switches focus to its run tab.
- Primary setup CTA label in this context is `Start new dungeon`.
- In setup, heroes already present in any active run are visibly locked and cannot be toggled into the new party.
- In setup view, run-specific actions such as `Stop` are not actionable.

## D. Mobile behavior
- Tabs must remain usable on small screens without introducing horizontal tab scrolling in this request.
- Touch targets remain compliant with existing mobile controls sizing.
- Switching tabs must not interfere with replay toggle or stop/run controls.

## E. Persistence and migration
- Persist active run selection via existing dungeon state (`activeRunId`).
- No save-schema migration required unless new persisted UI-only fields are introduced.

# Technical references likely impacted
- `src/core/dungeon/lifecycle.ts`
- `src/core/dungeon/state.ts`
- `src/core/reducer.ts`
- `src/core/types.ts`
- `src/app/containers/DungeonScreenContainer.tsx`
- `src/app/components/DungeonScreen.tsx`
- `src/app/components/dungeonScreen/components/DungeonHeaderActions.tsx`
- `src/app/components/dungeonScreen/components/DungeonSetupView.tsx`
- `src/app/styles/panels/dungeon.css`
- `tests/core/dungeon.test.ts`
- `tests/core/dungeonState.test.ts`
- `tests/app/dungeonScreen.controls.test.tsx`
- `tests/app/sidePanelSwitcher.dungeonActive.test.tsx`

# Acceptance criteria
- Players can run more than one dungeon concurrently.
- Dungeon panel shows one tab per in-progress run and a `New` tab.
- Selecting a run tab switches active run context immediately.
- Selecting `New` opens setup view even when other runs are active.
- Starting a run from `New` creates a new tab and selects it.
- A hero already assigned to another active dungeon cannot be selected in the new run party picker.
- Heroes already assigned to another active run stay visible in setup with an explicit `In dungeon` status.
- When no run is active, no dungeon run tabs are shown.
- Run tabs are ordered by run start time and labeled `Dungeon N` (desktop) / `N` (mobile).
- Run tabs may renumber after an ended run is removed.
- While `New` is selected, `Stop` is hidden/disabled.
- Replay behavior remains global (`latestReplay`) independent of selected run tab.
- Ended runs are removed from tabs immediately with deterministic fallback selection.
- No toast is emitted on automatic tab removal after run end.
- Existing replay and stop/run controls continue to function correctly for the selected run.
- No regression on single-run behavior when only one run is active.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - core tests for concurrent run creation and active run switching.
  - reducer tests for `dungeonSetActiveRun` behavior and fallback when run ends.
  - app tests for tab rendering, `New` tab setup navigation, mobile tab usability, and disabled `In dungeon` heroes.

# Risks / open points
- Concurrent runs increase visual/event activity and can expose hidden assumptions in control wiring.
- Replay interaction precedence must remain explicit when setup/run tabs are introduced.

# Backlog
- `logics/backlog/item_176_req054_enable_policy_driven_multi_dungeon_concurrency_in_lifecycle.md`
- `logics/backlog/item_177_req054_add_active_dungeon_run_selection_action_and_reducer_coverage.md`
- `logics/backlog/item_178_req054_build_dungeon_run_tabs_ui_with_new_entry_and_mobile_behavior.md`
- `logics/backlog/item_179_req054_wire_new_tab_to_setup_flow_with_concurrent_limit_guardrails.md`
- `logics/backlog/item_180_req054_expand_core_and_ui_regression_tests_for_multi_dungeon_navigation.md`
