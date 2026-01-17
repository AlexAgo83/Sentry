import { applyTick } from "./loop";
import { createActionProgress, createPlayerState, getNextPlayerId, hydrateGameState } from "./state";
import {
    ActionId,
    GameSave,
    GameState,
    PlayerId,
    RecipeId,
    SkillId
} from "./types";

export type GameAction =
    | { type: "hydrate"; save: GameSave | null; version: string }
    | { type: "tick"; deltaMs: number; timestamp: number }
    | { type: "setHiddenAt"; hiddenAt: number | null }
    | { type: "setActivePlayer"; playerId: PlayerId }
    | { type: "addPlayer" }
    | { type: "selectAction"; playerId: PlayerId; actionId: ActionId | null }
    | { type: "selectRecipe"; playerId: PlayerId; skillId: SkillId; recipeId: RecipeId | null };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "hydrate":
            return hydrateGameState(action.version, action.save);
        case "tick":
            return applyTick(state, action.deltaMs, action.timestamp);
        case "setHiddenAt":
            return {
                ...state,
                loop: {
                    ...state.loop,
                    lastHiddenAt: action.hiddenAt
                }
            };
        case "setActivePlayer":
            if (!state.players[action.playerId]) {
                return state;
            }
            return {
                ...state,
                activePlayerId: action.playerId
            };
        case "addPlayer": {
            const nextId = getNextPlayerId(state.players);
            const nextPlayer = createPlayerState(nextId);
            return {
                ...state,
                players: {
                    ...state.players,
                    [nextId]: nextPlayer
                },
                activePlayerId: nextId
            };
        }
        case "selectAction": {
            const player = state.players[action.playerId];
            if (!player) {
                return state;
            }
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.playerId]: {
                        ...player,
                        selectedActionId: action.actionId,
                        actionProgress: createActionProgress()
                    }
                }
            };
        }
        case "selectRecipe": {
            const player = state.players[action.playerId];
            if (!player) {
                return state;
            }
            const skill = player.skills[action.skillId];
            if (!skill) {
                return state;
            }
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.playerId]: {
                        ...player,
                        skills: {
                            ...player.skills,
                            [action.skillId]: {
                                ...skill,
                                selectedRecipeId: action.recipeId
                            }
                        },
                        actionProgress: createActionProgress()
                    }
                }
            };
        }
        default:
            return state;
    }
};
