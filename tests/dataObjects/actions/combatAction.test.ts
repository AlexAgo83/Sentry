import { describe, expect, it } from "vitest";
import { applyTick } from "../../../src/core/loop";
import { gameReducer } from "../../../src/core/reducer";
import { createInitialGameState } from "../../../src/core/state";
import {
    DEFAULT_STAT_BASE,
    DEFAULT_STAMINA_MAX,
    DEFAULT_STAMINA_REGEN,
    STAT_PERCENT_PER_POINT
} from "../../../src/core/constants";

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
        const regenRate = DEFAULT_STAMINA_REGEN * (1 + DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT);
        const regenAmount = Math.floor((1000 / 1000) * regenRate);
        const staminaMax = Math.ceil(DEFAULT_STAMINA_MAX * (1 + DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT));
        const staminaCost = Math.ceil(10 * (1 - DEFAULT_STAT_BASE * STAT_PERCENT_PER_POINT));
        const expectedStamina = Math.min(staminaMax, before.stamina + regenAmount) - staminaCost;
        expect(after.stamina).toBe(expectedStamina);
        expect(after.skills.Combat.xp).toBe(before.skills.Combat.xp + 1);
        expect(after.skills.Combat.recipes[recipeId].xp).toBe(
            before.skills.Combat.recipes[recipeId].xp + 2
        );
    });
});
