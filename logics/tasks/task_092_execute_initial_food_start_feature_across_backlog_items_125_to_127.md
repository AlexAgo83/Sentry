## task_092_execute_initial_food_start_feature_across_backlog_items_125_to_127 - Execute initial food start feature across backlog items 125 to 127
> From version: 0.9.26
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Low
> Theme: Feature
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_125_add_initial_food_to_new_game_inventory_state.md`
- `logics/backlog/item_126_apply_initial_food_grant_to_reset_fresh_save_flow.md`
- `logics/backlog/item_127_add_initial_food_starting_state_regression_tests_and_validation.md`

Request reference:
- `logics/request/req_041_new_game_starts_with_initial_food.md`

This task orchestrates end-to-end delivery of initial food grant on fresh starts (`food: 10`) while preserving existing gold defaults and save compatibility.

# Decisions (v1)
- Initial food grant is exactly `10` on fresh state creation.
- Existing starting gold value remains unchanged.
- Applies to:
  - brand-new game initialization,
  - reset-to-fresh-save flow.
- Existing saves are not retroactively modified.
- Item key is strictly `food`.
- Delivery is phase-based with final validation gate.

# Plan
- [ ] 1. Baseline and guardrails:
  - Confirm current initial inventory defaults and reset behavior.
  - Identify tests asserting initial inventory and reset outcomes.
- [ ] 2. Execute `item_125` (initial state update):
  - Update initial inventory creation to include `food: 10`.
  - Ensure no unrelated inventory default changes.
- [ ] 3. Execute `item_126` (reset flow parity):
  - Verify/enforce that reset creates fresh save with `food: 10`.
  - Ensure existing save hydration remains unchanged.
- [ ] 4. Execute `item_127` (tests and quality gate):
  - Add/update tests for fresh start and reset behavior.
  - Confirm existing-save load behavior is not regressed.
- [ ] 5. Final stabilization:
  - Recheck onboarding/tutorial assumptions around initial food.
  - Ensure labels/docs/comments are aligned.
- [ ] 6. Final mandatory full test battery:
  - Run complete validation suite at task end.
  - Fix all failures before marking task complete.
- [ ] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`

# Report
- TBD after execution.
