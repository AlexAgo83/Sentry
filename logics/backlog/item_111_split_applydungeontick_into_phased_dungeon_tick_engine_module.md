## item_111_split_applydungeontick_into_phased_dungeon_tick_engine_module - Split applyDungeonTick into phased dungeon tick engine module
> From version: 0.9.24
> Understanding: 96%
> Confidence: 90%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`applyDungeonTick` (~536 lines) concentrates the entire combat simulation in one function, making timing/order regressions difficult to detect and reason about.

# Scope
- In:
- Move tick engine to `src/core/dungeon/tick.ts` and split in explicit phases:
  - pre-step setup
  - hero attack phase
  - enemy attack phase
  - heal/consumable phase
  - end-of-step resolution
- Keep deterministic event ordering and current side-effects.
- Ensure performance is not degraded materially.
- Out:
- No balance tuning changes.
- No visual/UI changes.

# Acceptance criteria
- `applyDungeonTick` is modularized into clearly named internal phases.
- Event ordering, threat updates, and outcome parity are preserved.
- Existing dungeon loop/tick tests pass; add non-regression checks for phase ordering.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_038_split_core_dungeon_module_into_domain_focused_files.md`.
- Key references: `src/core/dungeon.ts`, `tests/core/dungeon.test.ts`, `tests/core/loop.test.ts`.
