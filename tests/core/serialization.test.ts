import { describe, expect, it } from "vitest";
import { toGameSave } from "../../src/core/serialization";
import { createInitialGameState, createPlayerState, hydrateGameState } from "../../src/core/state";
import { gameReducer } from "../../src/core/reducer";

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

    it("round-trips dungeon active run state through save serialization", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 20;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const save = toGameSave(state);
        const hydrated = hydrateGameState("0.9.0", save);
        expect(hydrated.dungeon.activeRunId).toBeTruthy();
        expect(Object.keys(hydrated.dungeon.runs)).toHaveLength(1);
        expect(hydrated.dungeon.setup.selectedPartyPlayerIds).toHaveLength(4);
    });

    it("splits legacy Combat progress while preserving non-combat skills", () => {
        const state = createInitialGameState("0.9.0");
        const playerId = state.activePlayerId ?? "1";
        const save = toGameSave(state);
        const player = save.players[playerId] as any;

        player.selectedActionId = "Combat";
        player.skills.Combat = {
            ...player.skills.CombatMelee,
            level: 25,
            xp: 123
        };
        delete player.skills.CombatMelee;
        delete player.skills.CombatRanged;
        delete player.skills.CombatMagic;
        player.skills.Hunting = {
            ...player.skills.Hunting,
            level: 7,
            xp: 55
        };
        delete player.skills.Roaming;

        const hydrated = hydrateGameState("0.9.0", save);
        const hydratedPlayer = hydrated.players[playerId];

        expect(hydratedPlayer.skills.CombatMelee.level).toBeGreaterThan(1);
        expect(hydratedPlayer.skills.CombatRanged.level).toBe(hydratedPlayer.skills.CombatMelee.level);
        expect(hydratedPlayer.skills.CombatMagic.level).toBe(hydratedPlayer.skills.CombatMelee.level);
        expect(hydratedPlayer.skills.Roaming.level).toBe(1);
        expect(hydratedPlayer.skills.Roaming.xp).toBe(0);
        expect(hydratedPlayer.skills.Hunting.level).toBe(7);
        expect(hydratedPlayer.skills.Hunting.xp).toBe(55);
        expect(hydratedPlayer.selectedActionId).toBe("Roaming");
    });
});
