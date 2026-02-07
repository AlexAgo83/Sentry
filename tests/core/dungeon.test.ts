import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import {
    applyDungeonTick,
    getActiveDungeonRun,
    getActiveDungeonRunIds,
    getActiveDungeonRuns,
    isPlayerAssignedToActiveDungeonRun
} from "../../src/core/dungeon";
import { gameReducer } from "../../src/core/reducer";

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

        const result = applyDungeonTick(state, 500, 1_500);
        const expectedFloorXp = 6 + (1 * 3) + run.floorCount;
        const expectedTotalXp = expectedFloorXp + (expectedFloorXp * 2);

        partyIds.forEach((playerId) => {
            expect(result.state.players[playerId].skills.CombatMelee.xp).toBe(expectedTotalXp);
        });
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

        const result = applyDungeonTick(state, 500, 1_500);
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

        const result = applyDungeonTick(state, 500, 1_500);
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

        const result = applyDungeonTick(state, 500, 1_500);
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

        const result = applyDungeonTick(state, 500, 1_500);
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
});
