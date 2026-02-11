import { describe, expect, it } from "vitest";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";

describe("gameReducer action journal logging", () => {
    it("logs action changes with selected recipe details when available", () => {
        let state = createInitialGameState("test");

        state = gameReducer(state, {
            type: "selectRecipe",
            playerId: "1",
            skillId: "Hunting",
            recipeId: "hunt_small_game",
        });
        state = gameReducer(state, {
            type: "selectAction",
            playerId: "1",
            actionId: "Hunting",
        });

        expect(state.actionJournal[0]?.label).toBe("Action: Player_1 -> Hunting / Woodland Critters");
        expect(state.lastNonDungeonActionByPlayer["1"]).toEqual({
            skillId: "Hunting",
            recipeId: "hunt_small_game",
        });
    });

    it("logs recipe changes and does not duplicate when selecting the same recipe", () => {
        let state = createInitialGameState("test");

        state = gameReducer(state, {
            type: "selectRecipe",
            playerId: "1",
            skillId: "Hunting",
            recipeId: "hunt_large_game",
        });
        expect(state.actionJournal).toHaveLength(1);
        expect(state.actionJournal[0]?.label).toBe("Recipe: Player_1 -> Hunting / Dire Quarry");

        const unchanged = gameReducer(state, {
            type: "selectRecipe",
            playerId: "1",
            skillId: "Hunting",
            recipeId: "hunt_large_game",
        });
        expect(unchanged.actionJournal).toHaveLength(1);
        expect(unchanged.actionJournal[0]?.label).toBe("Recipe: Player_1 -> Hunting / Dire Quarry");
    });

    it("updates last non-dungeon action when recipe changes on the active skill", () => {
        let state = createInitialGameState("test");

        state = gameReducer(state, {
            type: "selectAction",
            playerId: "1",
            actionId: "Hunting",
        });
        state = gameReducer(state, {
            type: "selectRecipe",
            playerId: "1",
            skillId: "Hunting",
            recipeId: "hunt_large_game",
        });

        expect(state.lastNonDungeonActionByPlayer["1"]).toEqual({
            skillId: "Hunting",
            recipeId: "hunt_large_game",
        });
        expect(state.actionJournal[0]?.label).toBe("Recipe: Player_1 -> Hunting / Dire Quarry");
    });
});
