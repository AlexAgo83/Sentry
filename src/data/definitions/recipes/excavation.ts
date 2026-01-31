import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const excavationRecipes: RecipeDefinition[] = [
    {
        id: "excavate_shallow_vein",
        skillId: "Excavation",
        name: "Shallow Vein",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ stone: 1 })
    },
    {
        id: "excavate_deep_shaft",
        skillId: "Excavation",
        name: "Deep Shaft",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ ore: 1 })
    },
    {
        id: "excavate_ruins",
        skillId: "Excavation",
        name: "Forgotten Ruins",
        unlockLevel: unlockTier(10),
        itemRewards: withRewards({ stone: 2, ore: 1 })
    },
    {
        id: "excavate_crystal_cavern",
        skillId: "Excavation",
        name: "Crystal Cavern",
        unlockLevel: unlockTier(20),
        itemRewards: withRewards({ crystal: 1, ore: 1 })
    },
    {
        id: "excavate_heroic_descent",
        skillId: "Excavation",
        name: "Heroic Descent",
        unlockLevel: unlockTier(30),
        itemRewards: withRewards({ crystal: 2, ore: 2 })
    }
];
