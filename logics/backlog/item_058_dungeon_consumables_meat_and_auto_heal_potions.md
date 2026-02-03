## item_058_dungeon_consumables_meat_and_auto_heal_potions - Dungeon consumables meat and auto-heal potions
> From version: 0.8.22
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Problem
Dungeon loop depends on resource pressure and survivability rules (meat consumption, potion healing, stop conditions) to create meaningful run management.

# Scope
- In:
  - Apply meat consumption at the start of each floor using floor/tier rules and boss surcharge.
  - Stop run immediately when meat reaches zero.
  - Implement potion auto-use below 50% HP with per-hero cooldown.
  - Apply potion consumption priority: tonic -> elixir -> potion.
  - Keep potion usage limited by inventory stock (not capped per floor).
  - Ensure healing potion availability through Alchemy recipes and inventory integration.
- Out:
  - Manual revive system and healer services.
  - New potion categories beyond current v1 needs.

# Acceptance criteria
- Meat decreases at floor start according to dungeon rules and blocks continuation at zero.
- Potions auto-trigger only when HP threshold is met and cooldown allows.
- Potion selection follows tonic -> elixir -> potion priority when multiple types are available.
- Potion consumption updates inventory correctly during live and offline simulation.
- Runs continue or stop according to resource rules without desync.

# Priority
- Impact: High (core balance and fail/success behavior).
- Urgency: Medium (depends on simulation core but required for realistic loop).

# Notes
- Source request: `logics/request/req_018_group_idle_dungeon_combat_loop.md`
- Derived from `logics/request/req_018_group_idle_dungeon_combat_loop.md`.
