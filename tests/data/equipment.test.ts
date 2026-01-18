import { describe, expect, it } from "vitest";
import { createPlayerEquipmentState } from "../../src/core/equipment";
import { getEquipmentModifiers, resolveWeaponSlotLabel } from "../../src/data/equipment";

describe("equipment helpers", () => {
    it("labels the weapon slot when no weapon type is provided", () => {
        expect(resolveWeaponSlotLabel()).toBe("Weapon");
    });

    it("labels the weapon slot when a weapon type is provided", () => {
        expect(resolveWeaponSlotLabel("Melee")).toBe("Melee Weapon");
    });

    it("builds stable modifier ids and sources for equipped items", () => {
        const equipment = createPlayerEquipmentState();
        equipment.slots.Weapon = "rusty_blade";
        equipment.slots.Head = "cloth_cap";

        const modifiers = getEquipmentModifiers(equipment);
        const ids = modifiers.map((mod) => mod.id);
        const sources = modifiers.map((mod) => mod.source);

        expect(ids).toContain("rusty_blade:Strength:0");
        expect(ids).toContain("cloth_cap:Intellect:0");
        expect(sources).toContain("Rusty Blade");
        expect(sources).toContain("Cloth Cap");
    });
});
