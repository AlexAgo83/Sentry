import { describe, expect, it } from "vitest";
import { getRecipeDefinition } from "../../src/data/definitions";

describe("crafting recipes", () => {
    it("provides crafting recipes for cape/ring/amulet equipment", () => {
        const cape = getRecipeDefinition("Tailoring", "tailoring_traveler_cape");
        expect(cape?.itemRewards?.traveler_cape).toBe(1);

        const ring = getRecipeDefinition("MetalWork", "metalwork_signet_ring");
        expect(ring?.itemRewards?.signet_ring).toBe(1);

        const amulet = getRecipeDefinition("MetalWork", "metalwork_warding_amulet");
        expect(amulet?.itemRewards?.warding_amulet).toBe(1);
    });
});

