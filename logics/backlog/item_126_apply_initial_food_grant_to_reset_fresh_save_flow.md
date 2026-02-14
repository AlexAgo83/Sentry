## item_126_apply_initial_food_grant_to_reset_fresh_save_flow - Apply initial food grant to reset fresh-save flow
> From version: 0.9.26
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Low
> Theme: Runtime
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even if new-state defaults include `food: 10`, reset-to-new-save flow must explicitly preserve that behavior to avoid inconsistencies.

# Scope
- In:
- Verify and enforce that reset flow (`GameRuntime.reset` and hydrate path) recreates a fresh save with `food: 10`.
- Ensure behavior remains limited to fresh state creation/reset and does not alter existing save loads.
- Out:
- No changes to existing save migration semantics.
- No gameplay/balance changes beyond initial food grant.

# Acceptance criteria
- Triggering reset results in a new save with `food: 10`.
- Existing saved games keep their stored inventory values.
- No regression in startup/hydrate lifecycle.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_041_new_game_starts_with_initial_food.md`.
- Main references: `src/core/runtime.ts`, `src/core/reducer.ts`, `src/core/state.ts`.
