## task_029_split_save_modals_onboarding_hero_creation - Split save modals + onboarding hero creation
> From version: 0.8.14
> Understanding: 90%
> Confidence: 85%
> Progress: 100%

# Context
- Implements `logics/backlog/item_033_split_local_cloud_save_modals.md` and
  `logics/backlog/item_034_onboarding_hero_creation.md`.
- Split save management into Local/Cloud modals, keeping Setup focused on telemetry + navigation.
- Replace default hero auto-creation with a short onboarding flow that ends at action selection.

# Plan
- [x] 1. Confirm final UX/copy decisions for both items (labels, onboarding steps, starter action behavior).
- [x] 2. Implement Local Save + Cloud Save modals; move save UI out of Setup.
- [x] 3. Wire Setup navigation + ensure cloud/local actions preserve existing behavior.
- [x] 4. Implement onboarding flow replacing default hero creation; ensure action selection opens after creation.
- [x] 5. Update styles and shared components as needed; keep modal behavior consistent.
- [x] 6. Add/adjust tests (UI + selectors) and verify no regressions.
- [x] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint
- npm run typecheck

# Report
- Notes: Save actions moved into Local Save modal; Cloud Save modal now owns cloud panel UI; onboarding blocks until hero creation.
- Files touched: src/app/AppContainer.tsx, src/app/components/SystemModal.tsx, src/app/components/LocalSaveModal.tsx, src/app/components/CloudSaveModal.tsx, src/app/components/OnboardingHeroModal.tsx, src/core/state.ts, src/app/game.ts, src/core/runtime.ts, tests/app/App.test.tsx, tests/app/systemModal.test.tsx
- Tests: npm run tests, npm run lint
