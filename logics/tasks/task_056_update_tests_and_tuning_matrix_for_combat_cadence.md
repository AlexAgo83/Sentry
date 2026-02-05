## task_056_update_tests_and_tuning_matrix_for_combat_cadence - Update tests and tuning matrix for combat cadence
> From version: 0.9.5
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_070_update_tests_and_tuning_matrix_for_combat_cadence.md`.

This task secures the cadence rollout with automated coverage and a reproducible tuning matrix to validate pacing and economy impact.

# Decisions (v1)
- Add minimal tests: cadence formula bounds, multi-proc, per-hero cap, event cap, replay determinism, recap mixed gains.
- Use fixed seeds with identical party and gear for `low`, `mid`, `high` Agility bands.
- Store tuning results in `logics/tuning/combat_cadence_matrix.md`.

# Suggestions (v1 defaults)
- Fix a deterministic seed set for `low`, `mid`, `high` Agility bands to keep results comparable across runs.
- Capture results in a single doc (suggested: `logics/tuning/combat_cadence_matrix.md`) with a stable table format.
- Record both median and 90th percentile for floor clear time and rewards to detect outlier inflation.
- Use the same party composition/equipment baseline for all bands to isolate Agility effects.

# Open questions to confirm
- Do we want to store tuning results in `logics/tuning/` or under `logics/tasks/` as an appendix?
- Any preferred seed(s) or scenario definitions for the matrix runs?

# Plan
- [x] 1. Add unit tests for cadence core logic:
  - Agility scaling behavior and clamp bounds.
  - Multi-proc cooldown path.
  - Per-hero and global cap protections.
- [x] 2. Add integration/regression tests:
  - Replay determinism with cooldown-based cadence.
  - Offline recap includes dungeon gains (including mixed action+dungeon sessions).
  - Combat panel values render coherently in character stats.
- [x] 3. Define and run tuning matrix scenarios:
  - `low`, `mid`, `high` Agility bands with same seed/setup.
  - Capture KPIs: floor clear time, survival/wipe rate, Combat XP/hour, gold/items/hour.
- [x] 4. Document tuning results and accepted bounds for v1.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run test:ci
- npm run build

# Report
- Added cadence unit tests (bounds, multi-proc, per-hero cap, event cap) plus replay determinism checks.
- Added regression tests for combat panel rendering and offline recap dungeon gains.
- Created a tuning matrix template in `logics/tuning/combat_cadence_matrix.md`.
- Ran the tuning matrix (12 fixed seeds; Damp Ruins tier 1) and filled the results/bounds in `logics/tuning/combat_cadence_matrix.md`.

