import type { GameState, PlayerState } from "../../core/types";

export const selectActivePlayer = (() => {
    let lastPlayers: GameState["players"] | null = null;
    let lastActiveId: GameState["activePlayerId"] | null = null;
    let lastResult: PlayerState | null = null;
    return (state: GameState): PlayerState | null => {
        if (state.players === lastPlayers && state.activePlayerId === lastActiveId) {
            return lastResult;
        }
        lastPlayers = state.players;
        lastActiveId = state.activePlayerId;
        lastResult = state.activePlayerId ? state.players[state.activePlayerId] ?? null : null;
        return lastResult;
    };
})();

export const selectActivePlayerFromPlayers = (
    players: GameState["players"],
    activePlayerId: GameState["activePlayerId"]
): PlayerState | null => {
    return activePlayerId ? players[activePlayerId] ?? null : null;
};

export const selectPlayersSorted = (state: GameState): PlayerState[] => {
    return selectPlayersSortedFromPlayers(state.players);
};

export const selectPlayersSortedFromPlayers = (() => {
    let lastPlayers: GameState["players"] | null = null;
    let lastResult: PlayerState[] = [];
    return (players: GameState["players"]): PlayerState[] => {
        if (players === lastPlayers) {
            return lastResult;
        }
        lastPlayers = players;
        lastResult = Object.values(players)
            .slice()
            .sort((a, b) => Number(a.id) - Number(b.id));
        return lastResult;
    };
})();

export const selectTickRateLabel = (() => {
    let lastInterval: number | null = null;
    let lastResult = "0.0";
    return (state: GameState): string => {
        if (state.loop.loopInterval === lastInterval) {
            return lastResult;
        }
        lastInterval = state.loop.loopInterval;
        lastResult = (1000 / state.loop.loopInterval).toFixed(1);
        return lastResult;
    };
})();

export const selectDriftLabel = (() => {
    let lastEma: number | null = null;
    let lastDrift: number | null = null;
    let lastResult = "0";
    return (state: GameState): string => {
        if (state.perf.driftEmaMs === lastEma && state.perf.lastDriftMs === lastDrift) {
            return lastResult;
        }
        lastEma = state.perf.driftEmaMs;
        lastDrift = state.perf.lastDriftMs;
        const driftMs = Number.isFinite(state.perf.driftEmaMs) ? state.perf.driftEmaMs : state.perf.lastDriftMs;
        lastResult = `${driftMs > 0 ? "+" : ""}${Math.round(driftMs)}`;
        return lastResult;
    };
})();

export const selectVirtualScore = (() => {
    let lastPlayers: GameState["players"] | null = null;
    let lastResult = 0;
    return (state: GameState): number => {
        if (state.players === lastPlayers) {
            return lastResult;
        }
        lastPlayers = state.players;
        lastResult = Object.values(state.players).reduce((total, player) => {
            const playerScore = Object.values(player.skills).reduce((sum, skill) => sum + skill.level, 0);
            return total + playerScore;
        }, 0);
        return lastResult;
    };
})();
