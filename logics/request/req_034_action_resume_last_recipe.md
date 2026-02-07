## req_034_action_resume_last_recipe - Offer a one-tap resume for last non-dungeon action
> From version: 0.9.10
> Understanding: 94%
> Confidence: 91%

# Needs
- Remember the last non-dungeon action (skill + recipe) when no action is running.
- When no action is running (no skill action and no combat), surface a quick "resume last recipe" control.
- Do not offer the resume action if the saved recipe cannot be started (unavailable or invalid).
- In the skill selection screen, when "Choose a path" is selected, replace Start/Interrupt with a compact `Re-select` action.

# Context
- When the player is idle, restarting the last recipe is a common next step.
- The button should reuse the ACTION header button styling and iconography (no long text labels).

# Goals
- Reduce friction to restart the last valid recipe.
- Ensure the shortcut never appears when an action is already running.
- Avoid presenting invalid actions.

# Locked decisions (v1)
- The remembered action must exclude dungeon/combat.
- Persist `lastNonDungeonAction` in the save.
- The shortcut uses the last recipe selection for that skill.
- The button replaces the `Interrupt` button only when there is nothing to interrupt (no action running).
- The button is hidden if the saved recipe cannot be launched.
- “Recipe unavailable” means missing resources, locked recipe, or insufficient level.
- No fallback to another recipe; if invalid, do not show the button.
- The button launches the action immediately (no pre-selection).
- Show only in the Action header (not elsewhere).
- Use a replay/loop-style icon and ACTION header button styling; tooltip `Resume last recipe`.
- In the Action selection screen, when `Choose a path` is selected, show a `Re-select` button (icon + short label) instead of Start/Interrupt.

# Scope detail (draft)
- Data:
  - Track `lastNonDungeonAction` with `skillId` and `recipeId` (or resolved recipe key) in state.
  - Update it when a new non-dungeon action starts or recipe changes.
- Logic:
  - Validate the recipe is still available before showing/allowing resume.
  - If validation fails, hide the resume button.
- UI:
  - In the Action header, replace the inactive `Interrupt` control with a compact resume icon button.
  - Tooltip/aria label should indicate "Resume last recipe".
- In the Action selection screen, when no skill is selected, replace Start/Interrupt with a `Re-select` button (same header button styling).
- The `Re-select` action should prefill the last known skill in the selection screen if the last action was a skill.

# Technical references to update
- `src/core/types.ts` (state shape for last action)
- `src/core/state.ts` or action reducer (persist last action)
- `src/app/components/ActionStatusPanel.tsx` or Action header component (resume button)
- `src/app/components/ActionSelectionScreen.tsx` (capture last selection)
- `src/app/styles/panels/action.css` (button styling if needed)

# Acceptance criteria
- When no action is running, the Action header shows a resume button if the last recipe is valid.
- Clicking the button restarts the last non-dungeon action with its last recipe.
- If the recipe is invalid or unavailable, the button does not appear.
- The button does not appear while any action/combat is running.

# Risks / open points
- Confirm which icon asset to use for the replay/loop look (reuse existing or add new).

# Backlog
- To be split after approval.
