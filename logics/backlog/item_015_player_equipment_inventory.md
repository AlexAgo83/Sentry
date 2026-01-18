## item_015_player_equipment_inventory - Add per-player equipment inventory with fixed slots
> From version: 0.8.0
> Understanding: 94%
> Confidence: 87%
> Progress: 0%

# Context
Inventory is currently shared and not tied to individual players. We want character-specific equipment with fixed slots (head, torso, legs, hands, etc.) plus weapon slots for melee, ranged, and magic.

# Goal
Introduce a per-player equipment system with fixed slots, supporting armor and weapon categories, and ensure gameplay can read equipped items.

# Needs
- Add per-player equipment inventory data to player state.
- Define fixed equipment slots (v1):
  - Head, Torso, Legs, Hands, Feet.
  - Weapon slot: Weapon (single slot).
- Define item categories:
  - Armor items map to one slot (head/torso/legs/hands/feet).
  - Weapons map to the weapon slot with a type (melee/ranged/magic).
- Add recipes that can generate equippable items.
- Equippable items include stat characteristics.
- Equipped items modify player stats when equipped.
- Equip/unequip actions with validation (slot compatibility, one item per slot).
- Persist equipped items in save state.
- UI: show equipped items in a dedicated Equipment panel (new tab next to Inventory).
- Ensure shared inventory can supply items to equip (no duplication).
- Provide an explicit unequip action (return item to shared inventory).
- Define starter gear + recipes for each slot (basic tier) and three basic weapon types.
- Suggested starter gear + recipes (v1):
  - Head: Cloth Cap (Tailoring) -> costs: cloth x2, leather x1; stats: Intellect +1.
  - Torso: Linen Tunic (Tailoring) -> costs: cloth x4, leather x1; stats: Endurance +2.
  - Legs: Worn Trousers (Tailoring) -> costs: cloth x3; stats: Agility +1.
  - Hands: Leather Gloves (Leatherworking) -> costs: leather x3; stats: Strength +1.
  - Feet: Simple Boots (Leatherworking) -> costs: leather x3, cloth x1; stats: Agility +1.
  - Weapon (Melee): Rusty Blade (MetalWork) -> costs: ingot x2, wood x1; stats: Strength +2.
  - Weapon (Ranged): Simple Bow (Carpentry) -> costs: wood x3, leather x1; stats: Agility +2.
  - Weapon (Magic): Apprentice Staff (Carpentry) -> costs: wood x2, crystal x1; stats: Intellect +2.

# Decisions
- Fixed slots only in v1; no rings/trinkets or off-hand yet.
- Each slot holds at most one item.
- Equip validation rejects incompatible item types.
- Items remain in shared inventory; equipped state references item ids.
- Only one weapon can be equipped at a time (single weapon slot).
- Equippable item stats are flat modifiers only in v1 (no multipliers yet).
- Crafting is the only source of equippable items in v1.
- Use a dedicated Equipment panel for the UI (avoid overloading Stats).
- No stat requirements to equip in v1.
- No rarity tiers in v1 (consider later).
- Equipment items can stack like regular inventory items.
- Equipment affects stats only in v1 (no recipe/skill unlocks yet).
- Equipping into an occupied slot auto-swaps (no confirmation).
- Equipment is swappable between players (not bound).
- Equipment recipes use a dedicated equipment item type in definitions.
- Empty slots show a slot icon + label (e.g., "Empty Head").
- Equipping consumes 1 item from inventory; unequipping returns 1.
- Equipping requires the item to exist in shared inventory (crafting outputs must be stored first).
- Store equipment as item ids (no instance ids in v1, since items can stack).
- Keep future stat/level requirements in mind for v2.

# Scope (v1)
- Data model + equip/unequip flows.
- Minimal UI for viewing and changing equipment per player.
- No item durability or stat scaling yet.
- No crafting or loot table changes required in v1.
- Generate/assign assets for new equipment items and for equipment slot icons if needed.

# Acceptance
- Player state includes equipment slots with item references.
- Equip/unequip works with slot validation.
- Equipped items persist across reloads.
- UI shows current equipment for the active player.
- Equipping consumes 1 stack count and unequipping restores 1.
- Weapon slot accepts melee/ranged/magic types, but only one equipped at a time.

# Open questions
- Exact slot list for v1 (confirm feet vs boots naming).
- How to represent empty slots in UI.
- Confirm starter gear list and recipe costs.
