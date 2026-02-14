import { describe, expect, it } from "vitest";

import { DUNGEON_TOTAL_EVENT_CAP } from "../../src/core/dungeon/constants";
import {
    countNonCriticalEvents,
    createStepEventPusher,
    pushEventWithGlobalCap
} from "../../src/core/dungeon/replay";
import type { DungeonRunState } from "../../src/core/types";

const buildRun = (): DungeonRunState => ({
    id: "run-1",
    dungeonId: "dungeon_ruines_humides",
    status: "running",
    endReason: null,
    startedAt: 0,
    elapsedMs: 0,
    stepCarryMs: 0,
    encounterStep: 0,
    floor: 1,
    floorCount: 1,
    floorPauseMs: null,
    party: [],
    enemies: [],
    targetEnemyId: null,
    targetHeroId: null,
    autoRestart: false,
    restartAt: null,
    runIndex: 1,
    startInventory: {
        food: 0,
        tonic: 0,
        elixir: 0,
        potion: 0
    },
    seed: 1,
    events: [],
    cadenceSnapshot: [],
    truncatedEvents: 0,
    nonCriticalEventCount: 0,
    threatByHeroId: {},
    threatTieOrder: []
});

describe("dungeon replay split module", () => {
    it("counts only non-critical events", () => {
        expect(countNonCriticalEvents([
            { atMs: 0, type: "attack" },
            { atMs: 1, type: "damage" },
            { atMs: 2, type: "heal" },
            { atMs: 3, type: "run_end" }
        ])).toBe(2);
    });

    it("enforces global non-critical cap", () => {
        const run = buildRun();
        run.nonCriticalEventCount = DUNGEON_TOTAL_EVENT_CAP;
        const pushed = pushEventWithGlobalCap(run, { type: "attack", label: "hit" });
        expect(pushed).toBe(false);
        expect(run.events).toHaveLength(0);
        expect(run.truncatedEvents).toBe(1);
    });

    it("enforces per-step cap while allowing critical events", () => {
        const run = buildRun();
        const stepPusher = createStepEventPusher(run, 1, () => {
            run.truncatedEvents += 1;
        });

        expect(stepPusher.push({ type: "attack" })).toBe(true);
        expect(stepPusher.push({ type: "damage" })).toBe(false);
        expect(stepPusher.push({ type: "run_end", label: "done" })).toBe(true);

        expect(run.events.map((event) => event.type)).toEqual(["attack", "run_end"]);
        expect(run.truncatedEvents).toBe(1);
    });
});
