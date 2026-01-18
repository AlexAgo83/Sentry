## task_015_player_equipment_inventory - Execute backlog item 015
> From version: 0.8.0
> Understanding: 92%
> Confidence: 84%
> Progress: 0%

# Context
This task executes `item_015_player_equipment_inventory`.

# Plan
- [ ] 1. Define equipment slot enums (single Weapon slot) and equipable item schema (slot, weapon type, stat modifiers, equipment item type).
- [ ] 2. Extend player state + save schema with equipment slots and migrate saves safely.
- [ ] 3. Add equip/unequip actions with slot validation, explicit unequip, auto-swap, and stack count changes.
- [ ] 4. Enforce equip requirements: item must exist in shared inventory; consume 1 on equip, restore 1 on unequip.
- [ ] 5. Hook equipment modifiers into stat calculations (reuse item 014 helper).
- [ ] 6. Add starter gear + equipment recipes and item definitions (crafting-only in v1).
- [ ] 7. Generate/assign assets for equipment items and slot icons (if needed).
- [ ] 8. Build a dedicated Equipment panel for viewing/equipping items (empty slot labels/icons).
- [ ] 9. Add tests for equip validation, persistence, and stack count behavior.
- [ ] 10. Run lint/tests and update backlog/task docs.
- [ ] FINAL: Confirm acceptance criteria and progress for item 015.

# Report
1.
2.
3.
