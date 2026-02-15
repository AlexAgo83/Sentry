import { describe, expect, it } from "vitest";
import { toGameSave } from "../../src/core/serialization";
import { createInitialGameState, createPlayerState, hydrateGameState } from "../../src/core/state";
import { gameReducer } from "../../src/core/reducer";

describe("serialization", () => {
    it("round-trips action journal entries through save and hydrate", () => {
        const state = createInitialGameState("0.3.1");
        state.actionJournal = [
            { id: "entry-1", at: 1_000, label: "Started gathering" },
            { id: "entry-2", at: 2_000, label: "Finished craft" }
        ];

        const save = toGameSave(state);
        const hydrated = hydrateGameState("0.3.1", save);

        expect(save.actionJournal).toEqual(state.actionJournal);
        expect(hydrated.actionJournal).toEqual(state.actionJournal);
    });

    it("hydrates action journal defensively from malformed saves", () => {
        const state = createInitialGameState("0.3.1");
        const playerId = state.activePlayerId ?? "1";
        const malformedSave = {
            version: "0.3.1",
            lastTick: 123,
            activePlayerId: playerId,
            players: state.players,
            actionJournal: [
                { id: "", at: 100, label: "  First entry " },
                { id: "bad-at", at: -5, label: "Invalid" },
                { id: "good", at: "101", label: "Second entry" }
            ]
        } as unknown as ReturnType<typeof toGameSave>;

        const hydrated = hydrateGameState("0.3.1", malformedSave);

        expect(hydrated.actionJournal).toHaveLength(2);
        expect(hydrated.actionJournal[0]).toMatchObject({
            at: 100,
            label: "First entry"
        });
        expect(hydrated.actionJournal[1]).toMatchObject({
            id: "good",
            at: 101,
            label: "Second entry"
        });
    });

    it("strips runtime-only fields from saves", () => {
        const state = createInitialGameState("0.3.1");
        const save = toGameSave(state);
        const playerId = state.activePlayerId ?? "1";

        expect(save.activePlayerId).toBe(state.activePlayerId);
        expect("actionProgress" in save.players[playerId]).toBe(false);
        expect(save.inventory?.items.gold).toBe(state.inventory.items.gold);
    });

    it("round-trips inventory discovery state and derives it from current inventory when missing", () => {
        const state = createInitialGameState("0.9.0");
        state.inventory.items.signet_ring = 1;
        state.inventory.discoveredItemIds = {
            ...(state.inventory.discoveredItemIds ?? {}),
            signet_ring: true
        };

        const save = toGameSave(state);
        const hydrated = hydrateGameState("0.9.0", save);
        expect(hydrated.inventory.discoveredItemIds?.signet_ring).toBe(true);

        const legacyLikeSave = {
            ...save,
            inventory: {
                items: {
                    ...save.inventory?.items,
                    warding_amulet: 2
                }
            }
        };
        const hydratedLegacy = hydrateGameState("0.9.0", legacyLikeSave);
        expect(hydratedLegacy.inventory.discoveredItemIds?.warding_amulet).toBe(true);
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
