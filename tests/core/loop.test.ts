import { describe, expect, it } from "vitest";
import { applyTick } from "../../src/core/loop";
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
        const next = applyTick(state, 1000, Date.now());
        const after = next.players[playerId];

        expect(next.inventory.items.gold).toBe(initial.inventory.items.gold + 1);
        expect(after.stamina).toBe(before.stamina - 10);
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
        expect(next.players[playerId].actionProgress.progressPercent).toBeCloseTo(25, 2);
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

        const next = applyTick(state, 1000, Date.now());
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

        const next = applyTick(state, 1000, Date.now());
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

        const next = applyTick(state, 1000, Date.now());
        expect(next.inventory.items.herbs).toBe(1);
    });
});
