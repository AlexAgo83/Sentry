import { describe, expect, it } from "vitest";
import { applyTick } from "../../src/core/loop";
import {
    DEFAULT_STAT_BASE,
    DEFAULT_STAMINA_MAX,
    DEFAULT_STAMINA_REGEN,
    MIN_ACTION_INTERVAL_MS,
    STAT_PERCENT_PER_POINT
} from "../../src/core/constants";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";
import { getRecipesForSkill } from "../../src/data/definitions";

describe("core loop", () => {
    it("increments rewards and xp when an action completes", () => {
        const initial = createInitialGameState("0.3.1");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Combat"
        });
        const recipeId = Object.keys(state.players[playerId].skills.Combat.recipes)[0];
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Combat",
            recipeId
        });
        state = {
            ...state,
            inventory: {
                ...state.inventory,
                items: {
                    ...state.inventory.items,
                    food: 1
                }
            }
        };

        const before = state.players[playerId];
        const baseInterval = Math.ceil(
            before.skills.Combat.baseInterval * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT)
        );
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        const next = applyTick(state, actionInterval, Date.now());
        const after = next.players[playerId];

        expect(next.inventory.items.gold).toBe(initial.inventory.items.gold + 1);
        const regenRate = DEFAULT_STAMINA_REGEN * (1 + DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT);
        const regenAmount = Math.floor((actionInterval / 1000) * regenRate);
        const staminaMax = Math.ceil(DEFAULT_STAMINA_MAX * (1 + DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT));
        const staminaCost = Math.ceil(10 * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT));
        const expectedStamina = Math.min(staminaMax, before.stamina + regenAmount) - staminaCost;
        expect(after.stamina).toBe(expectedStamina);
        expect(after.skills.Combat.xp).toBe(before.skills.Combat.xp + 1);
        expect(after.skills.Combat.recipes[recipeId].xp).toBe(
            before.skills.Combat.recipes[recipeId].xp + 2
        );
    });

    it("advances progress percent when action is not complete", () => {
        const initial = createInitialGameState("0.3.1");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Hunting"
        });
        const recipeId = Object.keys(state.players[playerId].skills.Hunting.recipes)[0];
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Hunting",
            recipeId
        });

        const next = applyTick(state, 250, Date.now());
        const baseInterval = Math.ceil(
            next.players[playerId].skills.Hunting.baseInterval * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT)
        );
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        const expectedProgress = (250 / actionInterval) * 100;
        expect(next.players[playerId].actionProgress.progressPercent).toBeCloseTo(expectedProgress, 2);
    });

    it("adds hunting items to the global inventory", () => {
        const initial = createInitialGameState("0.3.1");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Hunting"
        });
        const recipeId = Object.keys(state.players[playerId].skills.Hunting.recipes)[0];
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Hunting",
            recipeId
        });

        const baseInterval = Math.ceil(
            state.players[playerId].skills.Hunting.baseInterval * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT)
        );
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        const next = applyTick(state, actionInterval, Date.now());
        expect(next.inventory.items.meat).toBe(1);
        expect(next.inventory.items.bones).toBe(1);
        expect(next.inventory.items.gold).toBe(initial.inventory.items.gold);
    });

    it("stops cooking when required items are missing", () => {
        const initial = createInitialGameState("0.3.1");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Cooking"
        });
        const recipeId = Object.keys(state.players[playerId].skills.Cooking.recipes)[0];
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Cooking",
            recipeId
        });

        const baseInterval = Math.ceil(
            state.players[playerId].skills.Cooking.baseInterval * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT)
        );
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        const next = applyTick(state, actionInterval, Date.now());
        expect(next.players[playerId].selectedActionId).toBe(null);
        expect(next.inventory.items.meat ?? 0).toBe(0);
        expect(next.inventory.items.food ?? 0).toBe(0);
    });

    it("adds herbalism items to the global inventory", () => {
        const initial = createInitialGameState("0.4.0");
        const playerId = initial.activePlayerId ?? "1";
        let state = gameReducer(initial, {
            type: "selectAction",
            playerId,
            actionId: "Herbalism"
        });
        const recipeId = getRecipesForSkill("Herbalism")[0]?.id ?? "";
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId,
            skillId: "Herbalism",
            recipeId
        });

        const baseInterval = Math.ceil(
            state.players[playerId].skills.Herbalism.baseInterval * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT)
        );
        const actionInterval = Math.max(MIN_ACTION_INTERVAL_MS, baseInterval);
        const next = applyTick(state, actionInterval, Date.now());
        expect(next.inventory.items.herbs).toBe(1);
    });
});
