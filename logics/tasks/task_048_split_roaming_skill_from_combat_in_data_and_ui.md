## task_048_split_roaming_skill_from_combat_in_data_and_ui - Split roaming skill from combat in data and UI
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_062_split_roaming_skill_from_combat_in_data_and_ui.md`.

This task establishes a clean domain split:
- `Roaming` = action/recipe progression.
- `Combat` = dungeon-only progression (not action-selectable).

# Plan
- [x] 1. Update core skill model and definitions:
  - Add `Roaming` to `SkillId` and player skill initialization.
  - Keep `Combat` as a distinct skill entry and ensure naming/metadata are explicit.
- [x] 2. Rewire roaming behavior to `Roaming`:
  - Update roaming action definitions and recipe skill bindings from `Combat` to `Roaming`.
  - Keep dungeon scaling references on `Combat`.
- [x] 3. Update UI flow for split behavior:
  - Ensure Action selection never exposes `Combat`.
  - Keep Dungeon and Stats views explicitly showing/using `Combat` where relevant.
  - Remove legacy roaming UI text that implies `Combat`.
- [x] 4. Add dedicated skill visuals:
  - Wire `Combat`/`Roaming` icon + background mappings to dedicated assets.
  - Verify no fallback to legacy roaming visuals for `Combat`.
- [x] 5. Add/adjust targeted tests for data/UI split boundaries.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Added explicit `Roaming` skill ID and kept `Combat` as dungeon progression skill.
- Removed `Combat` from action selection by splitting action-capable skills from full skill catalog.
- Migrated roaming recipes/actions to `Roaming` and removed roaming wiring from `Combat`.
- Updated UI mappings and roster behavior so dungeon-assigned heroes surface `Combat` progression context.
- Added dedicated assets and mappings for `Combat`/`Roaming`.
