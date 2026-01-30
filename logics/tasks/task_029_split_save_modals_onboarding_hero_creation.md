## task_029_split_save_modals_onboarding_hero_creation - Split save modals + onboarding hero creation
> From version: 0.8.14
> Understanding: 80%
> Confidence: 70%
> Progress: 0%

# Context
- Implements `logics/backlog/item_033_split_local_cloud_save_modals.md` and
  `logics/backlog/item_034_onboarding_hero_creation.md`.
- Split save management into Local/Cloud modals, keeping Setup focused on telemetry + navigation.
- Replace default hero auto-creation with a short onboarding flow that ends at action selection.

# Plan
- [ ] 1. Confirm final UX/copy decisions for both items (labels, onboarding steps, starter action behavior).
- [ ] 2. Implement Local Save + Cloud Save modals; move save UI out of Setup.
- [ ] 3. Wire Setup navigation + ensure cloud/local actions preserve existing behavior.
- [ ] 4. Implement onboarding flow replacing default hero creation; ensure action selection opens after creation.
- [ ] 5. Update styles and shared components as needed; keep modal behavior consistent.
- [ ] 6. Add/adjust tests (UI + selectors) and verify no regressions.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint
- npm run typecheck

# Report
- Notes:
- Files touched:
- Tests:
