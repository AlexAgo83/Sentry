import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../src/core/state";
import type { DungeonRunState } from "../../src/core/types";
import {
    resolveActiveDungeonRunIdForPlayer,
    resolveRosterSelectionDungeonNavigation
} from "../../src/app/rosterSelectionNavigation";

const buildRun = (overrides: Partial<DungeonRunState> = {}): DungeonRunState => ({
    id: "run-a",
    dungeonId: "dungeon_ruines_humides",
    status: "running",
    endReason: null,
    startedAt: 1_000,
    elapsedMs: 0,
    stepCarryMs: 0,
    encounterStep: 0,
    floor: 1,
    floorCount: 10,
    floorPauseMs: null,
    party: [
        { playerId: "1", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
        { playerId: "2", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
        { playerId: "3", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
        { playerId: "4", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
    ],
    enemies: [],
    targetEnemyId: null,
    targetHeroId: null,
    autoRestart: false,
    restartAt: null,
    runIndex: 1,
    startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
    seed: 1,
    events: [],
    cadenceSnapshot: [],
    truncatedEvents: 0,
    nonCriticalEventCount: 0,
    threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
    threatTieOrder: ["1", "2", "3", "4"],
    ...overrides
});

describe("resolveRosterSelectionDungeonNavigation", () => {
    it("ignores navigation when the app is not on dungeon screen", () => {
        const state = createInitialGameState("0.9.36");
        const result = resolveRosterSelectionDungeonNavigation({
            activeScreen: "main",
            selectedPlayerId: "1",
            dungeon: state.dungeon
        });
        expect(result).toEqual({
            nextActiveRunId: null,
            shouldExitDungeonToAction: false
        });
    });

    it("returns target run id when selecting a player from another active dungeon run", () => {
        const state = createInitialGameState("0.9.36");
        const runA = buildRun({ id: "run-a", startedAt: 1_000, party: buildRun().party.map((member, index) => ({ ...member, playerId: String(index + 1) })) });
        const runB = buildRun({
            id: "run-b",
            startedAt: 2_000,
            dungeonId: "dungeon_cryptes_dos",
            party: buildRun().party.map((member, index) => ({ ...member, playerId: String(index + 5) }))
        });
        state.dungeon.runs = { "run-a": runA, "run-b": runB };
        state.dungeon.activeRunId = "run-a";

        const result = resolveRosterSelectionDungeonNavigation({
            activeScreen: "dungeon",
            selectedPlayerId: "6",
            dungeon: state.dungeon
        });
        expect(result).toEqual({
            nextActiveRunId: "run-b",
            shouldExitDungeonToAction: false
        });
    });

    it("does not switch tab when selecting a player from the currently focused run", () => {
        const state = createInitialGameState("0.9.36");
        const runA = buildRun({ id: "run-a", startedAt: 1_000 });
        state.dungeon.runs = { "run-a": runA };
        state.dungeon.activeRunId = "run-a";

        const result = resolveRosterSelectionDungeonNavigation({
            activeScreen: "dungeon",
            selectedPlayerId: "1",
            dungeon: state.dungeon
        });
        expect(result).toEqual({
            nextActiveRunId: null,
            shouldExitDungeonToAction: false
        });
    });

    it("asks to exit dungeon to hero/action when selected player is not in an active run", () => {
        const state = createInitialGameState("0.9.36");
        const runA = buildRun({ id: "run-a", startedAt: 1_000 });
        const finishedRun = buildRun({
            id: "run-c",
            startedAt: 3_000,
            status: "failed",
            endReason: "wipe",
            restartAt: null,
            party: buildRun().party.map((member) => ({ ...member, playerId: String(Number(member.playerId) + 8) }))
        });
        state.dungeon.runs = { "run-a": runA, "run-c": finishedRun };
        state.dungeon.activeRunId = "run-a";

        const result = resolveRosterSelectionDungeonNavigation({
            activeScreen: "dungeon",
            selectedPlayerId: "12",
            dungeon: state.dungeon
        });
        expect(result).toEqual({
            nextActiveRunId: null,
            shouldExitDungeonToAction: true
        });
    });
});

describe("resolveActiveDungeonRunIdForPlayer", () => {
    it("returns null when no player is selected", () => {
        const state = createInitialGameState("0.9.36");
        const result = resolveActiveDungeonRunIdForPlayer({
            playerId: null,
            dungeon: state.dungeon
        });
        expect(result).toBeNull();
    });

    it("returns the active run id containing the selected player", () => {
        const state = createInitialGameState("0.9.36");
        const runA = buildRun({
            id: "run-a",
            startedAt: 1_000,
            party: buildRun().party.map((member, index) => ({ ...member, playerId: String(index + 1) }))
        });
        const runB = buildRun({
            id: "run-b",
            startedAt: 2_000,
            party: buildRun().party.map((member, index) => ({ ...member, playerId: String(index + 5) }))
        });
        state.dungeon.runs = { "run-a": runA, "run-b": runB };
        state.dungeon.activeRunId = "run-a";

        const result = resolveActiveDungeonRunIdForPlayer({
            playerId: "6",
            dungeon: state.dungeon
        });
        expect(result).toBe("run-b");
    });

    it("ignores inactive runs", () => {
        const state = createInitialGameState("0.9.36");
        const finishedRun = buildRun({
            id: "run-z",
            status: "victory",
            endReason: "victory",
            restartAt: null,
            party: buildRun().party.map((member, index) => ({ ...member, playerId: String(index + 10) }))
        });
        state.dungeon.runs = { "run-z": finishedRun };
        state.dungeon.activeRunId = null;

        const result = resolveActiveDungeonRunIdForPlayer({
            playerId: "11",
            dungeon: state.dungeon
        });
        expect(result).toBeNull();
    });
});
