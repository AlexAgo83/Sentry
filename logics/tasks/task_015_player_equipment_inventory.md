## task_015_player_equipment_inventory - Execute backlog item 015
> From version: 0.8.0
> Understanding: 97%
> Confidence: 94%
> Progress: 100%

# Context
This task executes `item_015_player_equipment_inventory`.

# Plan
- [x] 1. Define equipment slot enums (single Weapon slot) and equipable item schema (slot, weapon type, stat modifiers, equipment item type).
- [x] 2. Extend player state + save schema with equipment slots and migrate saves safely.
- [x] 3. Add equip/unequip actions with slot validation, explicit unequip, auto-swap, and stack count changes.
- [x] 4. Enforce equip requirements: item must exist in shared inventory; consume 1 on equip, restore 1 on unequip.
- [x] 5. Hook equipment modifiers into stat calculations (reuse item 014 helper).
- [x] 6. Add starter gear + equipment recipes and item definitions (crafting-only in v1).
- [x] 7. Generate/assign assets for equipment items and slot icons (if needed).
- [x] 8. Build a dedicated Equipment panel for viewing/equipping items (empty slot labels/icons).
- [x] 9. Add tests for equip validation, persistence, and stack count behavior.
- [x] 10. Run lint/tests and update backlog/task docs.
- [x] FINAL: Confirm acceptance criteria and progress for item 015.

# Report
1. Added equipment model, definitions, recipes, and inventory metadata.
2. Implemented equip/unequip flows with inventory consumption + auto-swap, and wired modifiers into stats.
3. Built Equipment panel UI and added tests; lint/tests/coverage passing.
