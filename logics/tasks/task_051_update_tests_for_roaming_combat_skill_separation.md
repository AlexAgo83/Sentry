## task_051_update_tests_for_roaming_combat_skill_separation - Update tests for roaming/combat skill separation
> From version: 0.9.2
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_065_update_tests_for_roaming_combat_skill_separation.md`.

This task closes test coverage gaps introduced by the skill split and reset strategy.

# Plan
- [x] 1. Add core unit tests for skill split semantics:
  - Roaming progression increments `Roaming`, not `Combat`.
  - Dungeon progression increments `Combat` using floor/boss formulas.
- [x] 2. Add UI tests for screen-level behavior:
  - Action selection excludes `Combat`.
  - Dungeon/Stats still expose Combat progression context.
- [x] 3. Add persistence tests:
  - Incompatible pre-split save triggers split-skill reset (`Combat` + `Roaming`).
  - Hydrated state includes valid `Combat` and `Roaming` structures.
- [x] 4. Add offline/catch-up regression checks for dungeon Combat XP grants.
- [x] 5. Re-run and stabilize CI-relevant suites.
- [x] FINAL: Update related Logics docs

# Validation
- npm run lint
- npm run typecheck
- npm run test:ci
- npm run build

# Report
- Updated unit tests for roaming progression semantics (`Roaming` instead of `Combat` in action loop flows).
- Added/updated dungeon tests for Combat XP grants (floor + boss bonus).
- Added persistence serialization/hydration test for legacy split transition.
- Updated UI-related test fixtures impacted by roster/action split behavior.
- Revalidated CI test suite after split changes.
