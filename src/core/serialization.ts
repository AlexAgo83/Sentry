import { GameSave, GameState } from "./types";
import { stripRuntimeFields } from "./state";
import { ACTION_JOURNAL_LIMIT } from "./actionJournal";

export const toGameSave = (state: GameState): GameSave => {
    return {
        schemaVersion: 3,
        version: state.version,
        lastTick: state.loop.lastTick,
        lastHiddenAt: state.loop.lastHiddenAt,
        actionJournal: state.actionJournal.slice(0, ACTION_JOURNAL_LIMIT),
        activePlayerId: state.activePlayerId,
        lastNonDungeonActionByPlayer: state.lastNonDungeonActionByPlayer,
        players: stripRuntimeFields(state.players),
        rosterOrder: state.rosterOrder,
        rosterLimit: state.rosterLimit,
        inventory: state.inventory,
        quests: state.quests,
        progression: state.progression,
        dungeon: state.dungeon
    };
};
