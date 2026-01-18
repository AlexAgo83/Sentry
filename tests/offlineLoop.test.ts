import { describe, expect, it, vi } from "vitest";
import { GameRuntime } from "../src/core/runtime";
import { createInitialGameState } from "../src/core/state";
import { createGameStore } from "../src/store/gameStore";

describe("GameRuntime offline loop", () => {
    it("stores offline processing summary", () => {
        const initial = createInitialGameState("0.4.0");
        const playerId = initial.activePlayerId ?? "1";
        initial.inventory.items.food = 3;
        const store = createGameStore(initial);
        const persistence = { load: () => null, save: vi.fn() };
        const runtime = new GameRuntime(store, persistence, "0.4.0");

        store.dispatch({ type: "selectAction", playerId, actionId: "Combat" });
        const recipeId = Object.keys(store.getState().players[playerId].skills.Combat.recipes)[0];
        store.dispatch({ type: "selectRecipe", playerId, skillId: "Combat", recipeId });

        runtime.simulateOffline(5000);

        const summary = store.getState().offlineSummary;
        expect(summary).not.toBeNull();
        expect(summary?.ticks).toBe(10);
        expect(summary?.totalItemDeltas.gold).toBe(1);
        expect(summary?.totalItemDeltas.bones).toBe(1);
        expect(summary?.totalItemDeltas.food).toBe(-1);
    });
});
