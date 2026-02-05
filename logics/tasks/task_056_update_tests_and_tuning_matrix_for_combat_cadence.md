## task_056_update_tests_and_tuning_matrix_for_combat_cadence - Update tests and tuning matrix for combat cadence
> From version: 0.9.5
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Context
Derived from `logics/backlog/item_070_update_tests_and_tuning_matrix_for_combat_cadence.md`.

This task secures the cadence rollout with automated coverage and a reproducible tuning matrix to validate pacing and economy impact.

# Plan
- [ ] 1. Add unit tests for cadence core logic:
  - Agility scaling behavior and clamp bounds.
  - Multi-proc cooldown path.
  - Per-hero and global cap protections.
- [ ] 2. Add integration/regression tests:
  - Replay determinism with cooldown-based cadence.
  - Offline recap includes dungeon gains (including mixed action+dungeon sessions).
  - Combat panel values render coherently in character stats.
- [ ] 3. Define and run tuning matrix scenarios:
  - `low`, `mid`, `high` Agility bands with same seed/setup.
  - Capture KPIs: floor clear time, survival/wipe rate, Combat XP/hour, gold/items/hour.
- [ ] 4. Document tuning results and accepted bounds for v1.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run test:ci
- npm run build

