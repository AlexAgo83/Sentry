import { describe, expect, it, vi } from "vitest";
import { createGameStore } from "../../src/store/gameStore";
import { createInitialGameState } from "../../src/core/state";

describe("gameStore", () => {
    it("dispatches actions and notifies subscribers", () => {
        const initial = createInitialGameState("0.4.0");
        initial.rosterLimit = 2;
        const store = createGameStore(initial);
        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);

        store.dispatch({ type: "addPlayer", name: "Mara" });

        expect(listener).toHaveBeenCalledTimes(1);
        expect(Object.keys(store.getState().players)).toHaveLength(2);

        unsubscribe();
        store.dispatch({ type: "addPlayer", name: "Rin" });
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
