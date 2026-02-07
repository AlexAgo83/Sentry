## task_085_action_selection_reselect_choose_path - Re-select button on Choose a path
> From version: 0.9.10
> Understanding: 92%
> Confidence: 90%
> Status: Done
> Progress: 100%
> Reminder: Update Understanding/Confidence/Status when you edit this doc.

# Goal
On the Action selection screen, replace Start/Interrupt with `Re-select` when "Choose a path" is selected, and prefill the last known skill if available.

# Requirements
- Only show `Re-select` when pending skill is empty.
- `Re-select` preselects last stored skill if it exists; otherwise no-op.
- Use Action header button styling and an icon.

# Suggested decisions
- Prefill only the skill; recipe uses existing selection logic.
- If no last skill exists, do nothing.

# Plan
1. Read `lastNonDungeonAction` from state in the action selection container.
2. When `Choose a path` is active, render `Re-select` button in header.
3. On click, set pending skill to last known skill and let existing recipe logic pick the recipe.
4. Update tests for Action selection header behavior.
5. Update related backlog progress after completion.

# Implementation notes
- Likely files: `src/app/components/ActionSelectionScreen.tsx`, `src/app/containers/ActionSelectionScreenContainer.tsx`.
- Reuse header button styling and an existing icon (Change/Replay).

# Acceptance checks
- Start/Interrupt are replaced by `Re-select` only in Choose a path.
- Clicking `Re-select` preselects the last stored skill.

# Dependencies
- task_083_action_resume_last_recipe_state
- item_099_action_selection_reselect_choose_path

# Follow-ups
- Update backlog item progress and references.
