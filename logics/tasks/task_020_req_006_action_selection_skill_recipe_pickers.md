## task_020_req_006_action_selection_skill_recipe_pickers - req_006 — Action Selection skill & recipe pickers
> From version: 0.8.9
> Understanding: 90%
> Confidence: 85%
> Progress: 0%

# Context
This task executes:
- `logics/request/req_006_improve_skill_recipe_selection.md`
- `logics/backlog/item_018_action_selection_improve_skill_recipe_selection_ui.md`

Current Action Selection UI relies on two `<select>` dropdowns (skill + recipe). We want a more visual, responsive picker UI for desktop and mobile, without changing gameplay behavior.

Constraints:
- Screen remains a dedicated screen (not a modal), reachable only via the Change button.
- Mobile breakpoint: `max-width: 720px`.
- Keep keyboard accessibility and visible focus states.
- Preserve selection rules (default recipe behavior, locked recipes, missing items hint, Start/Interrupt/Back, `Escape` → Back).

# Goal
Replace the dropdown-based selection UI with visual pickers:
- Skills: card list (desktop) / horizontal chips (mobile).
- Recipes: grid (desktop) / list (mobile), with locked recipes shown disabled + unlock level.

# Plan
- [ ] 1. Implement visual skill picker
  - Replace skill `<select>` with a radio-like list of skill cards (icon + name + level).
  - Mobile layout becomes a horizontally scrollable row of chips/cards.
  - Selection updates `pendingSkillId` (no behavior changes).
- [ ] 2. Implement visual recipe picker
  - Replace recipe `<select>` with recipe cards/list items.
  - Locked recipes render disabled with “Unlocks at Lv X”.
  - Selection updates `pendingRecipeId` (no behavior changes).
- [ ] 3. Update layout and summary
  - Desktop layout: skills left, recipes center, summary right.
  - Mobile layout: stack sections; keep summary and missing-items hint easy to find.
- [ ] 4. Accessibility + keyboard pass
  - Ensure all selectable items are focusable and have visible focus styles.
  - Ensure selection works with Enter/Space (and basic Tab navigation).
- [ ] 5. Update tests
  - Update Action Selection tests to target the new picker UI.
  - Add/adjust a test for locked recipe disabled state and correct defaulting behavior.
- [ ] FINAL: Update related Logics docs
  - Update `Progress` / links in request and backlog docs.

# Validation
- npm run lint
- npm run typecheck
- npm run test:ci
- npm run build

# Report
