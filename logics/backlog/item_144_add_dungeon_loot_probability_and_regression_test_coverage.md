## item_144_add_dungeon_loot_probability_and_regression_test_coverage - Add dungeon loot probability and regression test coverage
> From version: 0.9.28
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Weighted RNG, discovery masking, and runtime reward rules can regress silently without targeted tests.

# Scope
- In:
- Add deterministic loot roll tests with fixed seeds.
- Add rule tests:
  - exactly one loot on victory,
  - no loot on failure,
  - rare exclusive slot restrictions (ring/amulet),
  - scaling checks by dungeon difficulty.
- Add UI tests for preparation loot table visibility and `??` masking/reveal.
- Run full validation battery.
- Out:
- No new gameplay feature scope.

# Acceptance criteria
- Critical dungeon loot rules are covered by automated tests.
- Preparation-tab loot table masking behavior is covered.
- Full validation battery passes:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_044_dungeon_weighted_loot_tables_with_dungeon_exclusive_rare_items.md`.
- Quality gate for items `item_139` through `item_143`.
