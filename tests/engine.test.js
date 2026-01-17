import { suite, test, expect, vi } from "vitest";
import { GameRuntime } from "../src/core/runtime";
import { createInitialGameState } from "../src/core/state";
import { createGameStore } from "../src/store/gameStore";

suite("GameRuntime", () => {
    test("resets state and persists the save", () => {
        const initial = createInitialGameState("0.4.0");
        const store = createGameStore(initial);
        const persistence = { load: () => null, save: vi.fn() };
        const runtime = new GameRuntime(store, persistence, "0.4.0");

        runtime.reset();

        expect(persistence.save).toHaveBeenCalledTimes(1);
        expect(store.getState().version).toBe("0.4.0");
    });
});
