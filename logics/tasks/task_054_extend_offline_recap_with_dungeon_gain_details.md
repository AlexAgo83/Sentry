## task_054_extend_offline_recap_with_dungeon_gain_details - Extend offline recap with dungeon gain details
> From version: 0.9.5
> Understanding: 95%
> Confidence: 91%
> Progress: 100%

# Context
Derived from `logics/backlog/item_068_extend_offline_recap_with_dungeon_gain_details.md`.

This task upgrades the offline recap model/UI so dungeon gains are explicitly visible per player and not confused with action-only progression.

# Decisions (v1)
- Add `dungeonGains` per player with `combatXp` and `itemDeltas` (gold + items).
- Render a single `Dungeon gains` line only when any dungeon delta is non-zero.
- Keep dungeon deltas folded into `totalItemDeltas`.
- Use a compact format: `Dungeon: +X Combat XP; +Y gold; +Z items`.

# Suggestions (v1 defaults)
- Add a per-player `dungeonGains` payload with `combatXp` and `itemDeltas` (gold + items) so UI can stay simple.
- Render a compact `Dungeon gains` line only when any dungeon delta is non-zero to avoid noisy recap rows.
- Keep dungeon and action totals both mapped into `totalItemDeltas` to preserve existing aggregate behavior.
- Use a single-line format like `Dungeon: +X Combat XP • +Y gold • +Z items` for mobile clarity.

# Open questions to confirm
- Do we want to show dungeon gain rows even when action gains are zero, or only when dungeon gains are present?
- Should item deltas be summarized (count + gold) or list top item types?

# Plan
- [x] 1. Extend offline summary domain model:
  - Add explicit dungeon gain fields per player (Combat XP + dungeon item/gold deltas).
  - Keep backward-compatible defaults for previous save/runtime shapes.
- [x] 2. Update recap aggregation pipeline:
  - Merge action-loop and dungeon-loop gains in one recap build.
  - Preserve total delta coherence with global `totalItemDeltas`.
- [x] 3. Update recap UI rendering:
  - Add separated lines/sections for `Action gains` and `Dungeon gains`.
  - Keep compact mobile-friendly display.
- [x] 4. Validate mixed scenarios:
  - Action-only, dungeon-only, and mixed gains in same recap.
- [x] 5. Add/update tests for model aggregation and UI output.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Added `dungeonGains` per player (Combat XP + item deltas) to offline summary models.
- Aggregated dungeon deltas into recap output while preserving total item delta coherence.
- Rendered `Dungeon gains` in the offline recap modal when any dungeon delta is non-zero.
- Added regression tests covering dungeon gains and mixed action+dungeon sessions.

