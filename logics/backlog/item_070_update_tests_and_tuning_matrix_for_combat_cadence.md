## item_070_update_tests_and_tuning_matrix_for_combat_cadence - Update tests and tuning matrix for combat cadence
> From version: 0.9.5
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

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

# Decisions (v1)
- Add minimal tests: cadence formula bounds, multi-proc, per-hero cap, event cap, replay determinism, recap mixed gains.
- Use fixed seeds with identical party and gear for `low`, `mid`, `high` Agility bands.
- Store tuning results in `logics/tuning/combat_cadence_matrix.md`.

# Recommended defaults (v1)
- Use fixed seeds and identical party/equipment across bands to isolate Agility impact.
- Record results in a single table doc (suggested: `logics/tuning/combat_cadence_matrix.md`).
- Capture median and 90th percentile for clear time and rewards to surface outliers.

# Open questions
- Preferred storage location for tuning results (new `logics/tuning/` folder vs task appendix)?
- Any required seeds/scenarios beyond the standard trio?

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
- Implemented via `logics/tasks/task_056_update_tests_and_tuning_matrix_for_combat_cadence.md` (tests + matrix filled).

