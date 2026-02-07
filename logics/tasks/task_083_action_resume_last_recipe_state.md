## task_083_action_resume_last_recipe_state - Persist last non-dungeon action+recipe
> From version: 0.9.10
> Understanding: 93%
> Confidence: 90%
> Status: Done
> Reminder: Update Understanding/Confidence/Status when you edit this doc.

# Goal
Persist `lastNonDungeonAction` (skillId + recipeId) when a non-dungeon skill action starts, and restore it from save.

# Requirements
- Track only non-dungeon skill actions (exclude dungeon/combat).
- Update only when an action starts (not just UI selection changes).
- Persist in save data and restore on load.

# Suggested decisions
- Persist in save (not session-only).
- Update only on action start.
- Exclude dungeon/combat actions even if Combat skill is selected outside dungeon.

# Plan
1. Add `lastNonDungeonAction` to core state/types and serialization.
2. Update reducers/actions so action start updates this value when applicable.
3. Add migration/defaults for existing saves.
4. Add/adjust tests for persistence/migration.
5. Update related backlog progress after completion.

# Implementation notes
- Likely files: `src/core/types.ts`, `src/core/state.ts`, `src/core/reducer.ts`, `src/core/serialization.ts` or save migration.
- Action start occurs in the `selectAction` flow; ensure dungeon/combat are excluded.

# Acceptance checks
- Starting a non-dungeon action sets `lastNonDungeonAction`.
- Dungeon/combat actions never update it.
- Reload preserves the value.

# Dependencies
- item_097_action_resume_last_recipe_state

# Follow-ups
- Update backlog item progress and references.
