## task_095_execute_dungeon_weighted_loot_tables_and_exclusive_drop_discovery_across_backlog_items_139_to_144 - Execute dungeon weighted loot tables and exclusive drop discovery across backlog items 139 to 144
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_139_define_dungeon_weighted_loot_table_schema_and_validation.md`
- `logics/backlog/item_140_add_dungeon_exclusive_items_and_registry_metadata.md`
- `logics/backlog/item_141_integrate_floor_and_boss_loot_rolls_into_dungeon_runtime.md`
- `logics/backlog/item_142_wire_dungeon_loot_events_into_inventory_and_action_journal.md`
- `logics/backlog/item_143_tune_drop_weights_and_balance_for_existing_and_exclusive_items.md`
- `logics/backlog/item_144_add_dungeon_loot_probability_and_regression_test_coverage.md`

Request reference:
- `logics/request/req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items.md`

This task orchestrates end-to-end delivery of dungeon-specific weighted loot with rare dungeon-exclusive ring/amulet rewards, single-loot-per-clear behavior, preparation-tab visibility, and discovery masking (`??`).

# Decisions (v1)
- Exactly one loot reward per successful dungeon clear.
- Rare dungeon-exclusive items are ring/amulet only.
- Loot power scales with dungeon difficulty.
- Loot table is visible in dungeon preparation view.
- Undiscovered entries are rendered as `??` until first ownership.
- Final delivery requires full test battery pass.

# Plan
- [ ] 1. Baseline and guardrails:
  - Confirm current dungeon reward paths and inventory/journal integration points.
  - Define seed-based deterministic test strategy.
- [ ] 2. Execute `item_139` (loot schema + validation):
  - Add typed loot table contracts and per-dungeon data coverage.
  - Add schema/guard validation tests.
- [ ] 3. Execute `item_140` (exclusive items + metadata):
  - Add ring/amulet exclusive rare items and source metadata.
  - Ensure non-dungeon loops cannot grant exclusive items.
- [ ] 4. Execute `item_141` (runtime integration):
  - Implement exactly one weighted reward on victory.
  - Enforce no loot on failed/aborted runs.
- [ ] 5. Execute `item_142` (inventory + journal + discovery state):
  - Persist loot + discovery flags.
  - Emit journal/event messages for obtained loot.
- [ ] 6. Execute `item_143` (balance tuning):
  - Tune weights and power progression by dungeon tier.
  - Validate rarity/economy constraints.
- [ ] 7. Execute `item_144` (coverage + regression):
  - Add deterministic and UI masking tests.
  - Validate no regressions in dungeon/replay flows.
- [ ] 8. Final mandatory full test battery:
  - Run complete validation suite.
  - Fix all failing checks before marking task complete.
- [ ] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`

# Report
- Pending implementation.
