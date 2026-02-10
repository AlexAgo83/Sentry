import type { GameState, PlayerState, PlayerId } from "../../core/types";
import { normalizeRosterOrder } from "../../core/state";

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
    return selectPlayersSortedFromPlayers(state.players, state.rosterOrder);
};

export const selectPlayersSortedFromPlayers = (() => {
    let lastPlayers: GameState["players"] | null = null;
    let lastRosterOrder: PlayerId[] | null = null;
    let lastResult: PlayerState[] = [];
    return (players: GameState["players"], rosterOrder: PlayerId[] = []): PlayerState[] => {
        if (players === lastPlayers && rosterOrder === lastRosterOrder) {
            return lastResult;
        }
        lastPlayers = players;
        lastRosterOrder = rosterOrder;
        const orderedIds = normalizeRosterOrder(players, rosterOrder);
        lastResult = orderedIds.map((id) => players[id]).filter(Boolean);
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

export const computePlayerSkillScore = (player: PlayerState): number => {
    return Object.values(player.skills).reduce((sum, skill) => {
        const xpNext = Number.isFinite(skill.xpNext) && skill.xpNext > 0 ? skill.xpNext : 0;
        const xpProgress = xpNext > 0 ? Math.min(1, Math.max(0, skill.xp / xpNext)) : 0;
        const recipeScore = Object.values(skill.recipes).reduce((recipeSum, recipe) => {
            return recipeSum + recipe.level * 0.25;
        }, 0);
        return sum + skill.level + xpProgress + recipeScore;
    }, 0);
};

export const selectVirtualScore = (() => {
    let lastPlayers: GameState["players"] | null = null;
    let lastQuests: GameState["quests"] | null = null;
    let lastResult = 0;
    return (state: GameState): number => {
        if (state.players === lastPlayers && state.quests === lastQuests) {
            return lastResult;
        }
        lastPlayers = state.players;
        lastQuests = state.quests;
        const questCount = Object.values(state.quests.completed ?? {}).filter(Boolean).length;
        const questScore = questCount * 5;
        const skillScore = Object.values(state.players).reduce((total, player) => {
            return total + computePlayerSkillScore(player);
        }, 0);
        lastResult = Math.round(skillScore + questScore);
        return lastResult;
    };
})();

export const selectHeroVirtualScore = (() => {
    let lastPlayers: GameState["players"] | null = null;
    let lastActiveId: GameState["activePlayerId"] | null = null;
    let lastResult = 0;
    return (state: GameState): number => {
        if (state.players === lastPlayers && state.activePlayerId === lastActiveId) {
            return lastResult;
        }
        lastPlayers = state.players;
        lastActiveId = state.activePlayerId;
        const player = state.activePlayerId ? state.players[state.activePlayerId] ?? null : null;
        lastResult = player ? Math.round(computePlayerSkillScore(player)) : 0;
        return lastResult;
    };
})();
