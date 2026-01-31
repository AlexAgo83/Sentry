## task_036_deterministic_rng_for_rare_rewards - Deterministic RNG for rare rewards
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_041_seeded_rng_for_rewards.md`.
Use a seeded RNG (playerId + tickTime + actionId + recipeId) so rare rewards are deterministic.

# Plan
- [ ] 1. Add a small seeded RNG utility (pure, deterministic).
- [ ] 2. Replace `Math.random()` rare reward rolls with seeded RNG.
- [ ] 3. Add tests for deterministic outcomes (including offline catch-up).
- [ ] FINAL: Update Logics docs and notes.

# Validation
- npm run tests

# Report
- Status: not started.
