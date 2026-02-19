import { describe, expect, it } from "vitest";
import { toGameSave } from "../../src/core/serialization";
import { createInitialGameState, hydrateGameState } from "../../src/core/state";

describe("Cloud UI defaults", () => {
    it("starts with auto sync disabled by default", () => {
        const state = createInitialGameState("0.9.36");
        expect(state.ui.cloud.autoSyncEnabled).toBe(false);
    });

    it("keeps auto sync disabled when cloud prefs are missing in a save", () => {
        const state = createInitialGameState("0.9.36");
        const save = toGameSave(state);
        if (save.ui) {
            delete (save.ui as { cloud?: unknown }).cloud;
        }

        const hydrated = hydrateGameState("0.9.36", save);
        expect(hydrated.ui.cloud.autoSyncEnabled).toBe(false);
    });
});
