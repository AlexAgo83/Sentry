import type { DungeonDefinition, DungeonId } from "../core/types";

export const DUNGEON_DEFINITIONS: DungeonDefinition[] = [
    {
        id: "dungeon_ruines_humides",
        name: "Damp Ruins",
        tier: 1,
        floorCount: 10,
        recommendedPower: 900,
        bossName: "Fenwatch Brute",
        bossMechanic: "burst"
    },
    {
        id: "dungeon_cryptes_dos",
        name: "Bone Crypts",
        tier: 2,
        floorCount: 10,
        recommendedPower: 1300,
        bossName: "Bone Warden",
        bossMechanic: "poison"
    },
    {
        id: "dungeon_forges_brisees",
        name: "Broken Forges",
        tier: 3,
        floorCount: 10,
        recommendedPower: 1700,
        bossName: "Ash Forgemaster",
        bossMechanic: "shield"
    },
    {
        id: "dungeon_sanctuaire_noir",
        name: "Black Sanctuary",
        tier: 4,
        floorCount: 10,
        recommendedPower: 2200,
        bossName: "Night Herald",
        bossMechanic: "summon"
    },
    {
        id: "dungeon_citadelle_rouge",
        name: "Red Citadel",
        tier: 5,
        floorCount: 10,
        recommendedPower: 2700,
        bossName: "Crimson Warden",
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
