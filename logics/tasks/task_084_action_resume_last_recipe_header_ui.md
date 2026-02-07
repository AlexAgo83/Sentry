## task_084_action_resume_last_recipe_header_ui - Add resume button in Action header
> From version: 0.9.10
> Understanding: 92%
> Confidence: 90%
> Status: Todo
> Reminder: Update Understanding/Confidence/Status when you edit this doc.

# Goal
When no action is running, replace the inactive Interrupt button with a compact Resume control that restarts the last valid recipe.

# Requirements
- Show only when idle (no action/combat running).
- Hide if stored recipe is invalid/unavailable (locked, missing resources, insufficient level).
- Use ACTION header styling and a replay/loop icon.
- Tooltip: `Resume last recipe`.

# Suggested decisions
- If invalid, hide the button (no fallback).
- Recipe unavailable if missing resources OR locked OR insufficient level.
- Use the replay/loop icon from existing header assets.

# Plan
1. Read `lastNonDungeonAction` from state.
2. Validate recipe availability (resources, unlock level, recipe existence).
3. Render the resume control in the Action header when eligible.
4. Wire click to start the stored skill+recipe.
5. Update tests for Action header behavior.
6. Update related backlog progress after completion.

# Implementation notes
- Likely files: `src/app/components/ActionStatusPanel.tsx` or Action header component, `src/app/containers/ActionStatusPanelContainer.tsx`, selectors/util for validation.
- Use existing header button styling and a loop/replay icon asset.

# Acceptance checks
- Button appears only when idle and recipe is valid.
- Clicking restarts the stored skill+recipe.
- Button not shown while an action is running.

# Dependencies
- task_083_action_resume_last_recipe_state
- item_098_action_resume_last_recipe_header_ui

# Follow-ups
- Update backlog item progress and references.
