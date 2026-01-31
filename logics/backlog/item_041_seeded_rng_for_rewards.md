## item_041_seeded_rng_for_rewards - Deterministic RNG for rare rewards
> From version: 0.8.17
> Understanding: 92%
> Confidence: 90%
> Progress: 0%

# Problem
Promoted from `logics/request/req_015_technical_review.md`.
Rare rewards use `Math.random()` which is not deterministic, making offline catch‑up and tests harder to verify.

# Scope
- In:
  - Introduce a seeded RNG utility.
  - Seed based on player id + tick timestamp + actionId + recipeId for determinism.
  - Replace random rare reward rolls in the loop with seeded RNG.
  - Add tests for deterministic outcomes.
- Out:
  - Changing reward rates or balance.

# Acceptance criteria
- Given the same seed inputs, rare reward outcomes are deterministic.
- Offline catch‑up produces reproducible results.
- Tests cover deterministic RNG behavior.

# Priority
- Impact: Medium (testability + reproducibility).
- Urgency: Low.

# Notes
- Keep RNG utility isolated for future reuse.
- Seed is computed on the fly (no persistence required).
