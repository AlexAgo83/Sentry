import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import type { DungeonReplayState, DungeonRunState } from "../../src/core/types";
import {
    buildDungeonArenaLiveFrame,
    buildDungeonArenaReplayFrame,
    getDungeonReplayJumpMarks
} from "../../src/app/components/dungeon/arenaPlayback";

describe("dungeon arena playback", () => {
    it("builds a live frame with boss phase and focused target", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const run: DungeonRunState = {
            id: "run-1",
            dungeonId: "dungeon_ruines_humides",
            status: "running",
            endReason: null,
            startedAt: 1_000,
            elapsedMs: 1_000,
            stepCarryMs: 0,
            encounterStep: 4,
            floor: 10,
            floorCount: 10,
            party: [
                { playerId: "1", hp: 120, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "2", hp: 180, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "3", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "4", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
            ],
            enemies: [
                {
                    id: "boss-1",
                    name: "Fenwatch Brute",
                    hp: 90,
                    hpMax: 300,
                    damage: 10,
                    isBoss: true,
                    mechanic: "burst",
                    spawnIndex: 0
                }
            ],
            targetEnemyId: "boss-1",
            targetHeroId: null,
            autoRestart: true,
            restartAt: null,
            runIndex: 1,
            startInventory: { food: 10, tonic: 1, elixir: 0, potion: 0 },
            seed: 42,
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 10" },
                { atMs: 0, type: "boss_start", sourceId: "boss-1", label: "Fenwatch Brute" },
                { atMs: 0, type: "spawn", sourceId: "boss-1", label: "Fenwatch Brute" },
                { atMs: 700, type: "attack", sourceId: "1", targetId: "boss-1", amount: 30, label: "Hero" },
                { atMs: 700, type: "damage", sourceId: "1", targetId: "boss-1", amount: 30 },
                { atMs: 900, type: "damage", sourceId: "boss-1", targetId: "1", amount: 80 }
            ],
            cadenceSnapshot: [],
            truncatedEvents: 0,
            nonCriticalEventCount: 0,
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
            threatTieOrder: ["1", "2", "3", "4"]
        };

        const frame = buildDungeonArenaLiveFrame(run, state.players, 1_000);
        const boss = frame.units.find((unit) => unit.id === "boss-1");
        expect(frame.targetEnemyId).toBe("boss-1");
        expect(boss?.hp).toBe(90);
        expect(frame.bossPhaseLabel).toBe("Boss final phase");
        expect(frame.floatingTexts.some((entry) => entry.kind === "damage")).toBe(true);
    });

    it("replays damage/heal timeline deterministically", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const replay: DungeonReplayState = {
            runId: "run-r1",
            dungeonId: "dungeon_ruines_humides",
            status: "failed",
            endReason: "wipe",
            runIndex: 1,
            startedAt: 1_000,
            elapsedMs: 2_000,
            seed: 7,
            partyPlayerIds: ["1", "2", "3", "4"],
            teamSnapshot: [
                { playerId: "1", name: "A", equipment: state.players["1"].equipment },
                { playerId: "2", name: "B", equipment: state.players["2"].equipment },
                { playerId: "3", name: "C", equipment: state.players["3"].equipment },
                { playerId: "4", name: "D", equipment: state.players["4"].equipment }
            ],
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 1 },
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 10" },
                { atMs: 10, type: "boss_start", sourceId: "boss-1", label: "Boss" },
                { atMs: 20, type: "spawn", sourceId: "boss-1", label: "Boss" },
                { atMs: 100, type: "damage", sourceId: "boss-1", targetId: "1", amount: 120 },
                { atMs: 300, type: "heal", sourceId: "1", amount: 80, label: "potion" },
                { atMs: 600, type: "damage", sourceId: "1", targetId: "boss-1", amount: 70 },
                { atMs: 900, type: "death", sourceId: "1", label: "A" },
                { atMs: 1_200, type: "run_end", label: "wipe" }
            ],
            truncated: false,
            fallbackCriticalOnly: false,
            cadenceSnapshot: []
        };

        const beforeHeal = buildDungeonArenaReplayFrame(replay, state.players, 200);
        const afterHeal = buildDungeonArenaReplayFrame(replay, state.players, 450);
        const heroBefore = beforeHeal.units.find((unit) => unit.id === "1");
        const heroAfter = afterHeal.units.find((unit) => unit.id === "1");

        expect(heroBefore?.hp).toBeLessThan(heroAfter?.hp ?? 0);
        expect(getDungeonReplayJumpMarks(replay)).toEqual({ firstDeathAtMs: 900, runEndAtMs: 1_200 });
    });
});
