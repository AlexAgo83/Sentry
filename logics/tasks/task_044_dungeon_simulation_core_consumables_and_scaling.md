## task_044_dungeon_simulation_core_consumables_and_scaling - Dungeon simulation core consumables and scaling
> From version: 0.8.22
> Understanding: 94%
> Confidence: 89%
> Progress: 100%

# Context
Derived from:
- `logics/backlog/item_056_headless_dungeon_combat_simulation_core.md`
- `logics/backlog/item_057_dungeon_v1_data_pack_and_boss_mechanics.md`
- `logics/backlog/item_058_dungeon_consumables_meat_and_auto_heal_potions.md`

This task ships the simulation-authoritative dungeon runtime and the first playable content pack (5 dungeons, scaling, boss behavior, consumable rules).

# Plan
- [x] 1. Implement headless simulation loop with fixed 500ms step and deterministic target selection rules.
- [x] 2. Model run lifecycle: floor progression, boss encounter, immediate clear on boss kill, wipe stop, and 3s auto-restart when eligible.
- [x] 3. Add v1 dungeon data pack (5 dungeons), configurable floor count (default 10), boss signatures, and recommended power values.
- [x] 4. Integrate consumables: floor-start meat consumption, zero-meat hard stop, auto-use potions below 50% HP, and tonic->elixir->potion priority.
- [x] 5. Emit deterministic simulation events required by persistence/replay/renderer consumers.
- [x] 6. Add/adjust tests for deterministic outcomes, scaling correctness, boss behavior, and resource stop conditions.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run test:ci
- npm run build

# Report
- Completed in code: headless dungeon simulation core, v1 5-dungeon data pack, boss mechanics, consumables behavior, deterministic event timeline, and dedicated dungeon runtime tests.
