## item_127_add_initial_food_starting_state_regression_tests_and_validation - Add initial food starting-state regression tests and validation
> From version: 0.9.26
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Low
> Theme: Testing
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without targeted tests, future state/runtime changes may silently remove or alter the initial `food: 10` grant.

# Scope
- In:
- Add/adjust tests to validate:
  - fresh game starts with `food: 10`,
  - starting gold remains unchanged,
  - reset-to-fresh-save also yields `food: 10`,
  - existing saves are not retroactively rewritten by this feature.
- Run validation gates:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Out:
- No feature scope beyond verification.

# Acceptance criteria
- Tests cover initial food grant and reset behavior.
- Full validation command set passes.
- No regressions on unrelated state/persistence tests.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_041_new_game_starts_with_initial_food.md`.
- Quality gate for items `item_125` and `item_126`.
