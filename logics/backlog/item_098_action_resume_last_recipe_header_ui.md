## item_098_action_resume_last_recipe_header_ui - Resume last recipe button in Action header
> From version: 0.9.10
> Understanding: 93%
> Confidence: 90%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
When no action is running, the Action header shows an inactive Interrupt button and provides no quick way to restart the last valid recipe.

# Scope
- In:
- Show a compact `Resume last recipe` button in the Action header when no action is running.
- Replace the inactive Interrupt button with this resume control.
- Hide the button if the stored recipe is invalid or cannot be started.
- Use ACTION header button styling and a replay/loop icon.
- Out:
- No changes to selection screen behavior (handled separately).

# Decisions
- Button appears only when there is no action/combat running.
- Button launches the last stored recipe immediately.
- If recipe is unavailable (locked, missing resources, or insufficient level), hide the button.
- Tooltip: `Resume last recipe`.
- Use a replay/loop-style icon.

# Acceptance criteria
- When idle, the Action header shows a resume button if the last recipe is valid.
- Clicking the button starts the stored skill+recipe immediately.
- If the recipe is invalid/unavailable, the button is not shown.
- Button does not appear while any action is running.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_034_action_resume_last_recipe.md`.
