## item_140_add_dungeon_exclusive_items_and_registry_metadata - Add dungeon-exclusive items and registry metadata
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Content
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dungeon-exclusive rare rewards require explicit item definitions and source metadata to enforce exclusivity and slot constraints.

# Scope
- In:
- Add rare dungeon-exclusive items in item registry.
- Restrict rare exclusive set to ring/amulet slots for v1.
- Add metadata to mark items as dungeon-exclusive and rarity tier.
- Ensure non-dungeon reward paths do not include those items.
- Out:
- No balancing/tuning across all dungeons in this item.

# Acceptance criteria
- New exclusive rare items exist and are valid.
- Rare exclusive items are only ring/amulet.
- Non-dungeon sources cannot grant these exclusives.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items.md`.
- Main references: `src/data/definitions/items.ts`, non-dungeon reward definitions.
