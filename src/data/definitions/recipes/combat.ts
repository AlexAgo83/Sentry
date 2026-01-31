import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const combatRecipes: RecipeDefinition[] = [
    {
        id: "combat_skirmish",
        skillId: "Combat",
        name: "Border Skirmish",
        unlockLevel: unlockTier(1),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 1 })
    },
    {
        id: "combat_frontline",
        skillId: "Combat",
        name: "Frontline Clash",
        unlockLevel: unlockTier(1),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 1 })
    },
    {
        id: "combat_raider_assault",
        skillId: "Combat",
        name: "Raider Assault",
        unlockLevel: unlockTier(10),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 2 })
    },
    {
        id: "combat_warband_clash",
        skillId: "Combat",
        name: "Warband Clash",
        unlockLevel: unlockTier(20),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 3 })
    },
    {
        id: "combat_heroic_siege",
        skillId: "Combat",
        name: "Heroic Siege",
        unlockLevel: unlockTier(30),
        itemCosts: { food: 1 },
        itemRewards: withRewards({ bones: 4 })
    }
];
