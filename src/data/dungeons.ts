import type { DungeonDefinition, DungeonId } from "../core/types";

export const DUNGEON_DEFINITIONS: DungeonDefinition[] = [
    {
        id: "dungeon_ruines_humides",
        name: "Damp Ruins",
        tier: 1,
        floorCount: 10,
        recommendedPower: 1,
        bossName: "Fenwatch Brute",
        bossMechanic: "burst"
    },
    {
        id: "dungeon_cryptes_dos",
        name: "Bone Crypts",
        tier: 2,
        floorCount: 10,
        recommendedPower: 5,
        bossName: "Bone Warden",
        bossMechanic: "poison"
    },
    {
        id: "dungeon_forges_brisees",
        name: "Broken Forges",
        tier: 3,
        floorCount: 10,
        recommendedPower: 10,
        bossName: "Ash Forgemaster",
        bossMechanic: "shield"
    },
    {
        id: "dungeon_sanctuaire_noir",
        name: "Black Sanctuary",
        tier: 4,
        floorCount: 10,
        recommendedPower: 15,
        bossName: "Night Herald",
        bossMechanic: "summon"
    },
    {
        id: "dungeon_citadelle_rouge",
        name: "Red Citadel",
        tier: 5,
        floorCount: 10,
        recommendedPower: 20,
        bossName: "Crimson Warden",
        bossMechanic: "enrage"
    },
    {
        id: "dungeon_bastion_ardent",
        name: "Ember Bastion",
        tier: 6,
        floorCount: 10,
        recommendedPower: 25,
        bossName: "Cinder Sovereign",
        bossMechanic: "burst"
    },
    {
        id: "dungeon_gouffre_abyssal",
        name: "Abyssal Depths",
        tier: 7,
        floorCount: 10,
        recommendedPower: 30,
        bossName: "Abyssal Reaper",
        bossMechanic: "poison"
    },
    {
        id: "dungeon_trone_braise",
        name: "Ember Throne",
        tier: 8,
        floorCount: 10,
        recommendedPower: 35,
        bossName: "Ashen Monarch",
        bossMechanic: "shield"
    },
    {
        id: "dungeon_cloitre_sans_nuit",
        name: "Nightless Cloister",
        tier: 9,
        floorCount: 10,
        recommendedPower: 40,
        bossName: "Umbral Choir",
        bossMechanic: "summon"
    },
    {
        id: "dungeon_aiguille_givre",
        name: "Frostspire Apex",
        tier: 10,
        floorCount: 10,
        recommendedPower: 45,
        bossName: "Glacier Tyrant",
        bossMechanic: "enrage"
    }
];

const DUNGEON_BY_ID = DUNGEON_DEFINITIONS.reduce<Record<DungeonId, DungeonDefinition>>((acc, dungeon) => {
    acc[dungeon.id] = dungeon;
    return acc;
}, {} as Record<DungeonId, DungeonDefinition>);

export const getDungeonDefinition = (dungeonId: DungeonId): DungeonDefinition | undefined => {
    return DUNGEON_BY_ID[dungeonId];
};
