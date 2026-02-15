## req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items - Add weighted dungeon loot tables with dungeon-exclusive rare items
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Complexity: High
> Theme: Feature
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a probable/weighted loot table for each dungeon.
- Each dungeon loot table must include:
  - a mix of existing items,
  - rarer items available only from dungeons.
- Apply explicit gameplay rules:
  - exactly `1` loot reward per dungeon clear,
  - rare items are ring/amulet types for now,
  - loot power scales with dungeon difficulty,
  - loot table is visible in dungeon preparation UI,
  - undiscovered loot entries are masked as `??` until first ownership.

# Context
- Dungeons currently consume resources (food) and grant progression value, but no explicit per-dungeon weighted loot identity exists.
- Dungeon definitions already exist (`tier`, `boss`, `floorCount`) and are good anchors for per-dungeon loot profiles.
- A dungeon-specific loot economy can improve replayability and strengthen content identity.

# Goals
- Give each dungeon a recognizable loot profile.
- Introduce rare, dungeon-exclusive items as long-term goals.
- Keep drops deterministic enough for testing while preserving probabilistic behavior in gameplay.

# Locked decisions (v1)
- Loot is defined per dungeon via weighted entries.
- A dungeon loot table can contain:
  - existing global items,
  - dungeon-exclusive items.
- Dungeon-exclusive items are not obtainable from regular non-dungeon loops.
- Exactly `1` loot reward is granted on successful dungeon clear (`run.status === "victory"`).
- Rare drops must have lower weight than common drops by default.
- Rare dungeon-exclusive items are limited to `Ring` and `Amulet` slots in this version.
- Loot power must scale with dungeon difficulty (higher-tier dungeons produce stronger loot pools).
- Loot table is visible in the dungeon preparation tab.
- Loot discovery masking:
  - entries stay hidden as `??` while never owned,
  - an entry is revealed after the player has owned that item at least once in the save history.
- RNG remains seed-driven using existing dungeon run seed model for reproducibility.
- No paywall/progression gate tied to exclusive drops in this request.

# Scope detail (draft)
- Data model
  - Extend dungeon definitions (or adjacent data registry) with weighted loot tables.
  - Add support for `dungeonExclusive` item metadata.
  - Add loot discovery metadata support to drive `??` masking in UI.
  - Define a stable loot entry contract:
    - `itemId`
    - `weight`
    - `quantityMin`
    - `quantityMax`
    - optional rarity/type metadata for UI labeling.

- Runtime integration
  - On successful dungeon clear resolution, execute exactly one weighted loot roll and apply item delta to inventory.
  - Mark rolled item as discovered for future table reveal.
  - Emit action journal/event log lines for obtained dungeon loot.
  - Ensure no loot is granted when dungeon run fails/aborts.

- UI integration
  - Show dungeon loot table in preparation tab.
  - Render undiscovered entries as `??` until revealed.
  - Keep table informative (rarity/type/weight tier messaging) without exposing hidden item identity.

- Economy constraints
  - Existing items in dungeon tables should respect rarity intent and avoid destabilizing baseline loops.
  - Exclusive drop rates should be low but not effectively unreachable.
  - Progressive power by dungeon tier must remain monotonic at pool level (no tier inversion).

# Suggested data contract (draft)
- `DungeonLootEntry`
  - `itemId: InventoryItemId`
  - `weight: number`
  - `quantityMin: number`
  - `quantityMax: number`
  - `bossOnly?: boolean`

- `DungeonLootTable`
  - `floorClearRolls: number`
  - `bossClearBonusRolls: number`
  - `entries: DungeonLootEntry[]`

# Technical references to update
- `src/data/dungeons.ts`
- `src/data/definitions/items.ts` (or equivalent item registry source)
- `src/core/dungeon/lifecycle.ts`
- `src/core/dungeon/tick.ts`
- `src/core/dungeon/formulas.ts` (if extraction/helper formulas are needed)
- `src/core/reducer.ts` / event journal integration points
- `src/core/state.ts` (if loot discovery state is persisted in save)
- `src/app/components/dungeonScreen/components/DungeonSetupView.tsx`
- `src/app/components/dungeonScreen/hooks/*` (if prep view model/hook is split)
- `tests/core/dungeon*.test.ts`
- `tests/core/dungeonReplay*.test.ts`
- `tests/app/dungeonScreen*.test.tsx`
- `tests/app/actionJournalModal.test.tsx` (if new journal label expectations are added)

# Acceptance criteria
- Every dungeon has a defined weighted loot table.
- A successful dungeon clear grants exactly one loot reward according to table weights.
- Loot includes both existing items and dungeon-exclusive rare items.
- Rare dungeon-exclusive items are ring/amulet items only.
- Dungeon-exclusive items are not granted by non-dungeon sources.
- Loot pool/item power increases with dungeon difficulty tiers.
- Dungeon preparation tab displays the dungeon loot table.
- Undiscovered loot entries are shown as `??` until first ownership.
- Item quantities and probabilities are bounded and validated.
- Inventory updates and journal/event traces reflect dungeon loot drops.
- No regressions on dungeon start/stop/replay flows.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - deterministic weighted-roll tests using fixed seeds,
  - single-loot-per-clear coverage,
  - no-loot-on-failure coverage,
  - exclusive-item source restriction tests,
  - rarity slot restriction tests (rings/amulets only for rare exclusive pool),
  - scaling tests ensuring higher-tier pools yield stronger loot bands,
  - prep-tab UI tests for visible table + `??` masking/reveal behavior,
  - inventory delta assertions per successful dungeon clear.

# Risks / open points
- Badly tuned weights can create economy inflation or perceived unfairness.
- If exclusive items are too rare, player value may be invisible; too common may trivialize goals.
- New drop events can increase replay/event payload size if not capped appropriately.
- Discovery-state persistence must not regress save compatibility or leak hidden entries prematurely.

# Backlog
- `logics/backlog/item_139_define_dungeon_weighted_loot_table_schema_and_validation.md`
- `logics/backlog/item_140_add_dungeon_exclusive_items_and_registry_metadata.md`
- `logics/backlog/item_141_integrate_floor_and_boss_loot_rolls_into_dungeon_runtime.md`
- `logics/backlog/item_142_wire_dungeon_loot_events_into_inventory_and_action_journal.md`
- `logics/backlog/item_143_tune_drop_weights_and_balance_for_existing_and_exclusive_items.md`
- `logics/backlog/item_144_add_dungeon_loot_probability_and_regression_test_coverage.md`
