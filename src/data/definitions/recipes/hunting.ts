import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const huntingRecipes: RecipeDefinition[] = [
    {
        id: "hunt_small_game",
        skillId: "Hunting",
        name: "Woodland Critters",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ meat: 1, bones: 1 })
    },
    {
        id: "hunt_large_game",
        skillId: "Hunting",
        name: "Dire Quarry",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ meat: 2, bones: 1 })
    },
    {
        id: "hunt_feral_pack",
        skillId: "Hunting",
        name: "Feral Pack",
        unlockLevel: unlockTier(10),
        itemRewards: withRewards({ meat: 3, bones: 2 })
    },
    {
        id: "hunt_mountain_stag",
        skillId: "Hunting",
        name: "Mountain Stag",
        unlockLevel: unlockTier(20),
        itemRewards: withRewards({ meat: 4, bones: 2 })
    },
    {
        id: "hunt_heroic_beast",
        skillId: "Hunting",
        name: "Heroic Beast",
        unlockLevel: unlockTier(30),
        itemRewards: withRewards({ meat: 5, bones: 3 })
    }
];
