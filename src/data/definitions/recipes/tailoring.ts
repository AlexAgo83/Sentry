import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const tailoringRecipes: RecipeDefinition[] = [
    {
        id: "tailoring_spin_thread",
        skillId: "Tailoring",
        name: "Spin Thread",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ cloth: 1 })
    },
    {
        id: "tailoring_weave_bolts",
        skillId: "Tailoring",
        name: "Weave Bolts",
        unlockLevel: unlockTier(10),
        itemRewards: withRewards({ cloth: 2 })
    },
    {
        id: "tailoring_fine_weave",
        skillId: "Tailoring",
        name: "Fine Weave",
        unlockLevel: unlockTier(20),
        itemRewards: withRewards({ cloth: 3 })
    },
    {
        id: "tailoring_heroic_bolts",
        skillId: "Tailoring",
        name: "Heroic Bolts",
        unlockLevel: unlockTier(30),
        itemRewards: withRewards({ cloth: 4 })
    },
    {
        id: "tailoring_cloth_cap",
        skillId: "Tailoring",
        name: "Cloth Cap",
        unlockLevel: unlockTier(1),
        itemCosts: { cloth: 2, leather: 1 },
        itemRewards: withRewards({ cloth_cap: 1 })
    },
    {
        id: "tailoring_linen_tunic",
        skillId: "Tailoring",
        name: "Linen Tunic",
        unlockLevel: unlockTier(1),
        itemCosts: { cloth: 4, leather: 1 },
        itemRewards: withRewards({ linen_tunic: 1 })
    },
    {
        id: "tailoring_worn_trousers",
        skillId: "Tailoring",
        name: "Worn Trousers",
        unlockLevel: unlockTier(1),
        itemCosts: { cloth: 3 },
        itemRewards: withRewards({ worn_trousers: 1 })
    },
    {
        id: "tailoring_traveler_cape",
        skillId: "Tailoring",
        name: "Traveler Cape",
        unlockLevel: unlockTier(10),
        itemCosts: { cloth: 5, leather: 2 },
        itemRewards: withRewards({ traveler_cape: 1 })
    },
    {
        id: "tailoring_silk_cloak",
        skillId: "Tailoring",
        name: "Silk Cloak",
        unlockLevel: unlockTier(20),
        itemCosts: { cloth: 6, leather: 2 },
        itemRewards: withRewards({ silk_cloak: 1 })
    },
    {
        id: "tailoring_silkweave_gloves",
        skillId: "Tailoring",
        name: "Silkweave Gloves",
        unlockLevel: unlockTier(10),
        itemCosts: { cloth: 4, leather: 1 },
        itemRewards: withRewards({ silkweave_gloves: 1 })
    },
    {
        id: "tailoring_weaver_boots",
        skillId: "Tailoring",
        name: "Weaver Boots",
        unlockLevel: unlockTier(10),
        itemCosts: { cloth: 4, leather: 2 },
        itemRewards: withRewards({ weaver_boots: 1 })
    },
    {
        id: "tailoring_basic_garment",
        skillId: "Tailoring",
        name: "Basic Garment",
        unlockLevel: unlockTier(1),
        itemCosts: { cloth: 2 },
        itemRewards: withRewards({ garment: 1 })
    },
    {
        id: "tailoring_sturdy_weave",
        skillId: "Tailoring",
        name: "Sturdy Weave",
        unlockLevel: unlockTier(10),
        itemCosts: { cloth: 3 },
        itemRewards: withRewards({ garment: 2 })
    },
    {
        id: "tailoring_leather_trim",
        skillId: "Tailoring",
        name: "Leather Trim",
        unlockLevel: unlockTier(20),
        itemCosts: { cloth: 2, leather: 1 },
        itemRewards: withRewards({ garment: 3 })
    },
    {
        id: "tailoring_heroic_raiment",
        skillId: "Tailoring",
        name: "Heroic Raiment",
        unlockLevel: unlockTier(30),
        itemCosts: { cloth: 4, leather: 2 },
        itemRewards: withRewards({ garment: 4 })
    }
];
