import { GameSave, GameState } from "./types";
import { stripRuntimeFields } from "./state";

export const toGameSave = (state: GameState): GameSave => {
    return {
        version: state.version,
        lastTick: state.loop.lastTick,
        lastHiddenAt: state.loop.lastHiddenAt,
        activePlayerId: state.activePlayerId,
        players: stripRuntimeFields(state.players),
        inventory: state.inventory
    };
};
