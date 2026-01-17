import { describe, expect, it } from "vitest";
import { toGameSave } from "../../src/core/serialization";
import { createInitialGameState, hydrateGameState } from "../../src/core/state";

describe("serialization", () => {
    it("strips runtime-only fields from saves", () => {
        const state = createInitialGameState("0.3.0");
        const save = toGameSave(state);
        const playerId = state.activePlayerId ?? "1";

        expect(save.activePlayerId).toBe(state.activePlayerId);
        expect("actionProgress" in save.players[playerId]).toBe(false);
    });

    it("hydrates active player from save when available", () => {
        const state = createInitialGameState("0.3.0");
        const save = toGameSave(state);
        save.activePlayerId = state.activePlayerId;

        const hydrated = hydrateGameState("0.3.0", save);
        expect(hydrated.activePlayerId).toBe(state.activePlayerId);
    });
});
