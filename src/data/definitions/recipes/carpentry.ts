import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const carpentryRecipes: RecipeDefinition[] = [
    {
        id: "carpentry_chop_wood",
        skillId: "Carpentry",
        name: "Chop Wood",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ wood: 1 })
    },
    {
        id: "carpentry_fell_timber",
        skillId: "Carpentry",
        name: "Fell Timber",
        unlockLevel: unlockTier(10),
        itemRewards: withRewards({ wood: 2 })
    },
    {
        id: "carpentry_saw_logs",
        skillId: "Carpentry",
        name: "Saw Logs",
        unlockLevel: unlockTier(20),
        itemRewards: withRewards({ wood: 3 })
    },
    {
        id: "carpentry_heroic_lumber",
        skillId: "Carpentry",
        name: "Heroic Lumber",
        unlockLevel: unlockTier(30),
        itemRewards: withRewards({ wood: 4 })
    },
    {
        id: "carpentry_simple_bow",
        skillId: "Carpentry",
        name: "Simple Bow",
        unlockLevel: unlockTier(1),
        itemCosts: { wood: 3, leather: 1 },
        itemRewards: withRewards({ simple_bow: 1 })
    },
    {
        id: "carpentry_simple_bow_refined",
        skillId: "Carpentry",
        name: "Refined Simple Bow",
        unlockLevel: unlockTier(20),
        itemCosts: { wood: 4, cloth: 2 },
        itemRewards: withRewards({ simple_bow_refined: 1 })
    },
    {
        id: "carpentry_simple_bow_masterwork",
        skillId: "Carpentry",
        name: "Masterwork Simple Bow",
        unlockLevel: unlockTier(30),
        itemCosts: { wood: 5, tools: 1 },
        itemRewards: withRewards({ simple_bow_masterwork: 1 })
    },
    {
        id: "carpentry_apprentice_staff",
        skillId: "Carpentry",
        name: "Apprentice Staff",
        unlockLevel: unlockTier(1),
        itemCosts: { wood: 2, crystal: 1 },
        itemRewards: withRewards({ apprentice_staff: 1 })
    },
    {
        id: "carpentry_apprentice_staff_refined",
        skillId: "Carpentry",
        name: "Refined Apprentice Staff",
        unlockLevel: unlockTier(20),
        itemCosts: { wood: 2, crystal: 2, herbs: 1 },
        itemRewards: withRewards({ apprentice_staff_refined: 1 })
    },
    {
        id: "carpentry_apprentice_staff_masterwork",
        skillId: "Carpentry",
        name: "Masterwork Apprentice Staff",
        unlockLevel: unlockTier(30),
        itemCosts: { wood: 2, crystal: 3, artifact: 1 },
        itemRewards: withRewards({ apprentice_staff_masterwork: 1 })
    },
    {
        id: "carpentry_simple_furniture",
        skillId: "Carpentry",
        name: "Simple Furniture",
        unlockLevel: unlockTier(1),
        itemCosts: { wood: 2 },
        itemRewards: withRewards({ furniture: 1 })
    },
    {
        id: "carpentry_fitted_planks",
        skillId: "Carpentry",
        name: "Fitted Planks",
        unlockLevel: unlockTier(10),
        itemCosts: { wood: 3 },
        itemRewards: withRewards({ furniture: 2 })
    },
    {
        id: "carpentry_reinforced_frames",
        skillId: "Carpentry",
        name: "Reinforced Frames",
        unlockLevel: unlockTier(20),
        itemCosts: { wood: 3, leather: 1 },
        itemRewards: withRewards({ furniture: 3 })
    },
    {
        id: "carpentry_heroic_siegeworks",
        skillId: "Carpentry",
        name: "Heroic Siegeworks",
        unlockLevel: unlockTier(30),
        itemCosts: { wood: 5, cloth: 2 },
        itemRewards: withRewards({ furniture: 4 })
    }
];
