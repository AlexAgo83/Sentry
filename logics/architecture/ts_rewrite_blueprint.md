# TS Rewrite Blueprint (v0.3.0)

## Target architecture
- Core (pure domain): game loop, progression, offline catch-up, and rules. No DOM.
- Adapters: persistence (localStorage v1), clock/visibility, randomness.
- UI (React): view models + components only, driven by the core state.
- Data: static definitions for skills, recipes, actions, and balance values.
- Store: bridge between UI and core, exposing subscribe/get/dispatch.

## Data model and types
IDs (string, branded in TS): PlayerId, SkillId, RecipeId, ActionId, ItemId.

Runtime state (serialized):
- StorageState: gold.
- RecipeState: id, xp, level, xpNext, maxLevel.
- SkillState: id, xp, level, xpNext, maxLevel, baseInterval, selectedRecipeId, recipes.
- PlayerState: id, name, hp, hpMax, stamina, staminaMax, storage, skills,
  selectedActionId, actionProgress, createdAt.
- LoopState: lastTick, lastHiddenAt, loopInterval, offlineInterval, offlineThreshold.
- GameState: version, players, activePlayerId, loop.

Static definitions (non-serialized):
- SkillDefinition: id, name, baseInterval, media.
- RecipeDefinition: id, skillId, name, media.
- ActionDefinition: id, skillId, staminaCost, goldReward, xpSkill, xpRecipe, stunTime.

Save schema v1 (localStorage):
{
  version,
  lastTick,
  activePlayerId,
  players: { [playerId]: PlayerState }
}

Note: `actionProgress` is runtime-only and is stripped from save data.

## State management and project structure
State management:
- Use a lightweight store (subscribe/get/dispatch) implemented in `src/store`.
- React binds through `useSyncExternalStore`, so UI re-renders only on changes.
- Core functions are pure and return the next state (facilitates tests).

Proposed structure:
- src/app: React app shell, screens, components, hooks.
- src/core: engine, reducers/systems, offline processing, selectors.
- src/data: static definitions (skills, recipes, actions).
- src/store: gameStore + UI bindings.
- src/adapters: persistence, clock/visibility, random.
- src/styles: app styles and shared tokens.
