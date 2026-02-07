## item_099_action_selection_reselect_choose_path - Re-select button on "Choose a path"
> From version: 0.9.10
> Understanding: 93%
> Confidence: 90%
> Progress: 0%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
On the Action selection screen, when "Choose a path" is selected, Start/Interrupt are not meaningful. The UI should offer a compact re-select action and prefill the last known skill.

# Scope
- In:
- When pending skill is empty (Choose a path), replace Start/Interrupt with a `Re-select` button in the Action header.
- `Re-select` should prefill the selection screen with the last known skill if the last action was a skill.
- Use Action header button styling and an icon.
- Out:
- No changes to resume button logic (handled separately).

# Decisions
- Show `Re-select` only when `Choose a path` is active.
- `Re-select` preloads the last stored skill selection (if any); recipe selection follows existing logic.
- Button uses header button styling and an icon (short label only).
- If no last skill is stored, do nothing.

# Acceptance criteria
- When "Choose a path" is selected, Start/Interrupt are replaced by `Re-select`.
- Clicking `Re-select` preselects the last known skill (if available).
- If no last skill exists, it leaves the selection unchanged.

# Priority
- Impact: Low
- Urgency: Low

# Notes
- Derived from `logics/request/req_034_action_resume_last_recipe.md`.
