import type { DungeonDefinition, DungeonId } from "../core/types";

export const DUNGEON_DEFINITIONS: DungeonDefinition[] = [
    {
        id: "dungeon_ruines_humides",
        name: "Ruines humides",
        tier: 1,
        floorCount: 10,
        recommendedPower: 900,
        bossName: "Fenwatch Brute",
        bossMechanic: "burst"
    },
    {
        id: "dungeon_cryptes_dos",
        name: "Cryptes d'os",
        tier: 2,
        floorCount: 10,
        recommendedPower: 1300,
        bossName: "Bone Warden",
        bossMechanic: "poison"
    },
    {
        id: "dungeon_forges_brisees",
        name: "Forges brisees",
        tier: 3,
        floorCount: 10,
        recommendedPower: 1700,
        bossName: "Ash Forgemaster",
        bossMechanic: "shield"
    },
    {
        id: "dungeon_sanctuaire_noir",
        name: "Sanctuaire noir",
        tier: 4,
        floorCount: 10,
        recommendedPower: 2200,
        bossName: "Night Herald",
        bossMechanic: "summon"
    },
    {
        id: "dungeon_citadelle_rouge",
        name: "Citadelle rouge",
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
