## task_041_reduce_recipes_payload_in_initial_bundle - Reduce recipes payload in initial bundle
> From version: 0.8.18
> Understanding: 90%
> Confidence: 88%
> Progress: 100%

# Context
Derived from `logics/backlog/item_046_reduce_recipes_payload_in_initial_bundle.md`.
Current state: recipes are bundled statically (see `src/data/definitions/recipes/*`). Goal is to reduce initial bundle impact while preserving offline/PWA availability (likely via dynamic per-skill chunks + precache).

# Plan
- [x] 1. Choose split strategy (per-skill dynamic import) and define a loader facade.
- [x] 2. Implement recipe chunk loading with API compatibility (getRecipesForSkill / getRecipeDefinition).
- [x] 3. Add prefetch for active skill and ensure offline/PWA precache of recipe chunks.
- [x] 4. Add/adjust tests for loading behavior and regressions.
- [x] 5. Verify bundle report reduction and gameplay parity.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run test:ci
- npm run build
- npm run bundle:check

# Report
- Status: Done. Recipes are split via dynamic imports in `src/data/definitions/recipes/index.ts`, Vite manifest enabled, and service worker now precaches recipe chunks via manifest lookup.
- Validation: Not run (suggest `npm run lint`, `npm run test:ci`, `npm run build`, `npm run bundle:check`).

# Notes
