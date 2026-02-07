import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const metalworkRecipes: RecipeDefinition[] = [
    {
        id: "metalwork_ingot",
        skillId: "MetalWork",
        name: "Ingot Run",
        unlockLevel: unlockTier(1),
        itemCosts: { ore: 2 },
        itemRewards: withRewards({ ingot: 1 })
    },
    {
        id: "metalwork_crystal_smelting",
        skillId: "MetalWork",
        name: "Crystal Smelting",
        unlockLevel: unlockTier(10),
        itemCosts: { ore: 2, crystal: 1 },
        itemRewards: withRewards({ ingot: 2 })
    },
    {
        id: "metalwork_rusty_blade",
        skillId: "MetalWork",
        name: "Rusty Blade",
        unlockLevel: unlockTier(1),
        itemCosts: { ingot: 2, wood: 1 },
        itemRewards: withRewards({ rusty_blade: 1 })
    },
    {
        id: "metalwork_rusty_blade_refined",
        skillId: "MetalWork",
        name: "Refined Rusty Blade",
        unlockLevel: unlockTier(20),
        itemCosts: { ingot: 3, stone: 2 },
        itemRewards: withRewards({ rusty_blade_refined: 1 })
    },
    {
        id: "metalwork_rusty_blade_masterwork",
        skillId: "MetalWork",
        name: "Masterwork Rusty Blade",
        unlockLevel: unlockTier(30),
        itemCosts: { ingot: 4, tools: 1 },
        itemRewards: withRewards({ rusty_blade_masterwork: 1 })
    },
    {
        id: "metalwork_signet_ring",
        skillId: "MetalWork",
        name: "Signet Ring",
        unlockLevel: unlockTier(10),
        itemCosts: { ingot: 1, crystal: 1 },
        itemRewards: withRewards({ signet_ring: 1 })
    },
    {
        id: "metalwork_warding_amulet",
        skillId: "MetalWork",
        name: "Warding Amulet",
        unlockLevel: unlockTier(20),
        itemCosts: { ingot: 2, crystal: 2 },
        itemRewards: withRewards({ warding_amulet: 1 })
    },
    {
        id: "metalwork_blade",
        skillId: "MetalWork",
        name: "Blade Casting",
        unlockLevel: unlockTier(1),
        itemCosts: { ore: 3 },
        itemRewards: withRewards({ ingot: 2 })
    },
    {
        id: "metalwork_armor",
        skillId: "MetalWork",
        name: "Armor Forge",
        unlockLevel: unlockTier(10),
        itemCosts: { ore: 4 },
        itemRewards: withRewards({ tools: 1 })
    },
    {
        id: "metalwork_crystal_tools",
        skillId: "MetalWork",
        name: "Crystal Tools",
        unlockLevel: unlockTier(20),
        itemCosts: { ore: 4, crystal: 2 },
        itemRewards: withRewards({ tools: 2 })
    },
    {
        id: "metalwork_forged_tools",
        skillId: "MetalWork",
        name: "Forged Tools",
        unlockLevel: unlockTier(20),
        itemCosts: { ore: 5 },
        itemRewards: withRewards({ tools: 2 })
    },
    {
        id: "metalwork_heroic_artifact",
        skillId: "MetalWork",
        name: "Heroic Artifact",
        unlockLevel: unlockTier(30),
        itemCosts: { ore: 6, crystal: 1 },
        itemRewards: withRewards({ artifact: 1 })
    }
];
