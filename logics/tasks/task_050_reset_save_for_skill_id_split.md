## task_050_reset_save_for_skill_id_split - Reset save for skill ID split
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_064_migrate_or_reset_save_for_skill_id_split.md`.

Locked approach for v1: clean save reset (no transitional migration logic) to avoid split-state corruption.

# Plan
- [ ] 1. Bump save/persistence compatibility marker for the split release.
- [ ] 2. Implement deterministic reset path for incompatible pre-split saves:
  - Hydration/import of old schema resets to fresh compatible state.
  - Ensure both `Combat` and `Roaming` skill states are correctly initialized.
- [ ] 3. Align local + cloud save behavior on incompatibility:
  - Prevent loading broken mixed-schema payloads.
  - Keep failure mode explicit and stable.
- [ ] 4. Add user-facing communication:
  - Document reset in release/changelog notes.
  - Add concise in-app wording if needed when reset path is triggered.
- [ ] 5. Add/adjust tests for reset path and post-reset skill shape validity.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
