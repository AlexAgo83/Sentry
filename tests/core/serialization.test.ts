import { describe, expect, it } from "vitest";
import { toGameSave } from "../../src/core/serialization";
import { createInitialGameState, hydrateGameState } from "../../src/core/state";

describe("serialization", () => {
    it("strips runtime-only fields from saves", () => {
        const state = createInitialGameState("0.3.1");
        const save = toGameSave(state);
        const playerId = state.activePlayerId ?? "1";

        expect(save.activePlayerId).toBe(state.activePlayerId);
        expect("actionProgress" in save.players[playerId]).toBe(false);
        expect(save.inventory?.items.gold).toBe(state.inventory.items.gold);
    });

    it("hydrates active player from save when available", () => {
        const state = createInitialGameState("0.3.1");
        const save = toGameSave(state);
        save.activePlayerId = state.activePlayerId;

        const hydrated = hydrateGameState("0.3.1", save);
        expect(hydrated.activePlayerId).toBe(state.activePlayerId);
    });

    it("migrates legacy per-player gold into inventory", () => {
        const state = createInitialGameState("0.3.1");
        const playerId = state.activePlayerId ?? "1";
        const legacySave = {
            version: "0.2.0",
            lastTick: state.loop.lastTick,
            activePlayerId: playerId,
            players: {
                [playerId]: {
                    ...state.players[playerId],
                    storage: { gold: 42 }
                }
            }
        } as unknown as ReturnType<typeof toGameSave>;

        const hydrated = hydrateGameState("0.3.1", legacySave);
        expect(hydrated.inventory.items.gold).toBe(42);
    });
});
