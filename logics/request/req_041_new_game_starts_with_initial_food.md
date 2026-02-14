## req_041_new_game_starts_with_initial_food - Start new games with an initial 10 food
> From version: 0.9.26
> Understanding: 97%
> Confidence: 95%

# Needs
- New games should start with `10` units of `food`.
- Keep existing starting `gold` unchanged.

# Context
- The game already grants starting `gold` on fresh state creation.
- `food` is a core resource for dungeon entry/progression and early gameplay flow.

# Goals
- Improve early-game usability by ensuring a baseline stock of food at game start.
- Keep the change minimal and low-risk (no balance/system rewrite).

# Locked decisions (v1)
- Initial grant is exactly `10` `food`.
- Existing initial `gold` value must not be modified.
- This applies to brand-new game state creation and reset-to-new-save flows.
- Existing player saves are not retroactively modified by this request.
- Item id used is `food` (inventory item key), not `meat`.

# Scope detail (draft)
- Data/init:
  - Update initial inventory state to include `food: 10` on new save creation.
- Lifecycle:
  - Ensure reset flow that recreates a fresh save also receives `food: 10`.
- Validation:
  - Confirm no regression on onboarding/tutorial assumptions tied to food acquisition.

# Technical references to update
- `src/core/state.ts` (initial inventory creation)
- `src/core/runtime.ts` / reset path validation
- `tests/core/state*`
- `tests/core/runtime*`
- `tests/app/*` where initial inventory assumptions are asserted

# Acceptance criteria
- A brand-new game starts with `10` food in inventory.
- Starting gold remains exactly as before.
- Resetting save to a fresh state also starts with `10` food.
- Existing saves load exactly as before (no forced migration rewrite).

# Risks / open points
- If tutorial messaging assumes zero initial food, copy may need adjustment.
- Any tests asserting exact initial inventory values must be updated accordingly.

# Backlog
- `logics/backlog/item_125_add_initial_food_to_new_game_inventory_state.md`
- `logics/backlog/item_126_apply_initial_food_grant_to_reset_fresh_save_flow.md`
- `logics/backlog/item_127_add_initial_food_starting_state_regression_tests_and_validation.md`
