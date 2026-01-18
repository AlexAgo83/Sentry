import { describe, expect, it } from "vitest";
import { ITEM_USAGE_MAP } from "../../src/app/ui/itemUsage";

describe("item usage map", () => {
    it("has no duplicate labels per item", () => {
        Object.values(ITEM_USAGE_MAP).forEach((usage) => {
            const usedBySet = new Set(usage.usedBy);
            const obtainedBySet = new Set(usage.obtainedBy);
            expect(usedBySet.size).toBe(usage.usedBy.length);
            expect(obtainedBySet.size).toBe(usage.obtainedBy.length);
        });
    });

    it("includes gold rewards from actions or recipes", () => {
        const goldUsage = ITEM_USAGE_MAP.gold;
        expect(goldUsage).toBeTruthy();
        expect(
            goldUsage.obtainedBy.some((label) => label.toLowerCase().includes("action"))
                || goldUsage.obtainedBy.some((label) => label.toLowerCase().includes("recipe"))
        ).toBe(true);
    });
});
