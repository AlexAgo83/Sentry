## item_125_add_initial_food_to_new_game_inventory_state - Add initial food to new game inventory state
> From version: 0.9.26
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Low
> Theme: State
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Fresh game state currently does not grant the requested baseline `food`, which hurts early dungeon readiness.

# Scope
- In:
- Update initial inventory creation so brand-new saves include `food: 10`.
- Keep existing starting `gold` unchanged.
- Keep item key explicit as `food` (not `meat`).
- Out:
- No reset flow wiring in this item.
- No test expansion in this item.

# Acceptance criteria
- `createInitialGameState` inventory contains `food: 10` for new saves.
- Starting gold value remains exactly the same as before.
- No unrelated inventory defaults change.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_041_new_game_starts_with_initial_food.md`.
- Main references: `src/core/state.ts`.
