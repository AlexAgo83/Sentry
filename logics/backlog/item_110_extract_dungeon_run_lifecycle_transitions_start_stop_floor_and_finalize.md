## item_110_extract_dungeon_run_lifecycle_transitions_start_stop_floor_and_finalize - Extract dungeon run lifecycle transitions start stop floor and finalize
> From version: 0.9.24
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Run lifecycle transitions (`startDungeonRun`, `stopDungeonRun`, floor init/finalize) are deeply interleaved with tick internals in `src/core/dungeon.ts`, making flow changes risky.

# Scope
- In:
- Extract lifecycle transitions into `src/core/dungeon/lifecycle.ts`:
  - start/stop run entrypoints
  - floor initialization and finalize helpers
  - shared lifecycle-level helpers tied to transitions
- Preserve integration with reducer/loop/runtime call sites.
- Out:
- No tick phase split yet.
- No replay UI changes.

# Acceptance criteria
- Lifecycle transitions are separated from tick internals.
- Start/stop/floor progression behavior stays equivalent.
- Existing lifecycle-related tests pass.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_038_split_core_dungeon_module_into_domain_focused_files.md`.
- Key references: `src/core/dungeon.ts`, `src/core/reducer.ts`, `src/core/loop.ts`.
