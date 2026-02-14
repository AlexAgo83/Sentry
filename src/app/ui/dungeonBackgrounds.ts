const DUNGEON_BACKGROUND_BY_ID: Record<string, string> = {
    dungeon_ruines_humides: "dungeon_001",
    dungeon_cryptes_dos: "dungeon_001",
    dungeon_forges_brisees: "dungeon_001",
    dungeon_sanctuaire_noir: "dungeon_002",
    dungeon_citadelle_rouge: "dungeon_002",
    dungeon_bastion_ardent: "dungeon_002",
    dungeon_gouffre_abyssal: "dungeon_003",
    dungeon_trone_braise: "dungeon_003",
    dungeon_cloitre_sans_nuit: "dungeon_004",
    dungeon_aiguille_givre: "dungeon_004"
};

const DEFAULT_DUNGEON_BACKGROUND = "dungeon_001";

export const getDungeonBackgroundUrl = (dungeonId: string | null | undefined): string => {
    const slug = dungeonId ? (DUNGEON_BACKGROUND_BY_ID[dungeonId] ?? DEFAULT_DUNGEON_BACKGROUND) : DEFAULT_DUNGEON_BACKGROUND;
    return `/img/backgrounds/dungeons/${slug}.webp`;
};
