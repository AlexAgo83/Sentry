import { describe, expect, it, vi } from "vitest";

describe("item usage map (mocked branches)", () => {
    it("covers optional reward/cost branches and ignores unknown items", async () => {
        vi.resetModules();

        const mockFactory = () => {
            const ITEM_DEFINITIONS = [
                { id: "gold", name: "Gold" },
                { id: "apple", name: "Apple" },
                { id: "wood", name: "Wood" }
            ];
            const SKILL_DEFINITIONS = [
                { id: "Combat", name: "Combat", baseInterval: 1000 },
                { id: "Hunting", name: "Combat", baseInterval: 1000 }
            ];
            const getActionDefinition = (skillId: string) => ({
                id: skillId,
                skillId,
                staminaCost: 0,
                goldReward: 1,
                xpSkill: 1,
                xpRecipe: 1,
                stunTime: 0,
                itemCosts: { apple: 1 },
                itemRewards: { wood: 1, missing_item: 1 },
                rareRewards: { wood: 1 }
            });
            const getRecipesForSkill = (skillId: string) => ([
                {
                    id: "r1",
                    skillId,
                    name: "Craft",
                    itemCosts: { wood: 1 },
                    itemRewards: { apple: 1 },
                    rareRewards: { apple: 1 },
                    goldReward: 2
                },
                {
                    id: "r2",
                    skillId,
                    name: "Craft",
                    itemCosts: { wood: 1 },
                    itemRewards: { apple: 1 }
                }
            ]);

            return { ITEM_DEFINITIONS, SKILL_DEFINITIONS, getActionDefinition, getRecipesForSkill };
        };

        vi.doMock("../../src/data/definitions", mockFactory);
        vi.doMock("../../src/data/definitions.ts", mockFactory);

        const { ITEM_USAGE_MAP } = await import("../../src/app/ui/itemUsage");

        expect(ITEM_USAGE_MAP.apple.usedBy).toContain("Action: Combat");
        expect(ITEM_USAGE_MAP.apple.obtainedBy.some((label) => label.includes("Craft"))).toBe(true);
        expect(ITEM_USAGE_MAP.gold.obtainedBy.some((label) => label.includes("Action"))).toBe(true);
        expect(ITEM_USAGE_MAP.gold.obtainedBy.some((label) => label.includes("Craft"))).toBe(true);
        expect(ITEM_USAGE_MAP.missing_item).toBeUndefined();

        const appleUsedBySet = new Set(ITEM_USAGE_MAP.apple.usedBy);
        expect(appleUsedBySet.size).toBe(ITEM_USAGE_MAP.apple.usedBy.length);

        vi.unmock("../../src/data/definitions");
        vi.unmock("../../src/data/definitions.ts");
    });
});
