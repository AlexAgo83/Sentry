## item_109_extract_dungeon_state_factories_normalization_and_selectors - Extract dungeon state factories normalization and selectors
> From version: 0.9.24
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
State factory, normalization, and selectors are mixed with runtime engine logic in `src/core/dungeon.ts`, causing unnecessary coupling between persistence/state concerns and combat simulation.

# Scope
- In:
- Move state-focused logic into `src/core/dungeon/state.ts`:
  - `createDungeonState`
  - `normalizeDungeonState`
  - selectors (`getDungeonRuns`, `getActiveDungeonRun`, etc.)
- Keep behavior parity for normalization and active run selection.
- Update callers in core/app modules.
- Out:
- No gameplay mechanics changes.
- No tick/lifecycle extraction in this item.

# Acceptance criteria
- State factory/normalization/selectors are isolated in dedicated module.
- Save load/normalization behavior is unchanged.
- Existing dungeon state tests pass.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_038_split_core_dungeon_module_into_domain_focused_files.md`.
- Key references: `src/core/dungeon.ts`, `tests/core/dungeonState.test.ts`.
