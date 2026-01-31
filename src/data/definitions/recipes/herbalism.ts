import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const herbalismRecipes: RecipeDefinition[] = [
    {
        id: "herbalism_gather_sprigs",
        skillId: "Herbalism",
        name: "Gather Sprigs",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ herbs: 1 })
    },
    {
        id: "herbalism_foraged_bundles",
        skillId: "Herbalism",
        name: "Foraged Bundles",
        unlockLevel: unlockTier(10),
        itemRewards: withRewards({ herbs: 2 })
    },
    {
        id: "herbalism_wild_harvest",
        skillId: "Herbalism",
        name: "Wild Harvest",
        unlockLevel: unlockTier(20),
        itemRewards: withRewards({ herbs: 3 })
    },
    {
        id: "herbalism_heroic_bloom",
        skillId: "Herbalism",
        name: "Heroic Bloom",
        unlockLevel: unlockTier(30),
        itemRewards: withRewards({ herbs: 4 })
    },
    {
        id: "herbalism_brew_tea",
        skillId: "Herbalism",
        name: "Brew Tea",
        unlockLevel: unlockTier(1),
        itemCosts: { herbs: 2 },
        itemRewards: withRewards({ food: 1 })
    },
    {
        id: "herbalism_soothing_salve",
        skillId: "Herbalism",
        name: "Soothing Salve",
        unlockLevel: unlockTier(10),
        itemCosts: { herbs: 3 },
        itemRewards: withRewards({ food: 2 })
    },
    {
        id: "herbalism_infused_stew",
        skillId: "Herbalism",
        name: "Infused Stew",
        unlockLevel: unlockTier(20),
        itemCosts: { herbs: 2, meat: 1 },
        itemRewards: withRewards({ food: 3 })
    },
    {
        id: "herbalism_heroic_elixir",
        skillId: "Herbalism",
        name: "Heroic Elixir",
        unlockLevel: unlockTier(30),
        itemCosts: { herbs: 3, fish: 2 },
        itemRewards: withRewards({ food: 5 })
    }
];
