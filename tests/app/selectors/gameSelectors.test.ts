import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../../src/core/state";
import {
    selectActivePlayer,
    selectActivePlayerFromPlayers,
    selectDriftLabel,
    selectPlayersSorted,
    selectPlayersSortedFromPlayers,
    selectTickRateLabel,
    selectVirtualScore
} from "../../../src/app/selectors/gameSelectors";

describe("app gameSelectors", () => {
    it("selectActivePlayer returns the active player", () => {
        const state = createInitialGameState("test");
        const player2 = createPlayerState("2");
        state.players[player2.id] = player2;
        state.activePlayerId = "2";

        expect(selectActivePlayer(state)?.id).toBe("2");
        expect(selectActivePlayerFromPlayers(state.players, state.activePlayerId)?.id).toBe("2");
    });

    it("selectPlayersSorted sorts numerically by id", () => {
        const state = createInitialGameState("test");
        state.players = {
            "10": createPlayerState("10"),
            "2": createPlayerState("2"),
            "1": createPlayerState("1"),
        };

        expect(selectPlayersSorted(state).map((p) => p.id)).toEqual(["1", "2", "10"]);
        expect(selectPlayersSortedFromPlayers(state.players).map((p) => p.id)).toEqual(["1", "2", "10"]);
    });

    it("selectTickRateLabel and selectDriftLabel format values", () => {
        const state = createInitialGameState("test");
        state.loop.loopInterval = 500;
        state.perf.lastDeltaMs = 610;
        state.perf.lastDriftMs = 110;
        state.perf.driftEmaMs = 110;

        expect(selectTickRateLabel(state)).toBe("2.0");
        expect(selectDriftLabel(state)).toBe("+110");

        state.perf.lastDeltaMs = 400;
        state.perf.lastDriftMs = -100;
        state.perf.driftEmaMs = -100;
        expect(selectDriftLabel(state)).toBe("-100");
    });

    it("selectVirtualScore sums all player skill levels", () => {
        const state = createInitialGameState("test");
        const player2 = createPlayerState("2");
        state.players[player2.id] = player2;
        state.players["1"].skills.Combat.level = 3;
        state.players["1"].skills.Cooking.level = 2;
        state.players["2"].skills.Combat.level = 5;
        state.players["2"].skills.Fishing.level = 1;

        expect(selectVirtualScore(state)).toBe(11);
    });
});
