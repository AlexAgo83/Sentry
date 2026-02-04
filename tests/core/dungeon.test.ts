import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import { getActiveDungeonRun, applyDungeonTick } from "../../src/core/dungeon";
import { gameReducer } from "../../src/core/reducer";

describe("dungeon flow", () => {
    it("enables dungeon onboarding when starting without a seeded hero", () => {
        const state = createInitialGameState("0.4.0", { seedHero: false });
        expect(state.dungeon.onboardingRequired).toBe(true);
        expect(state.rosterLimit).toBeGreaterThanOrEqual(4);
    });

    it("starts a run with 4 heroes and consumes floor meat", () => {
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
            selectedActionId: "Combat"
        };
        state.inventory.items.meat = 12;

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
        expect(state.inventory.items.meat).toBe(11);
        expect(state.players["1"].selectedActionId).toBeNull();
    });

    it("does not start a run when there is not enough meat", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.meat = 0;

        state = gameReducer(state, {
            type: "dungeonStartRun",
            dungeonId: "dungeon_ruines_humides",
            playerIds: ["1", "2", "3", "4"],
            timestamp: 1_000
        });

        expect(state.dungeon.activeRunId).toBeNull();
    });

    it("auto-uses healing potions under 50% hp", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.meat = 12;
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
        state.inventory.items.meat = 12;
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
        state.inventory.items.meat = 12;
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

    it("restores heroes to full HP when a run ends in failure", () => {
        let state = createInitialGameState("0.4.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        state.inventory.items.meat = 12;

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
        state.inventory.items.meat = 20;

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
});
