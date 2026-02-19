import { describe, expect, it } from "vitest";
import { DUNGEON_DEFINITIONS } from "../../src/data/dungeons";
import {
    DUNGEON_ATTACK_INTERVAL_MIN_MS,
    getActiveDungeonRun,
    getDungeonRuns,
    getDungeonStartFoodCost,
    normalizeDungeonState,
    stopDungeonRun,
    updateDungeonOnboardingRequired
} from "../../src/core/dungeon";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import { gameReducer } from "../../src/core/reducer";
import type { DungeonDefinition, DungeonRunState, DungeonState } from "../../src/core/types";

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
        {
            playerId: "1",
            hp: 100,
            hpMax: 100,
            potionCooldownMs: 0,
            attackCooldownMs: 0,
            magicHealCooldownMs: 0
        }
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
    threatByHeroId: { "1": 0 },
    threatTieOrder: ["1"],
    ...overrides
});

describe("dungeon state normalization", () => {
    it("applies setup fallbacks, dedupes party selection, and clamps policy", () => {
        const input = {
            onboardingRequired: true,
            setup: {
                selectedDungeonId: "invalid_dungeon",
                selectedPartyPlayerIds: ["1", "1", "2", "2", "3", "4"],
                autoRestart: false,
                autoConsumables: false
            },
            runs: {},
            activeRunId: "missing",
            latestReplay: null,
            completionCounts: {},
            policy: {
                maxConcurrentSupported: 0,
                maxConcurrentEnabled: 99
            }
        } as DungeonState;

        const normalized = normalizeDungeonState(input);

        expect(normalized.onboardingRequired).toBe(true);
        expect(normalized.setup.selectedDungeonId).toBe(DUNGEON_DEFINITIONS[0]?.id);
        expect(normalized.setup.selectedPartyPlayerIds).toEqual(["1", "2", "3", "4"]);
        expect(normalized.setup.autoRestart).toBe(false);
        expect(normalized.setup.autoConsumables).toBe(false);
        expect(normalized.policy.maxConcurrentSupported).toBe(1);
        expect(normalized.policy.maxConcurrentEnabled).toBe(1);
        expect(normalized.activeRunId).toBeNull();
    });

    it("prunes runs and sanitizes run fields", () => {
        const runA = buildRun({
            id: "run-a",
            startedAt: 1_000,
            floorPauseMs: -50,
            targetHeroId: 123 as unknown as DungeonRunState["targetHeroId"],
            threatTieOrder: null as unknown as DungeonRunState["threatTieOrder"],
            party: [
                {
                    playerId: "1",
                    hp: 100,
                    hpMax: 100,
                    potionCooldownMs: Number.NaN,
                    attackCooldownMs: Number.NaN,
                    magicHealCooldownMs: Number.NaN,
                    tauntUntilMs: Number.NaN,
                    tauntBonus: Number.NaN,
                    tauntStartedAtMs: Number.NaN,
                    stunnedUntilMs: Number.NaN
                },
                {
                    playerId: "2",
                    hp: 100,
                    hpMax: 100,
                    potionCooldownMs: 0,
                    attackCooldownMs: 0,
                    magicHealCooldownMs: 0
                }
            ],
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 1" },
                { atMs: 100, type: "attack", sourceId: "1", targetId: "x", amount: 1 }
            ],
            nonCriticalEventCount: Number.NaN,
            threatByHeroId: { "1": 5 }
        });
        const runB = buildRun({
            id: "run-b",
            startedAt: 2_000,
            status: "failed",
            endReason: "wipe"
        });

        const input = {
            onboardingRequired: false,
            setup: {
                selectedDungeonId: "dungeon_ruines_humides",
                selectedPartyPlayerIds: [],
                autoRestart: true,
                autoConsumables: true
            },
            runs: {
                "run-a": runA,
                "run-b": runB
            },
            activeRunId: "run-a",
            latestReplay: null,
            completionCounts: {},
            policy: { maxConcurrentSupported: 3, maxConcurrentEnabled: 1 }
        } as DungeonState;

        const normalized = normalizeDungeonState(input);
        expect(Object.keys(normalized.runs)).toEqual(["run-a"]);

        const normalizedRun = normalized.runs["run-a"];
        expect(normalizedRun.floorPauseMs).toBe(0);
        expect(normalizedRun.targetHeroId).toBeNull();
        expect(normalizedRun.party[0].potionCooldownMs).toBe(0);
        expect(normalizedRun.party[0].attackCooldownMs).toBe(0);
        expect(normalizedRun.party[0].magicHealCooldownMs).toBe(0);
        expect(normalizedRun.party[0].tauntUntilMs).toBeNull();
        expect(normalizedRun.party[0].tauntBonus).toBeNull();
        expect(normalizedRun.party[0].tauntStartedAtMs).toBeNull();
        expect(normalizedRun.party[0].stunnedUntilMs).toBeNull();
        expect(normalizedRun.nonCriticalEventCount).toBe(1);
        expect(normalizedRun.threatByHeroId["1"]).toBe(5);
        expect(normalizedRun.threatByHeroId["2"]).toBe(0);
        expect(normalizedRun.threatTieOrder).toHaveLength(2);
    });

    it("keeps all active runs even when prune limit is below active count", () => {
        const runA = buildRun({ id: "run-a", startedAt: 1_000, status: "running" });
        const runB = buildRun({ id: "run-b", startedAt: 2_000, status: "running" });
        const runC = buildRun({ id: "run-c", startedAt: 3_000, status: "failed", endReason: "wipe" });

        const pruned = normalizeDungeonState({
            onboardingRequired: false,
            setup: {
                selectedDungeonId: "dungeon_ruines_humides",
                selectedPartyPlayerIds: [],
                autoRestart: true,
                autoConsumables: true
            },
            runs: {
                "run-a": runA,
                "run-b": runB,
                "run-c": runC
            },
            activeRunId: "run-b",
            latestReplay: null,
            completionCounts: {},
            policy: { maxConcurrentSupported: 3, maxConcurrentEnabled: 1 }
        } as DungeonState);

        expect(Object.keys(pruned.runs).sort()).toEqual(["run-a", "run-b"]);
    });

    it("clamps completion counts to positive integers", () => {
        const input = {
            onboardingRequired: false,
            setup: {
                selectedDungeonId: "dungeon_ruines_humides",
                selectedPartyPlayerIds: [],
                autoRestart: true,
                autoConsumables: true
            },
            runs: {},
            activeRunId: null,
            latestReplay: null,
            completionCounts: {
                dungeon_ruines_humides: 3.9,
                dungeon_cryptes_dos: -2,
                custom: "4"
            },
            policy: { maxConcurrentSupported: 3, maxConcurrentEnabled: 1 }
        } as unknown as DungeonState;

        const normalized = normalizeDungeonState(input);
        expect(normalized.completionCounts["dungeon_ruines_humides"]).toBe(3);
        expect(normalized.completionCounts["dungeon_cryptes_dos"]).toBeUndefined();
        expect(normalized.completionCounts["custom"]).toBe(4);
    });
});

describe("dungeon selectors and helpers", () => {
    it("sorts runs by startedAt then id", () => {
        const runA = buildRun({ id: "run-a", startedAt: 5 });
        const runB = buildRun({ id: "run-b", startedAt: 5 });
        const runC = buildRun({ id: "run-c", startedAt: 2 });
        const state = {
            onboardingRequired: false,
            setup: {
                selectedDungeonId: "dungeon_ruines_humides",
                selectedPartyPlayerIds: [],
                autoRestart: true,
                autoConsumables: true
            },
            runs: {
                "run-b": runB,
                "run-a": runA,
                "run-c": runC
            },
            activeRunId: null,
            latestReplay: null,
            completionCounts: {},
            policy: { maxConcurrentSupported: 3, maxConcurrentEnabled: 1 }
        } as DungeonState;

        const ids = getDungeonRuns(state).map((run) => run.id);
        expect(ids).toEqual(["run-c", "run-a", "run-b"]);
    });

    it("computes start food cost using tier and single-floor boss surcharge", () => {
        const singleFloor: DungeonDefinition = {
            id: "dungeon_single",
            name: "Single",
            tier: 1,
            floorCount: 1,
            recommendedPower: 1,
            bossName: "Boss",
            bossMechanic: "burst",
            lootTable: {
                rewardsPerClear: 1,
                entries: [{ itemId: "food", weight: 1, quantityMin: 1, quantityMax: 1 }]
            }
        };
        const multiFloor: DungeonDefinition = {
            id: "dungeon_multi",
            name: "Multi",
            tier: 5,
            floorCount: 10,
            recommendedPower: 1,
            bossName: "Boss",
            bossMechanic: "burst",
            lootTable: {
                rewardsPerClear: 1,
                entries: [{ itemId: "food", weight: 1, quantityMin: 1, quantityMax: 1 }]
            }
        };

        expect(getDungeonStartFoodCost(singleFloor)).toBe(2);
        expect(getDungeonStartFoodCost(multiFloor)).toBe(3);
    });

    it("falls back to the first active run when activeRunId is not active", () => {
        const runA = buildRun({ id: "run-a", status: "victory", endReason: "victory", restartAt: null });
        const runB = buildRun({ id: "run-b", status: "running", startedAt: 2_000 });
        const state = {
            onboardingRequired: false,
            setup: {
                selectedDungeonId: "dungeon_ruines_humides",
                selectedPartyPlayerIds: [],
                autoRestart: true,
                autoConsumables: true
            },
            runs: {
                "run-a": runA,
                "run-b": runB
            },
            activeRunId: "run-a",
            latestReplay: null,
            completionCounts: {},
            policy: { maxConcurrentSupported: 3, maxConcurrentEnabled: 1 }
        } as DungeonState;

        expect(getActiveDungeonRun(state)?.id).toBe("run-b");
    });
});

describe("dungeon onboarding", () => {
    it("clears onboarding required when the roster reaches four heroes", () => {
        const state = createInitialGameState("0.9.0", { seedHero: false });
        state.players["1"] = createPlayerState("1", "Ari");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");

        const updated = updateDungeonOnboardingRequired(state);
        expect(updated.dungeon.onboardingRequired).toBe(false);
    });

    it("keeps onboarding required when fewer than four heroes exist", () => {
        const state = createInitialGameState("0.9.0", { seedHero: false });
        state.players["1"] = createPlayerState("1", "Ari");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");

        const updated = updateDungeonOnboardingRequired(state);
        expect(updated.dungeon.onboardingRequired).toBe(true);
    });
});

describe("dungeon run guards and completion", () => {
    it("rejects duplicate party ids when starting a run", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 20;

        const nextState = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "1", "2", "3"],
            timestamp: 1_000
        });

        expect(nextState.dungeon.activeRunId).toBeNull();
        expect(nextState.inventory.items.food).toBe(20);
    });

    it("rejects party sizes other than four", () => {
        const baseState = createInitialGameState("0.9.0");
        baseState.players["2"] = createPlayerState("2", "Mara");
        baseState.players["3"] = createPlayerState("3", "Iris");
        baseState.players["4"] = createPlayerState("4", "Kai");
        baseState.players["5"] = createPlayerState("5", "Noa");
        baseState.inventory.items.food = 20;

        const tooSmall = gameReducer(structuredClone(baseState), {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3"],
            timestamp: 1_000
        });

        const tooLarge = gameReducer(structuredClone(baseState), {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4", "5"],
            timestamp: 1_000
        });

        expect(tooSmall.dungeon.activeRunId).toBeNull();
        expect(tooSmall.inventory.items.food).toBe(20);
        expect(tooLarge.dungeon.activeRunId).toBeNull();
        expect(tooLarge.inventory.items.food).toBe(20);
    });

    it("rejects parties containing unknown player ids", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.inventory.items.food = 20;

        const nextState = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        expect(nextState.dungeon.activeRunId).toBeNull();
        expect(nextState.inventory.items.food).toBe(20);
    });

    it("filters setup selection for heroes already assigned to active runs", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.players["5"] = createPlayerState("5", "Noa");
        state.players["6"] = createPlayerState("6", "Rin");
        state.players["7"] = createPlayerState("7", "Tao");
        state.players["8"] = createPlayerState("8", "Uma");
        state.inventory.items.food = 30;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const nextState = gameReducer(state, {
            type: "dungeonSetupSetParty",
            playerIds: ["1", "5", "6", "7", "8"]
        });

        expect(nextState.dungeon.setup.selectedPartyPlayerIds).toEqual(["5", "6", "7", "8"]);
    });

    it("snapshots normalized start inventory on run start", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 6.7;
        state.inventory.items.tonic = -2;
        state.inventory.items.elixir = Number.NaN;
        state.inventory.items.potion = 3;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = state.dungeon.activeRunId ? state.dungeon.runs[state.dungeon.activeRunId] : null;
        expect(run?.startInventory).toEqual({ food: 6, tonic: 0, elixir: 0, potion: 3 });
    });

    it("rejects unknown dungeon ids when starting a run", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 20;

        const nextState = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_missing",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        expect(nextState.dungeon.activeRunId).toBeNull();
        expect(nextState.dungeon.setup.selectedDungeonId).toBe(state.dungeon.setup.selectedDungeonId);
        expect(nextState.inventory.items.food).toBe(20);
    });

    it("applies ranged weapon attack interval multiplier on run start", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.players["1"].equipment.slots.Weapon = "simple_bow";
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
        const ranged = run.party.find((member) => member.playerId === "1");
        const melee = run.party.find((member) => member.playerId === "2");
        expect(ranged?.attackCooldownMs).toBe(DUNGEON_ATTACK_INTERVAL_MIN_MS);
        expect(melee?.attackCooldownMs).toBeGreaterThan(DUNGEON_ATTACK_INTERVAL_MIN_MS);
    });

    it("increments completion counts and records replay on victory", () => {
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
        expect(runId).toBeTruthy();
        if (!runId) {
            return;
        }
        const dungeonId = state.dungeon.runs[runId].dungeonId;

        const stopped = stopDungeonRun(state, "victory");
        expect(stopped.dungeon.completionCounts[dungeonId]).toBe(1);
        expect(stopped.dungeon.latestReplay?.endReason).toBe("victory");
        expect(
            stopped.dungeon.latestReplay?.events.some((event) => event.type === "run_end" && event.label === "victory")
        ).toBe(true);
        expect(stopped.dungeon.activeRunId).toBeNull();
    });

    it("does not increment completion counts for non-victory endings", () => {
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

        const stopped = stopDungeonRun(state, "stopped");
        expect(Object.keys(stopped.dungeon.completionCounts)).toHaveLength(0);
        expect(stopped.dungeon.latestReplay?.endReason).toBe("stopped");
        expect(stopped.dungeon.activeRunId).toBeNull();
    });
});
