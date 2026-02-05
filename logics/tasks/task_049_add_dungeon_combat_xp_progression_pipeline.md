## task_049_add_dungeon_combat_xp_progression_pipeline - Add dungeon combat XP progression pipeline
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_063_add_dungeon_combat_xp_progression_pipeline.md`.

This task implements the first complete dungeon Combat XP loop with deterministic formula and batched grants.

# Plan
- [x] 1. Define and centralize v1 Combat XP constants/formula:
  - `floorXp = 6 + (tier * 3) + floor`
  - `bossBonusXp = floorXp * 2` on final floor only.
- [x] 2. Implement runtime grant hooks in dungeon flow:
  - Grant floor XP on floor clear events.
  - Grant boss bonus on final floor completion.
  - Apply grants to all active party members.
- [x] 3. Keep grants batched and event-driven:
  - No per-hit XP writes.
  - Reuse milestone boundaries already present in simulation loop.
- [x] 4. Ensure offline/catch-up paths reuse the same grant logic.
- [x] 5. Add/adjust tests for formula correctness and non-regression on Combat scaling.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run tests
- npm run build

# Report
- Added floor-clear + final-floor boss bonus Combat XP grants in dungeon runtime.
- Kept grants milestone-based (batched), without per-hit progression writes.
- Reused the same dungeon tick/catch-up flow so offline progression applies identical Combat XP rules.
- Added tests for boss/floor XP attribution and non-regression behavior.
