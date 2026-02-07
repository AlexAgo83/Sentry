## item_097_action_resume_last_recipe_state - Track last non-dungeon action + recipe
> From version: 0.9.10
> Understanding: 94%
> Confidence: 91%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Problem
The game does not remember the last non-dungeon action/recipe, so we cannot offer a reliable one-tap resume when idle.

# Scope
- In:
- Persist `lastNonDungeonAction` (skillId + recipeId) in state and save data.
- Update the stored value when a non-dungeon action starts or its recipe changes.
- Exclude dungeon/combat actions from the stored value.
- Out:
- No changes to UI in this item (handled by separate UI items).

# Decisions
- Persist the last action in save data (not session-only).
- Update only when a non-dungeon skill action starts (not just when selection changes).
- Only non-dungeon skill actions update this record.
- Store both `skillId` and `recipeId`.

# Acceptance criteria
- State includes a persisted `lastNonDungeonAction` with `skillId` + `recipeId`.
- Starting a non-dungeon action updates the stored values.
- Dungeon/combat actions do not update the stored values.
- Loading a save restores the last stored values.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_034_action_resume_last_recipe.md`.
