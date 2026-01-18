## item_015_player_equipment_inventory - Add per-player equipment inventory with fixed slots
> From version: 0.8.0
> Understanding: 80%
> Confidence: 72%
> Progress: 0%

# Context
Inventory is currently shared and not tied to individual players. We want character-specific equipment with fixed slots (head, torso, legs, hands, etc.) plus weapon slots for melee, ranged, and magic.

# Goal
Introduce a per-player equipment system with fixed slots, supporting armor and weapon categories, and ensure gameplay can read equipped items.

# Needs
- Add per-player equipment inventory data to player state.
- Define fixed equipment slots (v1):
  - Head, Torso, Legs, Hands, Feet.
  - Weapon slots: Melee, Ranged, Magic.
- Define item categories:
  - Armor items map to one slot (head/torso/legs/hands/feet).
  - Weapons map to one weapon slot (melee/ranged/magic).
- Add recipes that can generate equippable items.
- Equippable items include stat characteristics.
- Equipped items modify player stats when equipped.
- Equip/unequip actions with validation (slot compatibility, one item per slot).
- Persist equipped items in save state.
- UI: show equipped items in a player view (Stats panel or dedicated equipment panel).
- Ensure shared inventory can supply items to equip (no duplication).

# Decisions
- Fixed slots only in v1; no rings/trinkets or off-hand yet.
- Each slot holds at most one item.
- Equip validation rejects incompatible item types.
- Items remain in shared inventory; equipped state references item ids.
- Weapons are one-per-slot with no active switcher in v1.
- Equippable item stats are flat modifiers only in v1 (no multipliers yet).
- Crafting is the only source of equippable items in v1.
- Use a dedicated Equipment panel for the UI (avoid overloading Stats).
- No stat requirements to equip in v1.
- No rarity tiers in v1.
- Equipment items are unique instances (no stacking).
- Equipment affects stats only in v1 (no recipe/skill unlocks yet).
- Equipping into an occupied slot auto-swaps (no confirmation).
- Equipment is swappable between players (not bound).

# Scope (v1)
- Data model + equip/unequip flows.
- Minimal UI for viewing and changing equipment per player.
- No item durability or stat scaling yet.
- No crafting or loot table changes required in v1.

# Acceptance
- Player state includes equipment slots with item references.
- Equip/unequip works with slot validation.
- Equipped items persist across reloads.
- UI shows current equipment for the active player.
- Equipping does not remove items from shared inventory (reference only).

# Open questions
- Exact slot list for v1 (confirm feet vs boots naming).
- How to represent empty slots in UI.
- Whether to allow multiple weapons equipped simultaneously (swap behavior).
