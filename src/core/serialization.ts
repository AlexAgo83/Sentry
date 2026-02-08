import { GameSave, GameState } from "./types";
import { stripRuntimeFields } from "./state";

export const toGameSave = (state: GameState): GameSave => {
    return {
        schemaVersion: 3,
        version: state.version,
        lastTick: state.loop.lastTick,
        lastHiddenAt: state.loop.lastHiddenAt,
        activePlayerId: state.activePlayerId,
        lastNonDungeonActionByPlayer: state.lastNonDungeonActionByPlayer,
        players: stripRuntimeFields(state.players),
        rosterLimit: state.rosterLimit,
        inventory: state.inventory,
        quests: state.quests,
        progression: state.progression,
        dungeon: state.dungeon
    };
};
