## item_141_integrate_floor_and_boss_loot_rolls_into_dungeon_runtime - Integrate loot rolls into dungeon runtime with single-clear reward rule
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Runtime
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dungeon runtime does not currently execute weighted loot rewards tied to clear outcomes.

# Scope
- In:
- Integrate weighted roll logic into dungeon runtime flow.
- Grant exactly one loot reward on successful dungeon clear (`victory`).
- Ensure failed/aborted runs grant no loot.
- Keep RNG deterministic through run seed strategy.
- Apply loot quantity roll and inventory delta update safely.
- Out:
- No UI rendering of loot table in this item.

# Acceptance criteria
- Successful clear grants exactly one item reward from the dungeon table.
- Failed/aborted runs grant none.
- Results are deterministic under fixed seed/test setup.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items.md`.
- Main references: `src/core/dungeon/lifecycle.ts`, `src/core/dungeon/tick.ts`.
