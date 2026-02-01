## task_036_deterministic_rng_for_rare_rewards - Deterministic RNG for rare rewards
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_041_seeded_rng_for_rewards.md`.
Use a seeded RNG (playerId + tickTime + actionId + recipeId) so rare rewards are deterministic.

# Plan
- [x] 1. Add a small seeded RNG utility (pure, deterministic).
- [x] 2. Replace `Math.random()` rare reward rolls with seeded RNG.
- [x] 3. Add tests for deterministic outcomes.
- [x] FINAL: Update Logics docs and notes.

# Validation
- npm run tests

# Report
- Status: complete.
- Added `src/core/rng.ts` and deterministic rare reward rolls in `src/core/loop.ts`.
- Updated core loop test to validate deterministic rare drops.
- Validation: `npm run test:ci -- tests/core/loop.test.ts`.

# Notes
