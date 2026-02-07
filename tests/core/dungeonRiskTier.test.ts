import { describe, expect, it } from "vitest";
import { resolveDungeonRiskTier } from "../../src/core/dungeon";

describe("resolveDungeonRiskTier", () => {
    it("maps ratios to tiers", () => {
        const recommended = 1000;
        expect(resolveDungeonRiskTier(1200, recommended)).toBe("Low");
        expect(resolveDungeonRiskTier(1199, recommended)).toBe("Medium");
        expect(resolveDungeonRiskTier(900, recommended)).toBe("Medium");
        expect(resolveDungeonRiskTier(899, recommended)).toBe("High");
        expect(resolveDungeonRiskTier(700, recommended)).toBe("High");
        expect(resolveDungeonRiskTier(699, recommended)).toBe("Deadly");
    });

    it("handles missing recommended power", () => {
        expect(resolveDungeonRiskTier(0, 0)).toBe("Medium");
    });
});
