import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import { DUNGEON_REPLAY_MAX_EVENTS, stopDungeonRun } from "../../src/core/dungeon";
import { gameReducer } from "../../src/core/reducer";

const startRun = () => {
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

    const runId = state.dungeon.activeRunId;
    if (!runId) {
        throw new Error("Expected active run to be created");
    }
    return { state, run: state.dungeon.runs[runId] };
};

describe("dungeon replay pipeline", () => {
    it("truncates replay events at the max cap without forcing critical-only fallback", () => {
        const { state, run } = startRun();
        run.events = Array.from({ length: DUNGEON_REPLAY_MAX_EVENTS + 5 }, (_, index) => ({
            atMs: index,
            type: "attack" as const,
            sourceId: "1",
            targetId: "mob",
            amount: 1,
            label: "hit"
        }));
        run.truncatedEvents = 0;

        const stopped = stopDungeonRun(state, "stopped");
        const replay = stopped.dungeon.latestReplay;

        expect(replay).toBeTruthy();
        expect(replay?.events).toHaveLength(DUNGEON_REPLAY_MAX_EVENTS);
        expect(replay?.truncated).toBe(true);
        expect(replay?.fallbackCriticalOnly).toBe(false);
    });

    it("marks replay as truncated when the run dropped events", () => {
        const { state, run } = startRun();
        run.events = [{ atMs: 0, type: "floor_start", label: "Floor 1" }];
        run.truncatedEvents = 2;

        const stopped = stopDungeonRun(state, "stopped");
        const replay = stopped.dungeon.latestReplay;

        expect(replay).toBeTruthy();
        expect(replay?.truncated).toBe(true);
        expect(replay?.fallbackCriticalOnly).toBe(false);
        expect(replay?.events.length).toBeGreaterThan(0);
    });

    it("keeps start inventory snapshot and falls back to default hero names", () => {
        const { state, run } = startRun();
        const startInventory = { ...run.startInventory };
        state.inventory.items.food = 0;
        state.inventory.items.tonic = 5;
        delete state.players["2"];

        const stopped = stopDungeonRun(state, "stopped");
        const replay = stopped.dungeon.latestReplay;

        expect(replay).toBeTruthy();
        expect(replay?.startInventory).toEqual(startInventory);
        const missingHero = replay?.teamSnapshot.find((entry) => entry.playerId === "2");
        expect(missingHero?.name).toBe("Hero 2");
    });
});
