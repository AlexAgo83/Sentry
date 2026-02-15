import { validateDungeonDefinitionsLootTables } from "../core/dungeon/loot";
import type { DungeonDefinition, DungeonId, ItemId } from "../core/types";
import { ITEM_DEFINITIONS } from "./definitions/items";

const createDungeonLootTable = (
    primaryCommonItemId: ItemId,
    secondaryCommonItemId: ItemId,
    utilityItemId: ItemId,
    rareBaseItemId: ItemId,
    rareExclusiveItemId: ItemId
): DungeonDefinition["lootTable"] => ({
    rewardsPerClear: 1,
    entries: [
        { itemId: primaryCommonItemId, weight: 36, quantityMin: 1, quantityMax: 1 },
        { itemId: secondaryCommonItemId, weight: 32, quantityMin: 1, quantityMax: 1 },
        { itemId: utilityItemId, weight: 22, quantityMin: 1, quantityMax: 2 },
        { itemId: rareBaseItemId, weight: 8, quantityMin: 1, quantityMax: 1 },
        { itemId: rareExclusiveItemId, weight: 2, quantityMin: 1, quantityMax: 1 }
    ]
});

export const DUNGEON_DEFINITIONS: DungeonDefinition[] = [
    {
        id: "dungeon_ruines_humides",
        name: "Damp Ruins",
        tier: 1,
        floorCount: 10,
        recommendedPower: 1,
        bossName: "Fenwatch Brute",
        bossMechanic: "burst",
        lootTable: createDungeonLootTable(
            "traveler_cape",
            "simple_boots",
            "food",
            "signet_ring",
            "ruins_luck_loop"
        )
    },
    {
        id: "dungeon_cryptes_dos",
        name: "Bone Crypts",
        tier: 2,
        floorCount: 10,
        recommendedPower: 5,
        bossName: "Bone Warden",
        bossMechanic: "poison",
        lootTable: createDungeonLootTable(
            "hide_hood",
            "linen_tunic",
            "tonic",
            "warding_amulet",
            "cryptbone_charm"
        )
    },
    {
        id: "dungeon_forges_brisees",
        name: "Broken Forges",
        tier: 3,
        floorCount: 10,
        recommendedPower: 10,
        bossName: "Ash Forgemaster",
        bossMechanic: "shield",
        lootTable: createDungeonLootTable(
            "iron_helm",
            "iron_greaves",
            "potion",
            "signet_ring",
            "forgeheart_band"
        )
    },
    {
        id: "dungeon_sanctuaire_noir",
        name: "Black Sanctuary",
        tier: 4,
        floorCount: 10,
        recommendedPower: 15,
        bossName: "Night Herald",
        bossMechanic: "summon",
        lootTable: createDungeonLootTable(
            "iron_cuirass",
            "iron_boots",
            "elixir",
            "warding_amulet",
            "nightveil_pendant"
        )
    },
    {
        id: "dungeon_citadelle_rouge",
        name: "Red Citadel",
        tier: 5,
        floorCount: 10,
        recommendedPower: 20,
        bossName: "Crimson Warden",
        bossMechanic: "enrage",
        lootTable: createDungeonLootTable(
            "forged_gauntlets",
            "hardened_jerkin",
            "potion",
            "signet_ring",
            "citadel_bloodseal"
        )
    },
    {
        id: "dungeon_bastion_ardent",
        name: "Ember Bastion",
        tier: 6,
        floorCount: 10,
        recommendedPower: 25,
        bossName: "Cinder Sovereign",
        bossMechanic: "burst",
        lootTable: createDungeonLootTable(
            "rusty_blade_refined",
            "simple_bow_refined",
            "elixir",
            "warding_amulet",
            "ember_oath_talisman"
        )
    },
    {
        id: "dungeon_gouffre_abyssal",
        name: "Abyssal Depths",
        tier: 7,
        floorCount: 10,
        recommendedPower: 30,
        bossName: "Abyssal Reaper",
        bossMechanic: "poison",
        lootTable: createDungeonLootTable(
            "rusty_blade_masterwork",
            "simple_bow_masterwork",
            "potion",
            "signet_ring",
            "abyssal_orbit"
        )
    },
    {
        id: "dungeon_trone_braise",
        name: "Ember Throne",
        tier: 8,
        floorCount: 10,
        recommendedPower: 35,
        bossName: "Ashen Monarch",
        bossMechanic: "shield",
        lootTable: createDungeonLootTable(
            "apprentice_staff_refined",
            "iron_cuirass",
            "elixir",
            "warding_amulet",
            "thronebrand_amulet"
        )
    },
    {
        id: "dungeon_cloitre_sans_nuit",
        name: "Nightless Cloister",
        tier: 9,
        floorCount: 10,
        recommendedPower: 40,
        bossName: "Umbral Choir",
        bossMechanic: "summon",
        lootTable: createDungeonLootTable(
            "apprentice_staff_masterwork",
            "forged_gauntlets",
            "potion",
            "signet_ring",
            "nightless_sigil"
        )
    },
    {
        id: "dungeon_aiguille_givre",
        name: "Frostspire Apex",
        tier: 10,
        floorCount: 10,
        recommendedPower: 45,
        bossName: "Glacier Tyrant",
        bossMechanic: "enrage",
        lootTable: createDungeonLootTable(
            "apprentice_staff_masterwork",
            "iron_boots",
            "elixir",
            "warding_amulet",
            "frostspire_relic"
        )
    }
];

const KNOWN_ITEM_IDS = new Set(ITEM_DEFINITIONS.map((item) => item.id));
validateDungeonDefinitionsLootTables(DUNGEON_DEFINITIONS, KNOWN_ITEM_IDS);

const DUNGEON_BY_ID = DUNGEON_DEFINITIONS.reduce<Record<DungeonId, DungeonDefinition>>((acc, dungeon) => {
    acc[dungeon.id] = dungeon;
    return acc;
}, {} as Record<DungeonId, DungeonDefinition>);

export const getDungeonDefinition = (dungeonId: DungeonId): DungeonDefinition | undefined => {
    return DUNGEON_BY_ID[dungeonId];
};
