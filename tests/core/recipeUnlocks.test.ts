import { describe, expect, it } from "vitest";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";
import { getRecipesForSkill } from "../../src/data/definitions";

describe("recipe unlocks", () => {
    it("blocks selecting locked recipes", () => {
        const initial = createInitialGameState("0.4.0");
        const playerId = initial.activePlayerId ?? "1";
        const skillId = "Hunting";
        const lockedRecipe = getRecipesForSkill(skillId).find((recipe) => (recipe.unlockLevel ?? 1) > 1);
        expect(lockedRecipe).toBeTruthy();
        if (!lockedRecipe) {
            return;
        }

        const next = gameReducer(initial, {
            type: "selectRecipe",
            playerId,
            skillId,
            recipeId: lockedRecipe.id
        });

        expect(next.players[playerId].skills[skillId].selectedRecipeId).toBe(null);
    });

    it("allows selecting unlocked recipes", () => {
        const initial = createInitialGameState("0.4.0");
        const playerId = initial.activePlayerId ?? "1";
        const skillId = "Hunting";
        const unlockedRecipe = getRecipesForSkill(skillId)[0];
        expect(unlockedRecipe).toBeTruthy();
        if (!unlockedRecipe) {
            return;
        }

        const next = gameReducer(initial, {
            type: "selectRecipe",
            playerId,
            skillId,
            recipeId: unlockedRecipe.id
        });

        expect(next.players[playerId].skills[skillId].selectedRecipeId).toBe(unlockedRecipe.id);
    });
});
