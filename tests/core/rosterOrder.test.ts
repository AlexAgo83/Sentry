import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState, normalizeRosterOrder } from "../../src/core/state";
import { gameReducer } from "../../src/core/reducer";

describe("roster order", () => {
    it("normalizes roster order by filtering unknowns, deduping, and appending missing ids", () => {
        const players = {
            "1": createPlayerState("1", "Ari"),
            "2": createPlayerState("2", "Mara"),
            "3": createPlayerState("3", "Iris")
        };
        const normalized = normalizeRosterOrder(players, ["2", "2", "missing", "1"]);
        expect(normalized).toEqual(["2", "1", "3"]);
    });

    it("appends new heroes to the end of roster order", () => {
        const state = createInitialGameState("0.9.12");
        state.rosterLimit = 4;
        const nextState = gameReducer(state, { type: "addPlayer", name: "Nova" });
        expect(nextState.rosterOrder).toEqual(["1", "2"]);
    });

    it("reorders heroes by target index", () => {
        let state = createInitialGameState("0.9.12");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.rosterOrder = ["1", "2", "3"];

        const nextState = gameReducer(state, { type: "reorderRoster", playerId: "3", targetIndex: 1 });
        expect(nextState.rosterOrder).toEqual(["1", "3", "2"]);
    });
});
