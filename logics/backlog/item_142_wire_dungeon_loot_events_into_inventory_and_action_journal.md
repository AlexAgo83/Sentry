## item_142_wire_dungeon_loot_events_into_inventory_and_action_journal - Wire dungeon loot events into inventory, discovery state, and action journal
> From version: 0.9.28
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Integration
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Loot gains must be visible and persisted consistently, including discovery tracking for hidden loot table entries.

# Scope
- In:
- Persist loot gains in inventory updates.
- Add discovery-state tracking per item (owned at least once).
- Emit clear action journal/event entries for dungeon loot rewards.
- Ensure save/load preserves discovery state.
- Out:
- No balancing of drop rates in this item.

# Acceptance criteria
- Loot reward updates inventory and is visible in recap/journal traces.
- First acquisition marks item as discovered.
- Discovery state persists across save/load.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items.md`.
- Main references: `src/core/reducer.ts`, `src/core/state.ts`, journal-related UI/tests.
