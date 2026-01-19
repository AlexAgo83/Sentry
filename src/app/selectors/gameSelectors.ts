import type { GameState, PlayerState } from "../../core/types";

export const selectActivePlayer = (state: GameState): PlayerState | null => {
    return state.activePlayerId ? state.players[state.activePlayerId] ?? null : null;
};

export const selectActivePlayerFromPlayers = (
    players: GameState["players"],
    activePlayerId: GameState["activePlayerId"]
): PlayerState | null => {
    return activePlayerId ? players[activePlayerId] ?? null : null;
};

export const selectPlayersSorted = (state: GameState): PlayerState[] => {
    return Object.values(state.players)
        .slice()
        .sort((a, b) => Number(a.id) - Number(b.id));
};

export const selectPlayersSortedFromPlayers = (players: GameState["players"]): PlayerState[] => {
    return Object.values(players)
        .slice()
        .sort((a, b) => Number(a.id) - Number(b.id));
};

export const selectTickRateLabel = (state: GameState): string => {
    return (1000 / state.loop.loopInterval).toFixed(1);
};

export const selectDriftLabel = (state: GameState): string => {
    const hasDelta = state.perf.lastDeltaMs > 0;
    const driftMs = hasDelta ? state.perf.lastDeltaMs - state.loop.loopInterval : 0;
    return `${driftMs > 0 ? "+" : ""}${Math.round(driftMs)}`;
};
