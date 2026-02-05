## item_070_update_tests_and_tuning_matrix_for_combat_cadence - Update tests and tuning matrix for combat cadence
> From version: 0.9.5
> Understanding: 95%
> Confidence: 90%
> Progress: 0%

# Problem
The cadence refactor changes core battle pacing and offline reward throughput, so dedicated coverage and balancing checks are required to avoid hidden regressions.

# Scope
- In:
  - Add unit tests for cooldown cadence, Agility scaling, clamp boundaries, and multi-proc behavior.
  - Add regression tests for replay determinism under new cadence rules.
  - Add offline recap tests for dungeon gain attribution and mixed gain rendering.
  - Define and execute a tuning matrix (`low/mid/high` Agility bands) with reference scenarios.
  - Track key KPIs in tuning pass:
    - floor clear time
    - wipe/survival rate
    - Combat XP per hour
    - gold/items per hour
- Out:
  - Broad unrelated test suite refactors.
  - One-off manual balancing without reproducible scenario matrix.

# Acceptance criteria
- Automated tests cover cadence logic, replay determinism, and offline recap dungeon attribution.
- Tuning matrix results are documented and used to validate economy/balance impact.
- No CI regressions in existing combat/offline/replay coverage.

# Priority
- Impact: High (stability and balance confidence before release).
- Urgency: Medium-High (must land with cadence changes).

# Notes
- Source request: `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`
- Derived from `logics/request/req_020_combat_system_improvements_stats_and_offline_recap.md`.

