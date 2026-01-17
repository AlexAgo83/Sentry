import { describe, expect, it } from "vitest";
import { applyTick } from "../../../src/core/loop";
import { gameReducer } from "../../../src/core/reducer";
import { createInitialGameState } from "../../../src/core/state";

describe("CombatAction", () => {
    it("awards gold, xp, and drains stamina on completion", () => {
        const initial = createInitialGameState("0.4.0");
        const playerId = initial.activePlayerId ?? "1";
        initial.inventory.items.food = 1;
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

        expect(next.inventory.items.gold).toBe(initial.inventory.items.gold + 1);
        expect(next.inventory.items.bones).toBe(1);
        expect(next.inventory.items.food).toBe(0);
        expect(after.stamina).toBe(before.stamina - 10);
        expect(after.skills.Combat.xp).toBe(before.skills.Combat.xp + 1);
        expect(after.skills.Combat.recipes[recipeId].xp).toBe(
            before.skills.Combat.recipes[recipeId].xp + 2
        );
    });
});
