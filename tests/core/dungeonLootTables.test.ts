import { describe, expect, it } from "vitest";
import { SKILL_DEFINITIONS, getRecipesForSkill } from "../../src/data/definitions";
import { validateDungeonLootTable } from "../../src/core/dungeon/loot";
import { DUNGEON_DEFINITIONS } from "../../src/data/dungeons";
import {
    DUNGEON_EXCLUSIVE_EQUIPMENT_IDS,
    getEquipmentDefinition,
    isDungeonExclusiveEquipmentItem
} from "../../src/data/equipment";
import { ITEM_DEFINITIONS } from "../../src/data/definitions/items";

const ITEM_ID_SET = new Set(ITEM_DEFINITIONS.map((item) => item.id));
const DUNGEON_EXCLUSIVE_ITEM_ID_SET = new Set(DUNGEON_EXCLUSIVE_EQUIPMENT_IDS);

const getEquipmentPowerScore = (itemId: string): number => {
    const definition = getEquipmentDefinition(itemId);
    if (!definition) {
        return 0;
    }
    return definition.modifiers.reduce((sum, modifier) => sum + Math.max(0, modifier.value), 0);
};

describe("dungeon loot tables", () => {
    it("rejects invalid loot table payloads", () => {
        expect(() => validateDungeonLootTable({
            id: "broken",
            lootTable: {
                rewardsPerClear: 1,
                entries: []
            }
        }, ITEM_ID_SET)).toThrow();

        expect(() => validateDungeonLootTable({
            id: "broken",
            lootTable: {
                rewardsPerClear: 1,
                entries: [{ itemId: "unknown_item", weight: 0, quantityMin: 0, quantityMax: 0 }]
            }
        }, ITEM_ID_SET)).toThrow();
    });

    it("defines a non-empty, valid weighted table for every dungeon", () => {
        DUNGEON_DEFINITIONS.forEach((definition) => {
            expect(definition.lootTable.rewardsPerClear).toBe(1);
            expect(definition.lootTable.entries.length).toBeGreaterThan(0);
            definition.lootTable.entries.forEach((entry) => {
                expect(ITEM_ID_SET.has(entry.itemId)).toBe(true);
                expect(entry.weight).toBeGreaterThan(0);
                expect(entry.quantityMin).toBeGreaterThan(0);
                expect(entry.quantityMax).toBeGreaterThanOrEqual(entry.quantityMin);
            });
        });
    });

    it("mixes common and exclusive rewards per dungeon and keeps rare exclusives ring/amulet-only", () => {
        DUNGEON_DEFINITIONS.forEach((definition) => {
            const exclusiveEntries = definition.lootTable.entries.filter((entry) => isDungeonExclusiveEquipmentItem(entry.itemId));
            const sharedEntries = definition.lootTable.entries.filter((entry) => !isDungeonExclusiveEquipmentItem(entry.itemId));
            expect(exclusiveEntries.length).toBeGreaterThan(0);
            expect(sharedEntries.length).toBeGreaterThan(0);
            exclusiveEntries.forEach((entry) => {
                const item = getEquipmentDefinition(entry.itemId);
                expect(item?.rarityTier).toBe("rare");
                expect(item?.acquisitionSource).toBe("dungeon");
                expect(item?.slot === "Ring" || item?.slot === "Amulet").toBe(true);
            });
        });
    });

    it("ensures dungeon-exclusive items cannot be obtained from non-dungeon recipe rewards", () => {
        SKILL_DEFINITIONS.forEach((skill) => {
            getRecipesForSkill(skill.id).forEach((recipe) => {
                Object.keys(recipe.itemRewards ?? {}).forEach((itemId) => {
                    expect(DUNGEON_EXCLUSIVE_ITEM_ID_SET.has(itemId)).toBe(false);
                });
                Object.keys(recipe.rareRewards ?? {}).forEach((itemId) => {
                    expect(DUNGEON_EXCLUSIVE_ITEM_ID_SET.has(itemId)).toBe(false);
                });
            });
        });
    });

    it("scales exclusive item power with dungeon tier", () => {
        const sortedDefinitions = DUNGEON_DEFINITIONS.slice().sort((a, b) => a.tier - b.tier);
        let previousPower = 0;
        sortedDefinitions.forEach((definition) => {
            const highestExclusivePower = definition.lootTable.entries
                .filter((entry) => isDungeonExclusiveEquipmentItem(entry.itemId))
                .reduce((max, entry) => Math.max(max, getEquipmentPowerScore(entry.itemId)), 0);
            expect(highestExclusivePower).toBeGreaterThan(previousPower);
            previousPower = highestExclusivePower;
        });
    });
});
