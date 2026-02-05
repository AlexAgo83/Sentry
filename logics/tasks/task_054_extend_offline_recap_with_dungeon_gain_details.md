## task_054_extend_offline_recap_with_dungeon_gain_details - Extend offline recap with dungeon gain details
> From version: 0.9.5
> Understanding: 95%
> Confidence: 91%
> Progress: 0%

# Context
Derived from `logics/backlog/item_068_extend_offline_recap_with_dungeon_gain_details.md`.

This task upgrades the offline recap model/UI so dungeon gains are explicitly visible per player and not confused with action-only progression.

# Plan
- [ ] 1. Extend offline summary domain model:
  - Add explicit dungeon gain fields per player (Combat XP + dungeon item/gold deltas).
  - Keep backward-compatible defaults for previous save/runtime shapes.
- [ ] 2. Update recap aggregation pipeline:
  - Merge action-loop and dungeon-loop gains in one recap build.
  - Preserve total delta coherence with global `totalItemDeltas`.
- [ ] 3. Update recap UI rendering:
  - Add separated lines/sections for `Action gains` and `Dungeon gains`.
  - Keep compact mobile-friendly display.
- [ ] 4. Validate mixed scenarios:
  - Action-only, dungeon-only, and mixed gains in same recap.
- [ ] 5. Add/update tests for model aggregation and UI output.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

