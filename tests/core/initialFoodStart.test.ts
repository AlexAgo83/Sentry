// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_GOLD } from "../../src/core/constants";
import { createInitialGameState, hydrateGameState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import { GameRuntime } from "../../src/core/runtime";
import { toGameSave } from "../../src/core/serialization";

describe("initial food start", () => {
    it("starts new games with 10 food while preserving default gold", () => {
        const state = createInitialGameState("0.9.27");
        expect(state.inventory.items.food).toBe(10);
        expect(state.inventory.items.gold).toBe(DEFAULT_GOLD);
    });

    it("keeps existing save inventory values unchanged during hydrate", () => {
        const state = createInitialGameState("0.9.27");
        state.inventory.items.food = 3;
        const hydrated = hydrateGameState("0.9.27", toGameSave(state));
        expect(hydrated.inventory.items.food).toBe(3);
    });

    it("reset flow recreates a fresh save with 10 food", () => {
        const store = createGameStore(createInitialGameState("0.9.27"));
        const persistence = {
            load: () => null,
            save: vi.fn()
        };
        const runtime = new GameRuntime(store, persistence, "0.9.27");

        runtime.reset();

        expect(store.getState().inventory.items.food).toBe(10);
        expect(store.getState().inventory.items.gold).toBe(DEFAULT_GOLD);
        expect(persistence.save).toHaveBeenCalled();
        const saved = persistence.save.mock.calls[0]?.[0];
        expect(saved?.inventory?.items?.food).toBe(10);
    });
});
