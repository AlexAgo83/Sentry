## task_050_reset_save_for_skill_id_split - Reset save for skill ID split
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_064_migrate_or_reset_save_for_skill_id_split.md`.

Locked approach for v1: clean save reset (no transitional migration logic) to avoid split-state corruption.

# Plan
- [x] 1. Keep save key compatibility and implement split-aware hydration logic.
- [x] 2. Implement deterministic pre-split transition path:
  - On legacy saves (no `Roaming`), reset only split skills (`Combat` + `Roaming`).
  - Preserve non-split progression/data (`inventory`, other skills, roster, dungeon, etc.).
  - Remap legacy `selectedActionId: Combat` to `Roaming`.
- [x] 3. Keep local + cloud behavior stable with split-safe state shape after hydration.
- [x] 4. Add concise technical documentation in task/backlog/request artifacts.
- [x] 5. Add/adjust tests for split reset path and post-hydration skill shape validity.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Reverted global save-key wipe strategy and kept existing save key compatibility.
- Added deterministic hydration fallback for pre-split saves:
  - detect legacy shape,
  - reset `Combat` + `Roaming` only,
  - preserve all other player/system data.
- Added legacy action remap (`Combat` -> `Roaming`) during hydration.
- Added dedicated serialization/hydration tests for the split transition path.
