import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../../src/core/state";
import {
    selectActivePlayer,
    selectActivePlayerFromPlayers,
    selectDriftLabel,
    selectPlayersSorted,
    selectPlayersSortedFromPlayers,
    selectHeroVirtualScore,
    selectTickRateLabel,
    selectVirtualScore
} from "../../../src/app/selectors/gameSelectors";

describe("app gameSelectors", () => {
    it("selectActivePlayer returns the active player", () => {
        const state = createInitialGameState("test");
        const player2 = createPlayerState("2");
        state.players[player2.id] = player2;
        state.activePlayerId = "2";

        expect(selectActivePlayer(state)?.id).toBe("2");
        expect(selectActivePlayerFromPlayers(state.players, state.activePlayerId)?.id).toBe("2");
    });

    it("selectPlayersSorted sorts numerically by id", () => {
        const state = createInitialGameState("test");
        state.players = {
            "10": createPlayerState("10"),
            "2": createPlayerState("2"),
            "1": createPlayerState("1"),
        };

        expect(selectPlayersSorted(state).map((p) => p.id)).toEqual(["1", "2", "10"]);
        expect(selectPlayersSortedFromPlayers(state.players).map((p) => p.id)).toEqual(["1", "2", "10"]);
    });

    it("selectTickRateLabel and selectDriftLabel format values", () => {
        const state = createInitialGameState("test");
        state.loop.loopInterval = 500;
        state.perf.lastDeltaMs = 610;
        state.perf.lastDriftMs = 110;
        state.perf.driftEmaMs = 110;

        expect(selectTickRateLabel(state)).toBe("2.0");
        expect(selectDriftLabel(state)).toBe("+110");

        state.perf.lastDeltaMs = 400;
        state.perf.lastDriftMs = -100;
        state.perf.driftEmaMs = -100;
        expect(selectDriftLabel(state)).toBe("-100");
    });

    it("selectVirtualScore combines skill progress, recipes, and quest completion", () => {
        const state = createInitialGameState("test");
        const player2 = createPlayerState("2");
        state.players[player2.id] = player2;
        const baseCombat1 = state.players["1"].skills.Combat;
        const baseCooking1 = state.players["1"].skills.Cooking;
        const baseCombat2 = state.players["2"].skills.Combat;
        const baseScore = (() => {
            const questCount = Object.values(state.quests.completed).filter(Boolean).length;
            const questScore = questCount * 5;
            const skillScore = Object.values(state.players).reduce((total, player) => {
                return total + Object.values(player.skills).reduce((sum, skill) => {
                    const xpNext = Number.isFinite(skill.xpNext) && skill.xpNext > 0 ? skill.xpNext : 0;
                    const xpProgress = xpNext > 0 ? Math.min(1, Math.max(0, skill.xp / xpNext)) : 0;
                    const recipeScore = Object.values(skill.recipes).reduce((recipeSum, recipe) => {
                        return recipeSum + recipe.level * 0.25;
                    }, 0);
                    return sum + skill.level + xpProgress + recipeScore;
                }, 0);
            }, 0);
            return skillScore + questScore;
        })();

        state.players["1"].skills.Combat.level = baseCombat1.level + 2;
        state.players["1"].skills.Combat.xp = 50;
        state.players["1"].skills.Combat.xpNext = 100;
        state.players["1"].skills.Cooking.level = baseCooking1.level + 1;
        const cookingRecipeId = Object.keys(state.players["1"].skills.Cooking.recipes)[0];
        state.players["1"].skills.Cooking.recipes[cookingRecipeId].level += 3;

        state.players["2"].skills.Combat.level = baseCombat2.level + 4;
        state.players["2"].skills.Combat.xp = 10;
        state.players["2"].skills.Combat.xpNext = 10;

        state.quests.completed["quest-alpha"] = true;
        state.quests.completed["quest-beta"] = true;

        const questScore = 2 * 5;
        const combat1Delta = 2 + 0.5;
        const cookingDelta = 1 + 3 * 0.25;
        const combat2Delta = 4 + 1;

        const expected = Math.round(baseScore + combat1Delta + cookingDelta + combat2Delta + questScore);

        expect(selectVirtualScore(state)).toBe(expected);
    });

    it("selectHeroVirtualScore uses only the active hero skills", () => {
        const state = createInitialGameState("test");
        const player2 = createPlayerState("2");
        state.players[player2.id] = player2;
        state.activePlayerId = "1";

        state.players["1"].skills.Combat.level += 2;
        state.players["1"].skills.Combat.xp = 25;
        state.players["1"].skills.Combat.xpNext = 100;
        const cookingRecipeId = Object.keys(state.players["1"].skills.Cooking.recipes)[0];
        state.players["1"].skills.Cooking.recipes[cookingRecipeId].level += 4;

        state.players["2"].skills.Combat.level += 5;
        state.players["2"].skills.Combat.xp = 100;
        state.players["2"].skills.Combat.xpNext = 100;

        state.quests.completed["quest-alpha"] = true;

        const expected = (() => {
            return Object.values(state.players["1"].skills).reduce((sum, skill) => {
                const xpNext = Number.isFinite(skill.xpNext) && skill.xpNext > 0 ? skill.xpNext : 0;
                const xpProgress = xpNext > 0 ? Math.min(1, Math.max(0, skill.xp / xpNext)) : 0;
                const recipeScore = Object.values(skill.recipes).reduce((recipeSum, recipe) => {
                    return recipeSum + recipe.level * 0.25;
                }, 0);
                return sum + skill.level + xpProgress + recipeScore;
            }, 0);
        })();

        expect(selectHeroVirtualScore(state)).toBe(Math.round(expected));
    });
});
