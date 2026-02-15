## item_139_define_dungeon_weighted_loot_table_schema_and_validation - Define dungeon weighted loot table schema and validation
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Data
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dungeon loot behavior needs an explicit, validated schema so each dungeon can expose a deterministic weighted loot profile.

# Scope
- In:
- Define typed dungeon loot contracts (`DungeonLootEntry`, `DungeonLootTable`).
- Attach a loot table to every dungeon definition.
- Validate table integrity:
  - positive weights,
  - valid quantity bounds,
  - referenced item ids exist,
  - table is non-empty.
- Encode `single reward per successful clear` rule in schema-level expectations.
- Out:
- No runtime roll execution in this item.

# Acceptance criteria
- Every dungeon has a valid loot table definition.
- Invalid loot table data is rejected or fails tests.
- Contracts are reusable by runtime and UI layers.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items.md`.
- Main references: `src/data/dungeons.ts`, `src/core/types.ts`.
