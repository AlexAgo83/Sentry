## task_041_reduce_recipes_payload_in_initial_bundle - Reduce recipes payload in initial bundle
> From version: 0.8.18
> Understanding: 90%
> Confidence: 88%
> Progress: 0%

# Context
Derived from `logics/backlog/item_046_reduce_recipes_payload_in_initial_bundle.md`

# Plan
- [ ] 1. Choose split strategy (per-skill dynamic import) and define a loader facade.
- [ ] 2. Implement recipe chunk loading with API compatibility (getRecipesForSkill / getRecipeDefinition).
- [ ] 3. Add prefetch for active skill and ensure offline/PWA precache of recipe chunks.
- [ ] 4. Add/adjust tests for loading behavior and regressions.
- [ ] 5. Verify bundle report reduction and gameplay parity.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run test:ci
- npm run build
- npm run bundle:check

# Report
