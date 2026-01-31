import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const cookingRecipes: RecipeDefinition[] = [
    {
        id: "cook_campfire_stew",
        skillId: "Cooking",
        name: "Campfire Stew",
        unlockLevel: unlockTier(1),
        itemCosts: { meat: 1 },
        itemRewards: withRewards({ food: 1 })
    },
    {
        id: "cook_smoked_rations",
        skillId: "Cooking",
        name: "Smoked Rations",
        unlockLevel: unlockTier(1),
        itemCosts: { meat: 2 },
        itemRewards: withRewards({ food: 2 })
    },
    {
        id: "cook_sea_broth",
        skillId: "Cooking",
        name: "Sea Broth",
        unlockLevel: unlockTier(10),
        itemCosts: { meat: 1, fish: 1 },
        itemRewards: withRewards({ food: 3 })
    },
    {
        id: "cook_herb_roast",
        skillId: "Cooking",
        name: "Herb Roast",
        unlockLevel: unlockTier(20),
        itemCosts: { meat: 2, herbs: 1 },
        itemRewards: withRewards({ food: 4 })
    },
    {
        id: "cook_heroic_feast",
        skillId: "Cooking",
        name: "Heroic Feast",
        unlockLevel: unlockTier(30),
        itemCosts: { meat: 3, fish: 2, herbs: 2 },
        itemRewards: withRewards({ food: 7 })
    }
];
