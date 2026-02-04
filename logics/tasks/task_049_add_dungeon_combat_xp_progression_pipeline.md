## task_049_add_dungeon_combat_xp_progression_pipeline - Add dungeon combat XP progression pipeline
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_063_add_dungeon_combat_xp_progression_pipeline.md`.

This task implements the first complete dungeon Combat XP loop with deterministic formula and batched grants.

# Plan
- [ ] 1. Define and centralize v1 Combat XP constants/formula:
  - `floorXp = 6 + (tier * 3) + floor`
  - `bossBonusXp = floorXp * 2` on final floor only.
- [ ] 2. Implement runtime grant hooks in dungeon flow:
  - Grant floor XP on floor clear events.
  - Grant boss bonus on final floor completion.
  - Apply grants to all active party members.
- [ ] 3. Keep grants batched and event-driven:
  - No per-hit XP writes.
  - Reuse milestone boundaries already present in simulation loop.
- [ ] 4. Ensure offline/catch-up paths reuse the same grant logic.
- [ ] 5. Add/adjust tests for formula correctness and non-regression on Combat scaling.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
