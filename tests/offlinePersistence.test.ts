import { describe, expect, it } from "vitest";
import { hydrateGameState } from "../src/core/state";
import { toGameSave } from "../src/core/serialization";
import { LOOP_INTERVAL } from "../src/core/constants";

describe("offline persistence", () => {
    it("persists and restores lastHiddenAt for offline recap", () => {
        const base = hydrateGameState("0.0.0", null);
        const withHidden = {
            ...base,
            loop: {
                ...base.loop,
                lastTick: 123,
                lastHiddenAt: 456,
                loopInterval: LOOP_INTERVAL,
                offlineInterval: base.loop.offlineInterval,
                offlineThreshold: base.loop.offlineThreshold
            }
        };

        const save = toGameSave(withHidden);
        expect(save.lastHiddenAt).toBe(456);

        const rehydrated = hydrateGameState("0.0.0", save);
        expect(rehydrated.loop.lastHiddenAt).toBe(456);
        expect(rehydrated.loop.lastTick).toBe(123);
    });
});
