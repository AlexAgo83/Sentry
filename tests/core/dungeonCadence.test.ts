import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import {
    applyDungeonTick,
    DUNGEON_ATTACK_INTERVAL_MAX_MS,
    DUNGEON_ATTACK_INTERVAL_MIN_MS,
    DUNGEON_BASE_ATTACK_MS,
    DUNGEON_STEP_EVENT_CAP,
    DUNGEON_TOTAL_EVENT_CAP,
    resolveHeroAttackIntervalMs
} from "../../src/core/dungeon";
import { gameReducer } from "../../src/core/reducer";
import type { DungeonRunState, PlayerId } from "../../src/core/types";

const buildLargePartyRun = (playerIds: PlayerId[]): DungeonRunState => {
    const threatByHeroId = Object.fromEntries(playerIds.map((playerId) => [playerId, 0]));
    return {
        id: "run-cap",
        dungeonId: "dungeon_ruines_humides",
        status: "running",
        endReason: null,
        startedAt: 1_000,
        elapsedMs: 0,
        stepCarryMs: 0,
        encounterStep: 0,
        floor: 1,
        floorCount: 3,
        party: playerIds.map((playerId) => ({
            playerId,
            hp: 100,
            hpMax: 100,
            potionCooldownMs: 0,
            attackCooldownMs: 0,
            magicHealCooldownMs: 0
        })),
        enemies: [
            {
                id: "mob-cap",
                name: "Cap Mob",
                hp: 1_000_000,
                hpMax: 1_000_000,
                damage: 1,
                isBoss: false,
                mechanic: null,
                spawnIndex: 0
            }
        ],
        targetEnemyId: "mob-cap",
        targetHeroId: null,
        autoRestart: false,
        restartAt: null,
        runIndex: 1,
        startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
        seed: 99,
        events: [],
        cadenceSnapshot: playerIds.map((playerId) => ({
            playerId,
            baseAttackMs: DUNGEON_BASE_ATTACK_MS,
            agilityAtRunStart: 50,
            resolvedAttackIntervalMs: DUNGEON_ATTACK_INTERVAL_MIN_MS,
            minAttackMs: DUNGEON_ATTACK_INTERVAL_MIN_MS,
            maxAttackMs: DUNGEON_ATTACK_INTERVAL_MAX_MS
        })),
        truncatedEvents: 0,
        nonCriticalEventCount: 0,
        threatByHeroId,
        threatTieOrder: playerIds
    };
};

describe("dungeon cadence", () => {
    it("scales and clamps attack interval by agility", () => {
        const baseInterval = resolveHeroAttackIntervalMs(DUNGEON_BASE_ATTACK_MS, 0);
        const fasterInterval = resolveHeroAttackIntervalMs(DUNGEON_BASE_ATTACK_MS, 10);
        const minInterval = resolveHeroAttackIntervalMs(DUNGEON_BASE_ATTACK_MS, 10_000);
        const maxInterval = resolveHeroAttackIntervalMs(0, 0);

        expect(fasterInterval).toBeLessThan(baseInterval);
        expect(minInterval).toBe(DUNGEON_ATTACK_INTERVAL_MIN_MS);
        expect(maxInterval).toBeLessThanOrEqual(DUNGEON_ATTACK_INTERVAL_MAX_MS);
    });

    it("allows multi-proc attacks up to the per-hero cap", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 20;
        state.players["1"].stats.base.Agility = 50;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = state.dungeon.activeRunId ? state.dungeon.runs[state.dungeon.activeRunId] : null;
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [
            {
                id: "mob-test",
                name: "Test Mob",
                hp: 100_000,
                hpMax: 100_000,
                damage: 1,
                isBoss: false,
                mechanic: null,
                spawnIndex: 0
            }
        ];
        run.targetEnemyId = "mob-test";
        run.events = [];
        const hero = run.party.find((member) => member.playerId === "1");
        if (hero) {
            hero.attackCooldownMs = 0;
        }

        const result = applyDungeonTick(state, 500, 1_500);
        const nextRun = result.state.dungeon.activeRunId
            ? result.state.dungeon.runs[result.state.dungeon.activeRunId]
            : null;
        const attackEvents = nextRun?.events.filter((event) => event.type === "attack" && event.sourceId === "1") ?? [];

        expect(attackEvents.length).toBe(3);
    });

    it("drops attack events after the per-step event cap", () => {
        const heroCount = 40;
        const state = createInitialGameState("0.9.0");
        for (let i = 1; i <= heroCount; i += 1) {
            const id = String(i) as PlayerId;
            state.players[id] = createPlayerState(id, `Hero ${i}`);
            state.players[id].stats.base.Agility = 50;
        }
        const playerIds = Object.keys(state.players) as PlayerId[];
        const run = buildLargePartyRun(playerIds);
        state.dungeon.runs = { [run.id]: run };
        state.dungeon.activeRunId = run.id;

        const result = applyDungeonTick(state, 500, 1_500);
        const nextRun = result.state.dungeon.runs[run.id];
        const attackEvents = nextRun.events.filter((event) => event.type === "attack" || event.type === "damage");

        expect(attackEvents.length).toBeLessThanOrEqual(DUNGEON_STEP_EVENT_CAP);
        expect(nextRun.truncatedEvents).toBeGreaterThan(0);
    });

    it("keeps critical events after the global non-critical event cap", () => {
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

        const run = state.dungeon.activeRunId ? state.dungeon.runs[state.dungeon.activeRunId] : null;
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        run.events = [];
        run.truncatedEvents = 0;
        run.nonCriticalEventCount = DUNGEON_TOTAL_EVENT_CAP;
        run.enemies = [
            {
                id: "mob-cap",
                name: "Cap Mob",
                hp: 1_000,
                hpMax: 1_000,
                damage: 999,
                isBoss: false,
                mechanic: null,
                spawnIndex: 0
            }
        ];
        run.targetEnemyId = "mob-cap";

        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9999;
            member.hp = index === 0 ? 1 : 0;
        });

        const result = applyDungeonTick(state, 500, 1_500);
        const nextRun = result.state.dungeon.runs[run.id];
        const eventTypes = nextRun.events.map((event) => event.type);

        expect(eventTypes).toContain("death");
        expect(eventTypes).toContain("run_end");
        expect(eventTypes).not.toContain("attack");
        expect(eventTypes).not.toContain("damage");
        expect(nextRun.truncatedEvents).toBeGreaterThan(0);
    });
});
