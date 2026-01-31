import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const fishingRecipes: RecipeDefinition[] = [
    {
        id: "fishing_cast_net",
        skillId: "Fishing",
        name: "Cast Net",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ fish: 1 }),
        rareRewards: withRewards({ crystal: 1 })
    },
    {
        id: "fishing_river_shoal",
        skillId: "Fishing",
        name: "River Shoal",
        unlockLevel: unlockTier(10),
        itemRewards: withRewards({ fish: 2 }),
        rareRewards: withRewards({ crystal: 1 })
    },
    {
        id: "fishing_deep_trawl",
        skillId: "Fishing",
        name: "Deep Trawl",
        unlockLevel: unlockTier(20),
        itemRewards: withRewards({ fish: 3 }),
        rareRewards: withRewards({ crystal: 1 })
    },
    {
        id: "fishing_heroic_shoal",
        skillId: "Fishing",
        name: "Heroic Shoal",
        unlockLevel: unlockTier(30),
        itemRewards: withRewards({ fish: 4 }),
        rareRewards: withRewards({ crystal: 2 })
    },
    {
        id: "fishing_smoke_catch",
        skillId: "Fishing",
        name: "Smoke Catch",
        unlockLevel: unlockTier(1),
        itemCosts: { fish: 2 },
        itemRewards: withRewards({ food: 1 })
    },
    {
        id: "fishing_deep_catch",
        skillId: "Fishing",
        name: "Deep Catch",
        unlockLevel: unlockTier(10),
        itemCosts: { fish: 3 },
        itemRewards: withRewards({ food: 2 })
    },
    {
        id: "fishing_feast_platter",
        skillId: "Fishing",
        name: "Feast Platter",
        unlockLevel: unlockTier(20),
        itemCosts: { fish: 2, herbs: 1 },
        itemRewards: withRewards({ food: 3 })
    },
    {
        id: "fishing_heroic_haul",
        skillId: "Fishing",
        name: "Heroic Haul",
        unlockLevel: unlockTier(30),
        itemCosts: { fish: 4, herbs: 2 },
        itemRewards: withRewards({ food: 5 })
    }
];
