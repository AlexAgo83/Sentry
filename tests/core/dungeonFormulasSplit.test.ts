import { describe, expect, it } from "vitest";

import {
    applySkillLevelUps,
    foodCostForFloor,
    getFloorCombatXp,
    resolveHeroAttackIntervalMsForWeapon
} from "../../src/core/dungeon/formulas";
import { DUNGEON_BASE_ATTACK_MS } from "../../src/core/dungeon/constants";

describe("dungeon formulas split module", () => {
    it("computes floor food cost with boss extra cost", () => {
        expect(foodCostForFloor(3, 1, 5)).toBe(2);
        expect(foodCostForFloor(3, 5, 5)).toBe(3);
    });

    it("applies ranged attack interval multiplier", () => {
        const melee = resolveHeroAttackIntervalMsForWeapon(DUNGEON_BASE_ATTACK_MS, 0, "Melee");
        const ranged = resolveHeroAttackIntervalMsForWeapon(DUNGEON_BASE_ATTACK_MS, 0, "Ranged");
        expect(ranged).toBeLessThan(melee);
    });

    it("computes floor combat xp from tier and floor", () => {
        expect(getFloorCombatXp(1, 1)).toBe(10);
        expect(getFloorCombatXp(4, 3)).toBe(21);
    });

    it("levels up skill xp with provided multiplier", () => {
        const leveled = applySkillLevelUps(120, 1, 50, 99, 1.5);
        expect(leveled.level).toBe(2);
        expect(leveled.xp).toBe(70);
        expect(leveled.xpNext).toBe(75);
    });
});
