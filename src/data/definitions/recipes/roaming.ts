import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const roamingRecipes: RecipeDefinition[] = [
    {
        id: "roaming_skirmish",
        skillId: "Roaming",
        name: "Border Skirmish",
        unlockLevel: unlockTier(1),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 1 })
    },
    {
        id: "roaming_frontline",
        skillId: "Roaming",
        name: "Frontline Clash",
        unlockLevel: unlockTier(1),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 1 })
    },
    {
        id: "roaming_raider_assault",
        skillId: "Roaming",
        name: "Raider Assault",
        unlockLevel: unlockTier(10),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 2 })
    },
    {
        id: "roaming_warband_clash",
        skillId: "Roaming",
        name: "Warband Clash",
        unlockLevel: unlockTier(20),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 3 })
    },
    {
        id: "roaming_heroic_siege",
        skillId: "Roaming",
        name: "Heroic Siege",
        unlockLevel: unlockTier(30),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 4 })
    }
];
