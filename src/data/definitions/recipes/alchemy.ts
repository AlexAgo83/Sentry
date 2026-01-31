import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const alchemyRecipes: RecipeDefinition[] = [
    {
        id: "alchemy_collect_reagents",
        skillId: "Alchemy",
        name: "Collect Reagents",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ herbs: 1 })
    },
    {
        id: "alchemy_minor_tonic",
        skillId: "Alchemy",
        name: "Minor Tonic",
        unlockLevel: unlockTier(1),
        itemCosts: { herbs: 2 },
        itemRewards: withRewards({ tonic: 1 })
    },
    {
        id: "alchemy_distill_essence",
        skillId: "Alchemy",
        name: "Distill Essence",
        unlockLevel: unlockTier(10),
        itemCosts: { herbs: 3 },
        itemRewards: withRewards({ elixir: 1 })
    },
    {
        id: "alchemy_muted_vial",
        skillId: "Alchemy",
        name: "Muted Vial",
        unlockLevel: unlockTier(20),
        itemCosts: { herbs: 2, fish: 1 },
        itemRewards: withRewards({ elixir: 2 })
    },
    {
        id: "alchemy_heroic_phial",
        skillId: "Alchemy",
        name: "Heroic Phial",
        unlockLevel: unlockTier(30),
        itemCosts: { herbs: 4, food: 1 },
        itemRewards: withRewards({ potion: 1 })
    }
];
