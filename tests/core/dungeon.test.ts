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
        expect(state.inventory.items.meat).toBe(11);
        expect(state.players["1"].selectedActionId).toBeNull();
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
});
