import type { RecipeDefinition } from "../../../core/types";
import { unlockTier, withRewards } from "./shared";

export const leatherworkingRecipes: RecipeDefinition[] = [
    {
        id: "leatherworking_tan_hides",
        skillId: "Leatherworking",
        name: "Tan Hides",
        unlockLevel: unlockTier(1),
        itemRewards: withRewards({ leather: 1 })
    },
    {
        id: "leatherworking_stretched_hides",
        skillId: "Leatherworking",
        name: "Stretched Hides",
        unlockLevel: unlockTier(10),
        itemRewards: withRewards({ leather: 2 })
    },
    {
        id: "leatherworking_oiled_leather",
        skillId: "Leatherworking",
        name: "Oiled Leather",
        unlockLevel: unlockTier(20),
        itemRewards: withRewards({ leather: 3 })
    },
    {
        id: "leatherworking_heroic_tan",
        skillId: "Leatherworking",
        name: "Heroic Tan",
        unlockLevel: unlockTier(30),
        itemRewards: withRewards({ leather: 4 })
    },
    {
        id: "leatherworking_master_tannery",
        skillId: "Leatherworking",
        name: "Master Tannery",
        unlockLevel: unlockTier(40),
        itemRewards: withRewards({ leather: 6 })
    },
    {
        id: "leatherworking_legendary_tannery",
        skillId: "Leatherworking",
        name: "Legendary Tannery",
        unlockLevel: unlockTier(60),
        itemRewards: withRewards({ leather: 8 })
    },
    {
        id: "leatherworking_mythic_tannery",
        skillId: "Leatherworking",
        name: "Mythic Tannery",
        unlockLevel: unlockTier(80),
        itemRewards: withRewards({ leather: 10 })
    },
    {
        id: "leatherworking_leather_gloves",
        skillId: "Leatherworking",
        name: "Leather Gloves",
        unlockLevel: unlockTier(1),
        itemCosts: { leather: 3 },
        itemRewards: withRewards({ leather_gloves: 1 })
    },
    {
        id: "leatherworking_simple_boots",
        skillId: "Leatherworking",
        name: "Simple Boots",
        unlockLevel: unlockTier(1),
        itemCosts: { leather: 3, cloth: 1 },
        itemRewards: withRewards({ simple_boots: 1 })
    },
    {
        id: "leatherworking_hide_hood",
        skillId: "Leatherworking",
        name: "Hide Hood",
        unlockLevel: unlockTier(10),
        itemCosts: { leather: 4, cloth: 1 },
        itemRewards: withRewards({ hide_hood: 1 })
    },
    {
        id: "leatherworking_hardened_jerkin",
        skillId: "Leatherworking",
        name: "Hardened Jerkin",
        unlockLevel: unlockTier(20),
        itemCosts: { leather: 5, cloth: 2 },
        itemRewards: withRewards({ hardened_jerkin: 1 })
    },
    {
        id: "leatherworking_studded_leggings",
        skillId: "Leatherworking",
        name: "Studded Leggings",
        unlockLevel: unlockTier(20),
        itemCosts: { leather: 4, cloth: 1 },
        itemRewards: withRewards({ studded_leggings: 1 })
    },
    {
        id: "leatherworking_tanned_mantle",
        skillId: "Leatherworking",
        name: "Tanned Mantle",
        unlockLevel: unlockTier(10),
        itemCosts: { leather: 4, cloth: 1 },
        itemRewards: withRewards({ tanned_mantle: 1 })
    },
    {
        id: "leatherworking_basic_armor",
        skillId: "Leatherworking",
        name: "Basic Armor",
        unlockLevel: unlockTier(1),
        itemCosts: { leather: 2 },
        itemRewards: withRewards({ armor: 1 })
    },
    {
        id: "leatherworking_sturdy_buckle",
        skillId: "Leatherworking",
        name: "Sturdy Buckle",
        unlockLevel: unlockTier(10),
        itemCosts: { leather: 3 },
        itemRewards: withRewards({ armor: 2 })
    },
    {
        id: "leatherworking_travel_gear",
        skillId: "Leatherworking",
        name: "Travel Gear",
        unlockLevel: unlockTier(20),
        itemCosts: { leather: 3, cloth: 1 },
        itemRewards: withRewards({ armor: 3 })
    },
    {
        id: "leatherworking_heroic_plate",
        skillId: "Leatherworking",
        name: "Heroic Plate",
        unlockLevel: unlockTier(30),
        itemCosts: { leather: 5, cloth: 2 },
        itemRewards: withRewards({ armor: 4 })
    },
    {
        id: "leatherworking_studded_harness",
        skillId: "Leatherworking",
        name: "Studded Harness",
        unlockLevel: unlockTier(40),
        itemCosts: { leather: 6, cloth: 2 },
        itemRewards: withRewards({ armor: 5 })
    },
    {
        id: "leatherworking_reinforced_brigandine",
        skillId: "Leatherworking",
        name: "Reinforced Brigandine",
        unlockLevel: unlockTier(60),
        itemCosts: { leather: 8, cloth: 3 },
        itemRewards: withRewards({ armor: 7 })
    },
    {
        id: "leatherworking_mythic_warhide",
        skillId: "Leatherworking",
        name: "Mythic Warhide",
        unlockLevel: unlockTier(80),
        itemCosts: { leather: 10, cloth: 4 },
        itemRewards: withRewards({ armor: 9 })
    }
];
