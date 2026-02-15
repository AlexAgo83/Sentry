import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import {
    applyDungeonTick,
    DUNGEON_BASE_ATTACK_MS,
    DUNGEON_BURST_INTERVAL_MS,
    DUNGEON_SIMULATION_STEP_MS,
    DUNGEON_SUMMON_INTERVAL_MS,
    getActiveDungeonRun,
    getActiveDungeonRunIds,
    getActiveDungeonRuns,
    isPlayerAssignedToActiveDungeonRun
} from "../../src/core/dungeon";
import { gameReducer } from "../../src/core/reducer";

const BASE_ATTACK_STEP_INDEX = (DUNGEON_BASE_ATTACK_MS / DUNGEON_SIMULATION_STEP_MS) - 1;
const BURST_STEP_INDEX = (DUNGEON_BURST_INTERVAL_MS / DUNGEON_SIMULATION_STEP_MS) - 1;
const SUMMON_STEP_INDEX = (DUNGEON_SUMMON_INTERVAL_MS / DUNGEON_SIMULATION_STEP_MS) - 1;

describe("dungeon flow", () => {
    it("enables dungeon onboarding when starting without a seeded hero", () => {
        const state = createInitialGameState("0.4.0", { seedHero: false });
        expect(state.dungeon.onboardingRequired).toBe(true);
        expect(state.rosterLimit).toBeGreaterThanOrEqual(4);
    });

    it("starts a run with 4 heroes and consumes floor food", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.players["1"].hp = 7;
        state.players["2"].hp = 8;
        state.players["3"].hp = 9;
        state.players["4"].hp = 10;
        state.players["1"] = {
            ...state.players["1"],
            selectedActionId: "Roaming"
        };
        state.inventory.items.food = 12;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        expect(run?.status).toBe("running");
        expect(run?.party).toHaveLength(4);
        run?.party.forEach((member) => {
            expect(member.hp).toBe(member.hpMax);
        });
        expect(state.players["1"].hp).toBe(state.players["1"].hpMax);
        expect(state.players["2"].hp).toBe(state.players["2"].hpMax);
        expect(state.players["3"].hp).toBe(state.players["3"].hpMax);
        expect(state.players["4"].hp).toBe(state.players["4"].hpMax);
        expect(state.inventory.items.food).toBe(11);
        expect(state.players["1"].selectedActionId).toBeNull();
    });

    it("does not start a run when there is not enough food", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 0;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        expect(state.dungeon.activeRunId).toBeNull();
    });

    it("grants combat XP on floor clear with boss bonus on the last floor", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        const partyIds = run.party.map((member) => member.playerId);
        partyIds.forEach((playerId) => {
            state.players[playerId].skills.CombatMelee.xp = 0;
            state.players[playerId].skills.CombatMelee.xpNext = 999_999;
        });

        run.floor = run.floorCount;
        run.encounterStep = 0;
        run.enemies = [{
            id: "boss-test",
            name: "Test Boss",
            hp: 1,
            hpMax: 1,
            damage: 1,
            isBoss: true,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-test";

        const result = applyDungeonTick(state, DUNGEON_BASE_ATTACK_MS, 1_000 + DUNGEON_BASE_ATTACK_MS);
        const expectedFloorXp = 6 + (1 * 3) + run.floorCount;
        const expectedTotalXp = expectedFloorXp + (expectedFloorXp * 2);

        partyIds.forEach((playerId) => {
            expect(result.state.players[playerId].skills.CombatMelee.xp).toBe(expectedTotalXp);
        });
    });

    it("grants exactly one non-gold loot reward on victory and marks it as discovered", () => {
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        run.floor = run.floorCount;
        run.encounterStep = 0;
        run.enemies = [{
            id: "boss-test",
            name: "Test Boss",
            hp: 1,
            hpMax: 1,
            damage: 1,
            isBoss: true,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-test";

        const result = applyDungeonTick(state, DUNGEON_BASE_ATTACK_MS, 2_000);
        const nonGoldLootEntries = Object.entries(result.itemDeltas).filter(([itemId, amount]) => itemId !== "gold" && amount > 0);
        expect(nonGoldLootEntries).toHaveLength(1);
        const droppedItemId = nonGoldLootEntries[0]?.[0];
        expect(droppedItemId).toBeTruthy();
        if (!droppedItemId) {
            return;
        }
        expect(result.state.inventory.discoveredItemIds?.[droppedItemId]).toBe(true);
    });

    it("does not grant dungeon loot when the party wipes", () => {
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.party = run.party.map((member) => ({ ...member, hp: 0 }));

        const result = applyDungeonTick(state, DUNGEON_BASE_ATTACK_MS, 2_000);
        expect(result.state.dungeon.latestReplay?.status).toBe("failed");
        const nonGoldLootEntries = Object.entries(result.itemDeltas).filter(([itemId, amount]) => itemId !== "gold" && amount > 0);
        expect(nonGoldLootEntries).toHaveLength(0);
    });

    it("produces deterministic loot rewards with the same seed context", () => {
        let baseState = createInitialGameState("0.9.0");
        baseState.players["2"] = createPlayerState("2", "Mara");
        baseState.players["3"] = createPlayerState("3", "Iris");
        baseState.players["4"] = createPlayerState("4", "Kai");
        baseState.inventory.items.food = 20;

        baseState = gameReducer(baseState, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const configureBossKill = (state: typeof baseState) => {
            const run = getActiveDungeonRun(state.dungeon);
            if (!run) {
                return;
            }
            run.floor = run.floorCount;
            run.encounterStep = 0;
            run.enemies = [{
                id: "boss-test",
                name: "Test Boss",
                hp: 1,
                hpMax: 1,
                damage: 1,
                isBoss: true,
                mechanic: null,
                spawnIndex: 0
            }];
            run.targetEnemyId = "boss-test";
        };

        const firstState = JSON.parse(JSON.stringify(baseState)) as typeof baseState;
        const secondState = JSON.parse(JSON.stringify(baseState)) as typeof baseState;
        configureBossKill(firstState);
        configureBossKill(secondState);

        const firstResult = applyDungeonTick(firstState, DUNGEON_BASE_ATTACK_MS, 2_000);
        const secondResult = applyDungeonTick(secondState, DUNGEON_BASE_ATTACK_MS, 2_000);
        const firstLoot = Object.entries(firstResult.itemDeltas).filter(([itemId, amount]) => itemId !== "gold" && amount > 0);
        const secondLoot = Object.entries(secondResult.itemDeltas).filter(([itemId, amount]) => itemId !== "gold" && amount > 0);
        expect(firstLoot).toEqual(secondLoot);
    });

    it("updates auto restart for setup and active run", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        state = gameReducer(state, { type: "dungeonSetupSetAutoRestart", autoRestart: false });

        expect(state.dungeon.setup.autoRestart).toBe(false);
        expect(getActiveDungeonRun(state.dungeon)?.autoRestart).toBe(false);
    });

    it("enforces v1 single active run guard even with extra roster", () => {
        let state = createInitialGameState("0.4.0");
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
        const firstRunId = state.dungeon.activeRunId;
        expect(firstRunId).toBeTruthy();

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_cryptes_dos",
            playerIds: ["5", "6", "7", "8"],
            timestamp: 2_000
        });

        expect(state.dungeon.activeRunId).toBe(firstRunId);
        expect(getActiveDungeonRuns(state.dungeon)).toHaveLength(1);
    });

    it("supports collection-based active run selectors for multi-run shaped state", () => {
        const state = createInitialGameState("0.4.0");
        state.dungeon.runs = {
            "run-a": {
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
                party: [{ playerId: "1", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }],
                enemies: [],
                targetEnemyId: null,
                targetHeroId: null,
                autoRestart: true,
                restartAt: null,
                runIndex: 1,
                startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
                seed: 1,
                events: [],
                cadenceSnapshot: [],
                truncatedEvents: 0,
                nonCriticalEventCount: 0,
                threatByHeroId: { "1": 0 },
                threatTieOrder: ["1"]
            },
            "run-b": {
                id: "run-b",
                dungeonId: "dungeon_cryptes_dos",
                status: "victory",
                endReason: "victory",
                startedAt: 2_000,
                elapsedMs: 10_000,
                stepCarryMs: 0,
                encounterStep: 0,
                floor: 10,
                floorCount: 10,
                party: [{ playerId: "2", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }],
                enemies: [],
                targetEnemyId: null,
                targetHeroId: null,
                autoRestart: true,
                restartAt: 12_000,
                runIndex: 1,
                startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
                seed: 2,
                events: [],
                cadenceSnapshot: [],
                truncatedEvents: 0,
                nonCriticalEventCount: 0,
                threatByHeroId: { "2": 0 },
                threatTieOrder: ["2"]
            },
            "run-c": {
                id: "run-c",
                dungeonId: "dungeon_forges_brisees",
                status: "failed",
                endReason: "wipe",
                startedAt: 3_000,
                elapsedMs: 12_000,
                stepCarryMs: 0,
                encounterStep: 0,
                floor: 3,
                floorCount: 10,
                party: [{ playerId: "3", hp: 0, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }],
                enemies: [],
                targetEnemyId: null,
                targetHeroId: null,
                autoRestart: false,
                restartAt: null,
                runIndex: 1,
                startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
                seed: 3,
                events: [],
                cadenceSnapshot: [],
                truncatedEvents: 0,
                nonCriticalEventCount: 0,
                threatByHeroId: { "3": 0 },
                threatTieOrder: ["3"]
            }
        };
        state.dungeon.activeRunId = "run-a";

        expect(getActiveDungeonRunIds(state.dungeon)).toEqual(["run-a", "run-b"]);
        expect(getActiveDungeonRuns(state.dungeon).map((run) => run.id)).toEqual(["run-a", "run-b"]);
        expect(isPlayerAssignedToActiveDungeonRun(state, "1")).toBe(true);
        expect(isPlayerAssignedToActiveDungeonRun(state, "2")).toBe(true);
        expect(isPlayerAssignedToActiveDungeonRun(state, "3")).toBe(false);
    });

    it("auto-uses healing potions under 50% hp", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;
        state.inventory.items.potion = 1;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const activeRun = getActiveDungeonRun(state.dungeon);
        expect(activeRun).toBeTruthy();
        if (!activeRun) {
            return;
        }
        const woundedHp = Math.floor(activeRun.party[0].hpMax * 0.4);
        activeRun.party[0].hp = woundedHp;
        activeRun.party[0].potionCooldownMs = 0;

        const result = applyDungeonTick(state, DUNGEON_BASE_ATTACK_MS, 1_000 + DUNGEON_BASE_ATTACK_MS);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(result.state.inventory.items.potion).toBe(0);
        expect(nextRun?.party[0].hp).toBeGreaterThan(woundedHp);
        expect(nextRun?.party[0].potionCooldownMs).toBeGreaterThan(0);
    });

    it("auto-uses healing potions at exactly 50% hp", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;
        state.inventory.items.potion = 1;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const activeRun = getActiveDungeonRun(state.dungeon);
        expect(activeRun).toBeTruthy();
        if (!activeRun) {
            return;
        }
        const halfHp = Math.floor(activeRun.party[0].hpMax * 0.5);
        activeRun.party[0].hp = halfHp;
        activeRun.party[0].potionCooldownMs = 0;

        const result = applyDungeonTick(state, DUNGEON_BASE_ATTACK_MS, 1_000 + DUNGEON_BASE_ATTACK_MS);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(result.state.inventory.items.potion).toBe(0);
        expect(nextRun?.party[0].hp).toBeGreaterThan(halfHp);
    });

    it("uses tonic first when multiple heal consumables are available", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;
        state.inventory.items.tonic = 1;
        state.inventory.items.elixir = 1;
        state.inventory.items.potion = 1;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const activeRun = getActiveDungeonRun(state.dungeon);
        expect(activeRun).toBeTruthy();
        if (!activeRun) {
            return;
        }
        activeRun.party[0].hp = Math.floor(activeRun.party[0].hpMax * 0.4);
        activeRun.party[0].potionCooldownMs = 0;

        const result = applyDungeonTick(state, 500, 1_500);
        expect(result.state.inventory.items.tonic).toBe(0);
        expect(result.state.inventory.items.elixir).toBe(1);
        expect(result.state.inventory.items.potion).toBe(1);
    });

    it("credits combatActiveMs only for heroes alive at step start", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-test",
            name: "Test Mob",
            hp: 1_000,
            hpMax: 1_000,
            damage: 999,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-test";
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9999;
            member.hp = index === 0 ? 1 : 0;
        });

        const result = applyDungeonTick(state, 500, 1_500);
        expect(result.combatActiveMsByPlayer["1"]).toBe(500);
        expect(result.combatActiveMsByPlayer["2"]).toBeUndefined();
    });

    it("targets the highest threat hero when no taunt is active", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-threat",
            name: "Threat Mob",
            hp: 1_000,
            hpMax: 1_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-threat";
        run.targetHeroId = null;
        run.party.forEach((member, index) => {
            member.attackCooldownMs = index === 0 ? 0 : 9999;
            member.hp = index < 2 ? member.hpMax : 0;
        });

        const result = applyDungeonTick(state, 500, 1_500);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(nextRun?.targetHeroId).toBe("1");
    });

    it("prioritizes taunt over threat when active", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-taunt",
            name: "Taunt Mob",
            hp: 1_000,
            hpMax: 1_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-taunt";
        run.targetHeroId = null;
        run.party.forEach((member, index) => {
            member.attackCooldownMs = index === 0 ? 0 : 9999;
            member.hp = index < 2 ? member.hpMax : 0;
        });
        run.party[1].tauntUntilMs = 5_000;
        run.party[1].tauntBonus = 200;

        const result = applyDungeonTick(state, 500, 1_500);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(nextRun?.targetHeroId).toBe("2");
    });

    it("keeps boss targeting sticky within threat thresholds", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "boss-sticky",
            name: "Sticky Boss",
            hp: 1_000,
            hpMax: 1_000,
            damage: 1,
            isBoss: true,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-sticky";
        run.targetHeroId = "1";
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9999;
            member.hp = index < 2 ? member.hpMax : 0;
        });
        run.threatByHeroId = { "1": 86, "2": 100, "3": 0, "4": 0 };

        const result = applyDungeonTick(state, 500, 1_500);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(nextRun?.targetHeroId).toBe("1");
    });

    it("spawns a summoned add on summon boss cadence", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.encounterStep = SUMMON_STEP_INDEX;
        run.enemies = [{
            id: "boss-summon",
            name: "Summoner",
            hp: 5_000,
            hpMax: 5_000,
            damage: 50,
            isBoss: true,
            mechanic: "summon",
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-summon";
        run.party.forEach((member) => {
            member.attackCooldownMs = 9_999;
            member.hp = member.hpMax;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(nextRun?.enemies.some((enemy) => enemy.name === "Summoned Add")).toBe(true);
        expect(nextRun?.events.some((event) => event.type === "spawn" && event.label === "Summoned Add")).toBe(true);
    });

    it("casts magic heal from magic weapon holders on wounded allies", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.players["4"].equipment.slots.Weapon = "apprentice_staff";
        state.inventory.items.food = 20;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-heal",
            name: "Heal Dummy",
            hp: 10_000,
            hpMax: 10_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-heal";
        run.party.forEach((member) => {
            member.attackCooldownMs = 9_999;
        });
        const wounded = run.party.find((member) => member.playerId === "1");
        expect(wounded).toBeTruthy();
        if (!wounded) {
            return;
        }
        wounded.hp = Math.floor(wounded.hpMax * 0.4);
        const hpBefore = wounded.hp;

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        const healed = nextRun?.party.find((member) => member.playerId === "1");
        expect(healed?.hp).toBeGreaterThan(hpBefore);
        expect(
            nextRun?.events.some((event) => event.type === "heal" && event.sourceId === "4" && event.targetId === "1")
        ).toBe(true);
    });

    it("does not cast magic heal when no ally is below the heal threshold", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.players["4"].equipment.slots.Weapon = "apprentice_staff";
        state.inventory.items.food = 20;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-no-heal",
            name: "No Heal Dummy",
            hp: 10_000,
            hpMax: 10_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-no-heal";
        run.party.forEach((member) => {
            member.attackCooldownMs = 9_999;
            member.hp = member.hpMax;
            member.magicHealCooldownMs = 0;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(nextRun?.events.some((event) => event.type === "heal")).toBe(false);
        const healer = nextRun?.party.find((member) => member.playerId === "4");
        expect(healer?.magicHealCooldownMs).toBe(0);
    });

    it("restores heroes to full HP when a run ends in failure", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.party.forEach((member) => {
            member.hp = 1;
        });
        run.enemies = [{
            id: "boss-poison-test",
            name: "Boss",
            hp: 10_000,
            hpMax: 10_000,
            damage: 10_000,
            isBoss: true,
            mechanic: "poison",
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-poison-test";

        const result = applyDungeonTick(state, DUNGEON_BASE_ATTACK_MS, 1_000 + DUNGEON_BASE_ATTACK_MS);
        expect(result.state.dungeon.activeRunId).toBeNull();
        expect(result.state.players["1"].hp).toBe(result.state.players["1"].hpMax);
        expect(result.state.players["2"].hp).toBe(result.state.players["2"].hpMax);
        expect(result.state.players["3"].hp).toBe(result.state.players["3"].hpMax);
        expect(result.state.players["4"].hp).toBe(result.state.players["4"].hpMax);
    });

    it("restores party HP immediately after victory before auto-restart", () => {
        let state = createInitialGameState("0.4.0");
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

        const activeRun = getActiveDungeonRun(state.dungeon);
        expect(activeRun).toBeTruthy();
        if (!activeRun) {
            return;
        }
        activeRun.floor = activeRun.floorCount;
        activeRun.enemies = [{
            id: "boss-test",
            name: "Boss",
            hp: 1,
            hpMax: 100,
            damage: 100,
            isBoss: true,
            mechanic: "burst",
            spawnIndex: 0
        }];
        activeRun.targetEnemyId = "boss-test";
        activeRun.party[0].hp = 1;
        activeRun.party[1].hp = 2;
        activeRun.party[2].hp = 3;
        activeRun.party[3].hp = 4;

        const result = applyDungeonTick(state, DUNGEON_BASE_ATTACK_MS, 1_000 + DUNGEON_BASE_ATTACK_MS);
        const pendingRestartRun = getActiveDungeonRun(result.state.dungeon);
        expect(pendingRestartRun?.status).toBe("victory");
        expect(pendingRestartRun?.restartAt).not.toBeNull();
        pendingRestartRun?.party.forEach((member) => {
            expect(member.hp).toBe(member.hpMax);
        });
    });

    it("keeps deterministic outcomes between one big offline tick and split ticks", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 20;
        state.inventory.items.potion = 2;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const largeTickResult = applyDungeonTick(structuredClone(state), 5_000, 6_000);
        let splitTickState = structuredClone(state);
        for (let i = 0; i < 10; i += 1) {
            splitTickState = applyDungeonTick(splitTickState, 500, 1_500 + i * 500).state;
        }

        const largeRun = getActiveDungeonRun(largeTickResult.state.dungeon);
        const splitRun = getActiveDungeonRun(splitTickState.dungeon);
        expect(largeRun?.status).toBe(splitRun?.status);
        expect(largeRun?.floor).toBe(splitRun?.floor);
        expect(largeRun?.party.map((member) => member.hp)).toEqual(splitRun?.party.map((member) => member.hp));
        expect(largeRun?.enemies.map((enemy) => enemy.hp)).toEqual(splitRun?.enemies.map((enemy) => enemy.hp));
        expect(largeTickResult.state.inventory.items.food).toBe(splitTickState.inventory.items.food);
        expect(largeTickResult.state.inventory.items.gold).toBe(splitTickState.inventory.items.gold);
        const partyIds = largeRun?.party.map((member) => member.playerId) ?? [];
        partyIds.forEach((playerId) => {
            expect(largeTickResult.state.players[playerId].skills.CombatMelee.xp)
                .toBe(splitTickState.players[playerId].skills.CombatMelee.xp);
        });
    });

    it("falls back to critical replay events when replay payload exceeds size cap", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        const hugeLabel = "x".repeat(30_000);
        run.events = [
            { atMs: 0, type: "floor_start", label: "Floor 1" },
            ...Array.from({ length: 120 }, (_, index) => ({
                atMs: (index + 1) * 100,
                type: "attack" as const,
                label: hugeLabel,
                sourceId: "1",
                targetId: "mob",
                amount: 1
            })),
            { atMs: 20_000, type: "run_end", label: "stopped" }
        ];

        state = gameReducer(state, { type: "dungeonStopRun" });
        const replay = state.dungeon.latestReplay;
        expect(replay).toBeTruthy();
        expect(replay?.fallbackCriticalOnly).toBe(true);
        expect(replay?.truncated).toBe(true);
        expect(replay?.events.every((event) => (
            event.type === "floor_start"
            || event.type === "boss_start"
            || event.type === "heal"
            || event.type === "death"
            || event.type === "run_end"
        ))).toBe(true);
    });

    it("cancels auto-restart when victory has no food available", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        run.status = "victory";
        run.endReason = "victory";
        run.restartAt = 1_100;
        run.autoRestart = true;
        run.party[0].hp = Math.max(1, Math.floor(run.party[0].hpMax * 0.3));
        state.inventory.items.food = 0;

        const result = applyDungeonTick(state, 100, 1_100);
        expect(result.state.dungeon.activeRunId).toBeNull();
        expect(result.state.players["1"].hp).toBe(result.state.players["1"].hpMax);
        expect(result.state.dungeon.latestReplay?.events.some((event) => (
            event.type === "run_end" && event.label === "Auto-restart canceled"
        ))).toBe(true);
    });

    it("auto-restarts a victorious run when restart conditions are met", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        const beforeRunIndex = run.runIndex;
        const beforeFood = state.inventory.items.food;
        run.status = "victory";
        run.endReason = "victory";
        run.restartAt = 1_100;
        run.autoRestart = true;
        run.events.push({
            atMs: 0,
            type: "attack",
            sourceId: "1",
            targetId: "x",
            amount: 1,
            label: "stale event"
        });
        run.party[0].hp = 1;
        run.party[1].hp = 0;
        run.party[2].hp = 0;
        run.party[3].hp = 0;

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(nextRun?.status).toBe("running");
        expect(nextRun?.runIndex).toBe(beforeRunIndex + 1);
        expect(nextRun?.events.some((event) => event.label === "stale event")).toBe(false);
        expect(nextRun?.events.some((event) => event.type === "floor_start" && event.label === "Floor 1")).toBe(true);
        expect(result.state.inventory.items.food).toBeLessThan(beforeFood);
        expect(nextRun?.party.every((member) => member.hp === member.hpMax)).toBe(true);
    });

    it("applies burst boss damage multiplier on burst cadence", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        run.encounterStep = BURST_STEP_INDEX;
        run.enemies = [{
            id: "boss-burst",
            name: "Burst Boss",
            hp: 10_000,
            hpMax: 10_000,
            damage: 100,
            isBoss: true,
            mechanic: "burst",
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-burst";
        run.targetHeroId = "1";
        run.threatByHeroId = { "1": 100, "2": 0, "3": 0, "4": 0 };
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9_999;
            member.hp = index === 0 ? member.hpMax : 0;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        const hero = nextRun?.party.find((member) => member.playerId === "1");
        expect(hero?.hp).toBe(hero?.hpMax ? hero.hpMax - 61 : undefined);
    });

    it("applies enrage boss damage multiplier when boss is below 30% HP", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        run.encounterStep = BASE_ATTACK_STEP_INDEX;
        run.enemies = [{
            id: "boss-enrage",
            name: "Enrage Boss",
            hp: 300,
            hpMax: 1_000,
            damage: 100,
            isBoss: true,
            mechanic: "enrage",
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-enrage";
        run.targetHeroId = "1";
        run.threatByHeroId = { "1": 100, "2": 0, "3": 0, "4": 0 };
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9_999;
            member.hp = index === 0 ? member.hpMax : 0;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        const hero = nextRun?.party.find((member) => member.playerId === "1");
        expect(hero?.hp).toBe(hero?.hpMax ? hero.hpMax - 56 : undefined);
    });

    it("uses threat tie order when multiple heroes have equal threat", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }

        run.encounterStep = BASE_ATTACK_STEP_INDEX;
        run.enemies = [{
            id: "mob-tie",
            name: "Tie Mob",
            hp: 1_000,
            hpMax: 1_000,
            damage: 10,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-tie";
        run.targetHeroId = null;
        run.threatByHeroId = { "1": 50, "2": 50, "3": 0, "4": 0 };
        run.threatTieOrder = ["2", "1", "3", "4"];
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9_999;
            member.hp = index < 2 ? member.hpMax : 0;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(nextRun?.targetHeroId).toBe("2");
    });

    it("reduces hero damage during the shield mechanic opening window", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.encounterStep = 0;
        run.enemies = [{
            id: "boss-shield",
            name: "Shield Boss",
            hp: 1_000,
            hpMax: 1_000,
            damage: 1,
            isBoss: true,
            mechanic: "shield",
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-shield";
        run.party.forEach((member, index) => {
            member.hp = index === 0 ? member.hpMax : 0;
            member.attackCooldownMs = index === 0 ? 0 : 9_999;
        });

        const shieldResult = applyDungeonTick(structuredClone(state), 100, 1_100);
        const shieldRun = getActiveDungeonRun(shieldResult.state.dungeon);
        const shieldDamage = shieldRun?.events.find((event) => (
            event.type === "damage" && event.sourceId === "1" && event.targetId === "boss-shield"
        ))?.amount ?? 0;

        const baselineState = structuredClone(state);
        const baselineRun = getActiveDungeonRun(baselineState.dungeon);
        if (!baselineRun) {
            return;
        }
        baselineRun.enemies[0].mechanic = null;
        const baselineResult = applyDungeonTick(baselineState, 100, 1_100);
        const baselineNextRun = getActiveDungeonRun(baselineResult.state.dungeon);
        const baselineDamage = baselineNextRun?.events.find((event) => (
            event.type === "damage" && event.sourceId === "1" && event.targetId === "boss-shield"
        ))?.amount ?? 0;

        expect(shieldDamage).toBeGreaterThan(0);
        expect(baselineDamage).toBeGreaterThan(0);
        expect(shieldDamage).toBe(Math.max(1, Math.round(baselineDamage * 0.6)));
    });

    it("caps hero attacks per step and resets cooldown to zero when still negative", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-cap",
            name: "Cap Dummy",
            hp: 10_000,
            hpMax: 10_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-cap";
        run.party.forEach((member, index) => {
            member.hp = index === 0 ? member.hpMax : 0;
            member.attackCooldownMs = index === 0 ? -3_000 : 9_999;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        const attacker = nextRun?.party.find((member) => member.playerId === "1");
        const heroDamageEvents = nextRun?.events.filter((event) => (
            event.type === "damage" && event.sourceId === "1" && event.targetId === "mob-cap"
        )) ?? [];
        expect(heroDamageEvents).toHaveLength(3);
        expect(attacker?.attackCooldownMs).toBe(0);
    });

    it("applies poison tick deaths and clears target when poisoned target dies", () => {
        let state = createInitialGameState("0.4.0");
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.encounterStep = BASE_ATTACK_STEP_INDEX;
        run.enemies = [{
            id: "boss-poison-focus",
            name: "Poison Boss",
            hp: 10_000,
            hpMax: 10_000,
            damage: 0,
            isBoss: true,
            mechanic: "poison",
            spawnIndex: 0
        }];
        run.targetEnemyId = "boss-poison-focus";
        run.targetHeroId = "1";
        run.threatByHeroId = { "1": 100, "2": 0, "3": 0, "4": 0 };
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9_999;
            member.hp = index === 0 ? 2 : member.hpMax;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        const target = nextRun?.party.find((member) => member.playerId === "1");
        expect(target?.hp).toBe(0);
        expect(nextRun?.targetHeroId).toBeNull();
        expect(nextRun?.threatByHeroId["1"]).toBe(0);
        expect(
            nextRun?.events.some((event) => event.type === "death" && event.sourceId === "1")
        ).toBe(true);
    });

    it("does not auto-use potions when auto consumables are disabled", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;
        state.inventory.items.potion = 2;
        state.dungeon.setup.autoConsumables = false;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-no-auto",
            name: "No Auto",
            hp: 10_000,
            hpMax: 10_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-no-auto";
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9_999;
            member.hp = index === 0 ? Math.floor(member.hpMax * 0.4) : member.hpMax;
            member.potionCooldownMs = 0;
        });

        const hpBefore = run.party[0].hp;
        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        expect(result.state.inventory.items.potion).toBe(2);
        expect(nextRun?.party[0].hp).toBe(hpBefore);
        expect(nextRun?.events.some((event) => event.type === "heal")).toBe(false);
    });

    it("fails with out_of_food when trying to initialize the next floor", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 1;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "floor-clear-dummy",
            name: "Floor Dummy",
            hp: 1,
            hpMax: 1,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "floor-clear-dummy";
        run.party.forEach((member) => {
            member.hp = member.hpMax;
            member.attackCooldownMs = 0;
        });

        const cleared = applyDungeonTick(state, 100, 1_100).state;
        const pendingFloorRun = getActiveDungeonRun(cleared.dungeon);
        expect(pendingFloorRun?.floorPauseMs).toBeGreaterThan(0);
        expect(cleared.inventory.items.food).toBe(0);

        const failed = applyDungeonTick(cleared, 800, 1_900).state;
        expect(failed.dungeon.activeRunId).toBeNull();
        expect(failed.dungeon.latestReplay?.endReason).toBe("out_of_food");
        expect(
            failed.dungeon.latestReplay?.events.some((event) => event.type === "run_end" && event.label === "Out of food")
        ).toBe(true);
    });

    it("uses party order as tie-breaker for magic heal target selection", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.players["4"].equipment.slots.Weapon = "apprentice_staff";
        state.inventory.items.food = 20;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-heal-tie",
            name: "Heal Tie Dummy",
            hp: 10_000,
            hpMax: 10_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-heal-tie";
        run.party.forEach((member) => {
            member.attackCooldownMs = 9_999;
            member.hp = member.hpMax;
            member.magicHealCooldownMs = 0;
        });

        const firstTarget = run.party.find((member) => member.playerId === "1");
        const secondTarget = run.party.find((member) => member.playerId === "2");
        if (!firstTarget || !secondTarget) {
            return;
        }
        firstTarget.hp = Math.floor(firstTarget.hpMax * 0.5);
        secondTarget.hp = Math.floor(secondTarget.hpMax * 0.5);
        const firstBefore = firstTarget.hp;
        const secondBefore = secondTarget.hp;

        const result = applyDungeonTick(state, 100, 1_100);
        const nextRun = getActiveDungeonRun(result.state.dungeon);
        const firstAfter = nextRun?.party.find((member) => member.playerId === "1")?.hp ?? 0;
        const secondAfter = nextRun?.party.find((member) => member.playerId === "2")?.hp ?? 0;
        expect(firstAfter).toBeGreaterThan(firstBefore);
        expect(secondAfter).toBe(secondBefore);
    });

    it("returns potion item deltas when auto-consumes a heal", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;
        state.inventory.items.potion = 1;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-delta",
            name: "Delta Mob",
            hp: 10_000,
            hpMax: 10_000,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-delta";
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9_999;
            member.hp = index === 0 ? Math.floor(member.hpMax * 0.4) : member.hpMax;
            member.potionCooldownMs = 0;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        expect(result.itemDeltas.potion).toBe(-1);
        expect(result.itemDeltas.food).toBeUndefined();
    });

    it("returns combat XP deltas per player when clearing a floor", () => {
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

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.enemies = [{
            id: "mob-xp",
            name: "XP Mob",
            hp: 1,
            hpMax: 1,
            damage: 1,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-xp";
        run.party.forEach((member, index) => {
            member.attackCooldownMs = index === 0 ? 0 : 9_999;
            member.hp = member.hpMax;
        });
        run.party.forEach((member) => {
            state.players[member.playerId].skills.CombatMelee.xp = 0;
            state.players[member.playerId].skills.CombatMelee.xpNext = 999_999;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const xpEntry = result.combatXpByPlayer["1"]?.CombatMelee ?? 0;
        expect(xpEntry).toBeGreaterThan(0);
        run.party.forEach((member) => {
            expect(result.combatXpByPlayer[member.playerId]?.CombatMelee).toBe(xpEntry);
            expect(result.state.players[member.playerId].skills.CombatMelee.xp).toBe(xpEntry);
        });
    });

    it("records an action journal entry when a run ends", () => {
        let state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.food = 12;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        const run = getActiveDungeonRun(state.dungeon);
        expect(run).toBeTruthy();
        if (!run) {
            return;
        }
        run.encounterStep = BASE_ATTACK_STEP_INDEX;
        run.enemies = [{
            id: "mob-journal",
            name: "Journal Mob",
            hp: 10_000,
            hpMax: 10_000,
            damage: 1_000,
            isBoss: false,
            mechanic: null,
            spawnIndex: 0
        }];
        run.targetEnemyId = "mob-journal";
        run.targetHeroId = "1";
        run.threatByHeroId = { "1": 100, "2": 0, "3": 0, "4": 0 };
        run.party.forEach((member, index) => {
            member.attackCooldownMs = 9_999;
            member.hp = index === 0 ? 1 : 0;
        });

        const result = applyDungeonTick(state, 100, 1_100);
        const entry = result.state.actionJournal[0];
        expect(entry?.label).toContain("Dungeon ended: Damp Ruins");
        expect(entry?.label).toContain("Wipe");
    });
});
