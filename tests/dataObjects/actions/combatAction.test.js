import { suite, test, expect } from "vitest";
import { PlayerEntity } from "../../../src/dataObjects/entities/playerEntity.js";
import { CombatAction } from "../../../src/dataObjects/actions/combatAction.js";

suite("CombatAction", () => {
    test("awards gold, xp, and drains stamina on completion", () => {
        const player = new PlayerEntity(1);
        const skill = player.getSkillByID("Combat");
        const recipe = skill.getRecipeByID("monster001");
        skill.setSelectedRecipe(recipe);

        const action = new CombatAction(player);
        player.setSelectedAction(action);

        const interval = action.actionInterval(player);
        action.doAction(player, interval);

        expect(player.storage.gold).toBe(151);
        expect(skill.xp).toBe(1);
        expect(recipe.xp).toBe(2);
        expect(player.stamina).toBe(90);
    });
});
