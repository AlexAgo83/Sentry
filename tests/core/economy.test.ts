import { describe, expect, it } from "vitest";
import { getRosterSlotCost, getSellGoldGain, getSellValuePerItem } from "../../src/core/economy";

describe("economy", () => {
    it("returns zero sell value for gold", () => {
        expect(getSellValuePerItem("gold")).toBe(0);
        expect(getSellGoldGain("gold", 10)).toBe(0);
    });

    it("returns a sensible default sell value for unknown items", () => {
        expect(getSellValuePerItem("unknown_item" as any)).toBe(1);
        expect(getSellGoldGain("unknown_item" as any, 3)).toBe(3);
    });

    it("computes equipment sell value deterministically", () => {
        const clothCapValue = getSellValuePerItem("cloth_cap");
        const bladeValue = getSellValuePerItem("rusty_blade");
        expect(clothCapValue).toBeGreaterThan(0);
        expect(bladeValue).toBeGreaterThan(clothCapValue);
    });

    it("scales roster slot costs exponentially from a higher base", () => {
        expect(getRosterSlotCost(1)).toBe(10000);
        expect(getRosterSlotCost(2)).toBe(50000);
        expect(getRosterSlotCost(3)).toBe(250000);
        expect(getRosterSlotCost(4)).toBe(1250000);
        expect(getRosterSlotCost(5)).toBe(6250000);
    });
});
