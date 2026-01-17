import { describe, expect, it } from "vitest";
import { applyTick } from "../../src/core/loop";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState } from "../../src/core/state";

describe("core loop", () => {
    it("increments rewards and xp when an action completes", () => {
        const initial = createInitialGameState("0.3.0");
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

        const before = state.players[playerId];
        const next = applyTick(state, 1000, Date.now());
        const after = next.players[playerId];

        expect(after.storage.gold).toBe(before.storage.gold + 1);
        expect(after.stamina).toBe(before.stamina - 10);
        expect(after.skills.Combat.xp).toBe(before.skills.Combat.xp + 1);
        expect(after.skills.Combat.recipes[recipeId].xp).toBe(
            before.skills.Combat.recipes[recipeId].xp + 2
        );
    });

    it("advances progress percent when action is not complete", () => {
        const initial = createInitialGameState("0.3.0");
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
});
