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

    it("keeps early slots affordable and then scales roster slot costs exponentially", () => {
        expect(getRosterSlotCost(1)).toBe(10000);
        expect(getRosterSlotCost(2)).toBe(10000);
        expect(getRosterSlotCost(3)).toBe(10000);
        expect(getRosterSlotCost(4)).toBe(10000);
        expect(getRosterSlotCost(5)).toBe(25000);
        expect(getRosterSlotCost(6)).toBe(62500);
    });
});
